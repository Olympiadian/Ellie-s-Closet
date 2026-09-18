import "server-only";

import { randomUUID } from "node:crypto";
import { db, patch, record } from "./records";
import { composeStandardImages, type StandardizedImages } from "@/lib/images/standardize";
import type { ImageProcessingInfo, WardrobeItem } from "@/lib/wardrobe";

type PhotoSide = "front" | "back";

const bucket = "closet-private";
function fieldsFor(side: PhotoSide) {
  return side === "front"
    ? { master: "frontProcessedPath" as const, thumbnail: "frontThumbnailPath" as const }
    : { master: "backProcessedPath" as const, thumbnail: "backThumbnailPath" as const };
}

function processingMessage() {
  return "Photo cleanup could not finish. The original photo is ready for review.";
}

async function setProcessingState(itemId: string, side: PhotoSide, state: ImageProcessingInfo) {
  const item = await record<WardrobeItem>("item", itemId);
  if (!item) return;
  await patch<WardrobeItem>("item", itemId, {
    imageProcessing: { ...item.imageProcessing, [side]: state },
  });
}

async function markFailed(itemId: string, side: PhotoSide) {
  try {
    const item = await record<WardrobeItem>("item", itemId);
    if (!item) return;
    const message = processingMessage();
    const issue = "Image cleanup failed — original photo kept";
    await patch<WardrobeItem>("item", itemId, {
      imageProcessing: {
        ...item.imageProcessing,
        [side]: { status: "failed", message, updatedAt: new Date().toISOString() },
      },
      issues: item.issues.includes(issue) ? item.issues : [...item.issues, issue].slice(0, 20),
    });
  } catch {
    // An unavailable database must never turn an uploaded original into a failed request.
  }
}

async function uploadDerivatives(itemId: string, side: PhotoSide, images: StandardizedImages) {
  const masterPath = `${itemId}/processed-${side}-${randomUUID()}.webp`;
  const thumbnailPath = `${itemId}/thumbnail-${side}-${randomUUID()}.webp`;
  const uploads = await Promise.all([
    db().storage.from(bucket).upload(masterPath, images.master, { contentType: "image/webp", cacheControl: "31536000", upsert: false }),
    db().storage.from(bucket).upload(thumbnailPath, images.thumbnail, { contentType: "image/webp", cacheControl: "31536000", upsert: false }),
  ]);
  if (uploads.some(({ error }) => error)) throw new Error("Could not save the standardized clothing images.");
  return { masterPath, thumbnailPath };
}

async function saveStandardizedImages(itemId: string, side: PhotoSide, images: StandardizedImages) {
  const paths = await uploadDerivatives(itemId, side, images);
  const item = await record<WardrobeItem>("item", itemId);
  if (!item) throw new Error("The uploaded clothing item no longer exists.");
  const fields = fieldsFor(side);
  await patch<WardrobeItem>("item", itemId, {
    [fields.master]: paths.masterPath,
    [fields.thumbnail]: paths.thumbnailPath,
    imageProcessing: {
      ...item.imageProcessing,
      [side]: { status: "ready", updatedAt: new Date().toISOString() },
    },
  });
  return paths;
}

async function download(path: string) {
  const { data, error } = await db().storage.from(bucket).download(path);
  if (error || !data) throw new Error("Could not open the uploaded clothing photo.");
  return Buffer.from(await data.arrayBuffer());
}

/** Standardizes a browser-produced or admin-supplied transparent cutout. */
export async function standardizeUploadedCutout(itemId: string, side: PhotoSide, sourcePath: string) {
  try {
    await setProcessingState(itemId, side, { status: "processing", message: "Standardizing cutout…", updatedAt: new Date().toISOString() });
    return await saveStandardizedImages(itemId, side, await composeStandardImages(await download(sourcePath)));
  } catch (error) {
    await markFailed(itemId, side);
    throw error;
  }
}
