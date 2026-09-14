import "server-only";

import { db, patch } from "./records";
import type { WardrobeItem } from "@/lib/wardrobe";

export async function processUploadedImage(itemId: string, side: "front" | "back", sourcePath: string) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) return false;

  const { data: source, error: downloadError } = await db().storage.from("closet-private").download(sourcePath);
  if (downloadError || !source) throw new Error("Could not open the uploaded clothing photo.");

  const form = new FormData();
  form.append("image_file", source, `${side}.webp`);
  form.append("size", "auto");
  form.append("format", "png");
  form.append("type", "product");
  form.append("crop", "original");
  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });
  if (!response.ok) throw new Error(`Background removal failed (${response.status}).`);
  const processed = await response.blob();
  const processedPath = `${itemId}/processed-${side}-${crypto.randomUUID()}.png`;
  const { error: uploadError } = await db().storage.from("closet-private").upload(processedPath, processed, {
    contentType: "image/png",
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) throw new Error("Could not save the cleaned clothing photo.");
  const field = side === "front" ? "frontProcessedPath" : "backProcessedPath";
  await patch<WardrobeItem>("item", itemId, { [field]: processedPath });
  return true;
}
