import { supabase } from "./supabase.js";
import { MAX_IMAGE_BYTES, validateImageFile } from "./productImages.js";

const STORY_FOLDER = "stories";
const IMAGE_BUCKET = "flenzo-images";

function safeFileName(name) {
  return (
    String(name || "")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "story-image"
  );
}

export async function uploadStoryImage(file) {
  const validationError = validateImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Story images must be 5 MB or smaller.");
  }

  const randomPart = Math.random().toString(36).slice(2, 8);
  const path = `${STORY_FOLDER}/${Date.now()}-${randomPart}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  return path;
}

export async function removeStoryImage(path) {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith("/flenzo/")) {
    return;
  }

  const cleaned = path.replace(/^\/+/, "");
  if (!cleaned.startsWith(`${STORY_FOLDER}/`)) return;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .remove([cleaned]);

  if (error) throw error;
}
