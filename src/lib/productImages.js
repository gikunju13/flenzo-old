import { supabase } from "./supabase.js";

export const IMAGE_BUCKET = "flenzo-images";
export const IMAGE_FOLDER = "products";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/* Gallery size limit.
   null means unlimited. The admin is meant to choose one of
   PHOTO_LIMIT_OPTIONS eventually, but that choice is NOT stored
   anywhere yet: the site_settings table has RLS enabled and its
   write permissions have not been verified. Until that is done,
   DEFAULT_PHOTO_LIMIT is a plain code constant. */
export const PHOTO_LIMIT_OPTIONS = [3, 5, null];
export const DEFAULT_PHOTO_LIMIT = 5;

let photoSequence = 0;
function nextPhotoId(kind) {
  photoSequence += 1;
  return `${kind}-${Date.now().toString(36)}-${photoSequence}`;
}

export function describePhotoLimit(maxPhotos) {
  return maxPhotos == null ? "unlimited photos" : `up to ${maxPhotos} photos`;
}

/* Public URL for a stored image path, using the same rules the
   storefront uses: paths under products/ are used as they are,
   anything else is treated as a file at the bucket root. */
export function storagePublicUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const cleaned = String(path).replace(/^\/+/, "");
  const filename = cleaned.split("/").filter(Boolean).pop();
  if (!filename) return "";

  const storagePath = cleaned.startsWith(`${IMAGE_FOLDER}/`) ? cleaned : filename;
  if (!supabase) return "";
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

/* One rule set for every stored product image path, used by both the
   storefront and the admin:
     - full URLs (http/https, data:image) and paths starting with "/" are
       used as they are (existing local files such as
       /flenzo/products/white-tee-front.jpeg)
     - "flenzo/..." without the leading slash is the same local file
     - anything else is a Supabase Storage path (products/..., or a bare
       filename in the bucket root), resolved by storagePublicUrl
   Returns "" for anything that is not a usable path. */
export function resolveImageSrc(raw) {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  if (/^(https?:|data:image\/)/i.test(value) || value.startsWith("/")) return value;
  if (/^flenzo\//i.test(value)) return `/${value}`;
  return storagePublicUrl(value);
}

/* Turns a product row into the editable photo list.
   Falls back to image_url for products that have no gallery yet. */
export function photosFromProduct(product) {
  const gallery = Array.isArray(product?.images) ? product.images : [];
  const items = [];

  for (const entry of gallery) {
    const src = typeof entry === "string" ? entry : entry?.src;
    if (!src) continue;
    items.push({
      id: nextPhotoId("existing"),
      kind: "existing",
      src,
      label: typeof entry === "object" && entry?.label ? String(entry.label) : "",
    });
  }

  if (!items.length && product?.image_url) {
    items.push({
      id: nextPhotoId("existing"),
      kind: "existing",
      src: product.image_url,
      label: "",
    });
  }

  return items;
}

export function newPhotoFromFile(file) {
  return { id: nextPhotoId("new"), kind: "new", file, label: "" };
}

/* Returns an error message for one file, or "" when it is fine. */
export function validateImageFile(file) {
  if (!file || !String(file.type || "").startsWith("image/")) {
    return `"${file?.name || "File"}" is not an image file.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is larger than 5 MB.`;
  }
  return "";
}

/* Re-checks every new file in the list (used again at save time)
   and the overall photo count. Returns "" when everything is valid. */
export function validatePhotos(photos, maxPhotos) {
  const newPhotos = photos.filter((photo) => photo.kind === "new");

  for (const photo of newPhotos) {
    const message = validateImageFile(photo.file);
    if (message) return message;
  }

  if (maxPhotos != null && newPhotos.length > 0 && photos.length > maxPhotos) {
    return `A product can have ${describePhotoLimit(maxPhotos)}. Remove ${photos.length - maxPhotos} photo(s) before saving.`;
  }

  return "";
}

function safeFileName(name) {
  return (
    String(name || "")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product-image"
  );
}

/* The part of a photo list that is saved to the database. */
export function gallerySignature(photos) {
  return JSON.stringify(
    photos.map((photo) =>
      photo.kind === "new" ? ["new", photo.id] : [photo.src, photo.label || ""]
    )
  );
}

/* Uploads every new photo to flenzo-images/products/ and returns:
     images        [{ src, label }, ...] in display order
     uploadedPaths Storage paths created by this call
   Existing photos keep their stored src untouched. If any upload
   fails, files already uploaded by this call are removed and the
   error is rethrown, so nothing is left half-saved. */
export async function uploadGallery(photos) {
  const uploadedPaths = [];
  const images = [];

  try {
    for (let index = 0; index < photos.length; index += 1) {
      const photo = photos[index];
      const label = photo.label?.trim() || `Photo ${index + 1}`;

      if (photo.kind === "existing") {
        images.push({ src: photo.src, label });
        continue;
      }

      const randomPart = Math.random().toString(36).slice(2, 8);
      const path = `${IMAGE_FOLDER}/${Date.now()}-${index}-${randomPart}-${safeFileName(photo.file.name)}`;

      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, photo.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: photo.file.type,
        });

      if (error) throw error;

      uploadedPaths.push(path);
      images.push({ src: path, label });
    }
  } catch (error) {
    await removeUploadedFiles(uploadedPaths);
    throw error;
  }

  return { images, uploadedPaths };
}

/* Best-effort cleanup of files uploaded during a failed save. */
export async function removeUploadedFiles(paths) {
  if (!paths?.length) return;
  try {
    await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  } catch {
    /* Cleanup is best effort; the save error is what matters. */
  }
}
