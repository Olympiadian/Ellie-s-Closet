"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function requestJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, { method: body === undefined ? "GET" : "POST", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new ApiError(result.error || "Please try again.", response.status);
  return result as T;
}
export type ClothingPhotoProgress = {
  stage: "uploading-original" | "loading-model" | "downloading-model" | "removing-background" | "uploading-cutout";
  percent?: number;
};
export async function uploadPhoto(itemId: string, side: "front" | "back", file: File, processed = false) {
  if (file.size > 20971520) throw new Error("Each photo must be 20 MB or smaller.");
  const uploadFile: Blob = file;
  const contentType = file.type || (/\.heic$/i.test(file.name) ? "image/heic" : /\.heif$/i.test(file.name) ? "image/heif" : "");
  if (!["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"].includes(contentType)) throw new Error("Choose a JPEG, PNG, WebP, HEIC, or HEIF photo.");
  const upload = await requestJson<{ path: string; signedUrl: string; alreadySubmitted?: boolean }>("/api/uploads", { action: "prepare", itemId, side, processed, contentType, size: uploadFile.size });
  if (upload.alreadySubmitted) return;
  const form = new FormData();
  // Every object path is unique, so immutable cache metadata is safe and avoids repeat downloads.
  form.append("cacheControl", "31536000");
  form.append("", uploadFile, file.name);
  const response = await fetch(upload.signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body: form });
  if (!response.ok) throw new Error("The photo did not upload. Check your connection and try again.");
  await requestJson("/api/uploads", { action: "complete", itemId, side, processed, path: upload.path });
}

/** Keeps the original private, then creates and uploads a local transparent cutout. */
