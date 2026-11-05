import React, { useEffect, useState } from "react";
import {
  describePhotoLimit,
  newPhotoFromFile,
  storagePublicUrl,
  validateImageFile,
} from "./lib/productImages.js";

/* One photo tile. New photos get a temporary browser preview URL that
   this component creates and revokes itself, so removed or discarded
   photos never leak memory or leave stale previews behind. */
function PhotoTile({ photo, index, disabled, onLabelChange, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const file = photo.kind === "new" ? photo.file : null;

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const imageUrl = photo.kind === "new" ? previewUrl : storagePublicUrl(photo.src);

  return (
    <li className="admin-photo-tile">
      <div className="admin-photo-frame">
        {imageUrl ? (
          <img src={imageUrl} alt={`Photo ${index + 1} preview`} />
        ) : (
          <span>No preview</span>
        )}
        {index === 0 && <b className="admin-photo-badge">MAIN</b>}
        {photo.kind === "new" && <b className="admin-photo-badge admin-photo-badge-new">NEW</b>}
      </div>
      <input
        type="text"
        value={photo.label}
        onChange={(event) => onLabelChange(photo.id, event.target.value)}
        placeholder={`Label (Photo ${index + 1})`}
        aria-label={`Label for photo ${index + 1}`}
        maxLength={40}
        disabled={disabled}
      />
      <button
        type="button"
        className="admin-photo-remove"
        onClick={() => onRemove(photo.id)}
        disabled={disabled}
        aria-label={`Remove photo ${index + 1}`}
      >
        REMOVE
      </button>
    </li>
  );
}

/* Controlled picker. The parent owns `photos` (see photosFromProduct and
   newPhotoFromFile in lib/productImages.js) and saves them. Nothing is
   uploaded here: files are only validated, previewed and listed. */
export default function ProductImagePicker({
  inputId,
  photos,
  onChange,
  maxPhotos,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const atLimit = maxPhotos != null && photos.length >= maxPhotos;

  function handleSelect(event) {
    const input = event.target;
    const files = Array.from(input.files || []);
    input.value = ""; // allows choosing the same file again after removing it

    if (!files.length) return;

    const problems = [];
    const accepted = [];

    for (const file of files) {
      const problem = validateImageFile(file);
      if (problem) problems.push(problem);
      else accepted.push(file);
    }

    const room = maxPhotos == null ? accepted.length : Math.max(0, maxPhotos - photos.length);
    const kept = accepted.slice(0, room);
    const skipped = accepted.length - kept.length;

    if (skipped > 0) {
      problems.push(
        `Only ${describePhotoLimit(maxPhotos)} allowed per product, so ${skipped} file(s) were not added.`
      );
    }

    if (kept.length) {
      onChange([...photos, ...kept.map((file) => newPhotoFromFile(file))]);
    }
    setMessage(problems.join(" "));
  }

  function handleLabelChange(id, label) {
    onChange(photos.map((photo) => (photo.id === id ? { ...photo, label } : photo)));
  }

  function handleRemove(id) {
    onChange(photos.filter((photo) => photo.id !== id));
    setMessage("");
  }

  return (
    <div className="admin-photo-picker">
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        disabled={disabled || atLimit}
      />
      <p className="admin-editor-hint">
        Each image must be under 5 MB. This product can have {describePhotoLimit(maxPhotos)}
        {photos.length > 0 ? ` (${photos.length} selected)` : ""}. The first photo is the main
        shop photo.
      </p>

      {message && <p className="admin-error" role="alert">{message}</p>}

      {photos.length > 0 && (
        <ul className="admin-photo-grid">
          {photos.map((photo, index) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              index={index}
              disabled={disabled}
              onLabelChange={handleLabelChange}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
