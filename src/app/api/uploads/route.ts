import { randomUUID } from "node:crypto";
import { z } from "zod";
import { emptyItem, type WardrobeItem } from "@/lib/wardrobe";
import { activity, AppError, db, limit, patch, put, record } from "@/lib/server/records";
import { requireSession, sameOrigin } from "@/lib/server/session";
import { apiError, json } from "@/lib/server/http";
import { standardizeUploadedCutout } from "@/lib/server/remove-bg";
export const maxDuration = 120;

const schema = z.object({
  action: z.enum(["prepare", "complete", "finalize"]), itemId: z.string().uuid(),
  side: z.enum(["front", "back"]), processed: z.boolean(),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]).optional(),
  size: z.number().int().min(1).max(20971520).optional(), path: z.string().max(250).optional(),
});
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession();
    const body = schema.parse(await request.json());
    let item = await record<WardrobeItem>("item", body.itemId);
    if (!item) {
      if (body.action !== "prepare" || body.processed) throw new AppError("Item not found.", 404);
      await limit("new-items:" + current.role, 50, 86400);
      item = { ...emptyItem, id: body.itemId, status: "uploading", favorite: false, saved: false, createdAt: new Date().toISOString() };
      await put("item", item.id, item, true);
    }
    const hasReadyPhoto = Boolean(
      (item.frontPath && item.frontProcessedPath) || (item.backPath && item.backProcessedPath),
    );
    if (current.role !== "admin" && item.status !== "uploading") {
      // A completed request may lose its response on a mobile connection.
      // Retrying the same slot must not create a duplicate or overwrite a review.
      if (item.status === "pending" && hasReadyPhoto) return json({ alreadySubmitted: true });
      throw new AppError("This item has already been submitted.", 403);
    }
    if (body.action === "finalize") {
      if (!hasReadyPhoto) throw new AppError("Add at least one finished photo before submitting.");
      if (item.status === "uploading") {
        await patch("item", item.id, { status: "pending" });
        await activity("New clothing photo received for review");
      }
      return json({ ok: true });
    }
    const prefix = body.itemId + "/" + (body.processed ? "processed-" : "original-") + body.side + "-";
    if (body.action === "prepare") {
      if (!body.contentType || !body.size) throw new AppError("Choose a photo first.");
      if (body.processed && !["image/png", "image/webp"].includes(body.contentType)) throw new AppError("Use PNG or WebP for a finished cutout.");
      const ext = body.contentType.split("/")[1];
      const path = prefix + randomUUID() + "." + ext;
      const { data, error } = await db().storage.from("closet-private").createSignedUploadUrl(path);
      if (error) throw new AppError("Photo storage is unavailable. Please check the private bucket.", 503);
      return json({ path, signedUrl: data.signedUrl });
    }
    if (!body.path?.startsWith(prefix) || !new RegExp("^" + prefix + "[a-f0-9-]{36}\\.(jpeg|png|webp|heic|heif)$").test(body.path)) throw new AppError("Invalid image reference.");
    const { data: files, error } = await db().storage.from("closet-private").list(body.itemId, { search: body.path.split("/")[1], limit: 1 });
    if (error || !files?.some(file => body.itemId + "/" + file.name === body.path && Number(file.metadata?.size ?? 0) > 0)) throw new AppError("The photo upload is not complete. Please try again.");
    const field = body.side + (body.processed ? "ProcessedPath" : "Path");
    item = await patch<WardrobeItem>("item", item.id, { [field]: body.path });
    if (body.processed) {
      try {
        await standardizeUploadedCutout(item.id, body.side, body.path);
      } catch (error) {
        console.error("Clothing cutout standardization failed", error);
        throw error;
      }
    }
    return json({ ok: true });
  } catch (error) {
    console.error("Clothing upload request failed", error);
    return apiError(error);
  }
}
