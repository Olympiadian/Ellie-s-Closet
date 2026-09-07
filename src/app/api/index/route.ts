import { z } from "zod";
import { indexClothingImage } from "@/lib/ai/index-clothing";
import { type WardrobeItem } from "@/lib/wardrobe";
import { activity, AppError, db, limit, patch, record } from "@/lib/server/records";
import { requireSession, sameOrigin } from "@/lib/server/session";
import { apiError, json } from "@/lib/server/http";
export const maxDuration = 120;
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireSession(true);
    const { id } = z.object({ id: z.string().uuid() }).parse(await request.json());
    await limit("ai-index", 30, 3600);
    const item = await record<WardrobeItem>("item", id);
    if (!item?.frontPath) throw new AppError("Upload a front image first.");
    const { data, error } = await db().storage.from("closet-private").createSignedUrl(item.frontPath, 300);
    if (error) throw new AppError("Could not open the photo.");
    const result = await indexClothingImage(data.signedUrl);
    await patch("item", id, {
      name: item.name === "New clothing item" ? result.name : item.name,
      category: item.category === "other" ? result.category : item.category,
      subcategory: item.subcategory || result.subcategory,
      color: item.color || result.primary_color,
      tags: item.tags.length ? item.tags : result.style_tags,
      occasions: item.occasions.length ? item.occasions : result.occasions,
      issues: [...new Set([...item.issues, ...(result.review_reason ? ["A.I. review: " + result.review_reason.slice(0, 45)] : []), ...(result.confidence < .8 ? ["A.I. unsure — verify suggested details"] : [])])].slice(0, 20),
    });
    await activity("AI suggested details for " + item.name);
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}
