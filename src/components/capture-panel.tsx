"use client";

import { useEffect, useState } from "react";

export function CapturePanel() {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(file?: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setPreviewUrl(undefined);
      setFileName(undefined);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  return (
    <div className="capture-panel">
      <label className={previewUrl ? "capture-drop is-ready" : "capture-drop"}>
        {previewUrl ? (
          // A local object URL is intentionally used for a pre-upload camera preview.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="New clothing preview" />
        ) : (
          <>
            <span className="capture-icon" aria-hidden="true">
              +
            </span>
            <strong>Take a photo</strong>
            <p>Use the camera or choose a clear image from the phone.</p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>
      {fileName ? (
        <div className="capture-confirmation">
          <div>
            <p className="eyebrow">Ready to upload</p>
            <strong>{fileName}</strong>
          </div>
          <button type="button" className="button button--primary">
            Add to closet
          </button>
        </div>
      ) : null}
    </div>
  );
}
