import { activity, db, limit, put } from "@/lib/server/records";
import { apiError, json } from "@/lib/server/http";
import { requireSession, sameOrigin } from "@/lib/server/session";
import { testCatalog } from "@/lib/server/test-catalog";
import type { WardrobeItem } from "@/lib/wardrobe";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireSession(true);
    await limit("admin:test-catalog", 3, 300);

    const publishedAt = new Date().toISOString();
    const batches = Array.from({ length: Math.ceil(testCatalog.length / 5) }, (_, index) =>
      testCatalog.slice(index * 5, index * 5 + 5),
    );

    for (const batch of batches) {
      await Promise.all(batch.map(async (entry) => {
        const response = await fetch(new URL(`/test-clothes/${entry.asset}`, request.url), { cache: "force-cache" });
        if (!response.ok) throw new Error(`Missing test catalog asset: ${entry.asset}`);
        const path = `${entry.id}/test-catalog.png`;
        const bytes = await response.arrayBuffer();
        const { error } = await db().storage.from("closet-private").upload(path, bytes, {
          contentType: "image/png",
          cacheControl: "31536000",
          upsert: true,
        });
        if (error) throw error;
        const { asset: _asset, ...fields } = entry;
        void _asset;
        const offset = testCatalog.findIndex(value => value.id === entry.id);
        const item: WardrobeItem = {
          ...fields,
          status: "published",
          favorite: false,
          saved: false,
          frontPath: path,
          backPath: path,
          createdAt: new Date(Date.parse(publishedAt) - offset * 3_600_000).toISOString(),
          publishedAt,
        };
        await put("item", entry.id, item);
      }));
    }

    await activity("Loaded 25 TEST-CLOTHES catalog items");
    return json({ ok: true, count: testCatalog.length });
  } catch (error) {
    return apiError(error);
  }
}
