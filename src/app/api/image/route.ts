import { AppError, db } from "@/lib/server/records";
import { validImageCapability } from "@/lib/server/image-url";
import { requireSession } from "@/lib/server/session";
import { apiError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const path = query.get("path");
    const scope = query.get("scope");
    if (!path || path.length > 250 || path.includes("..") || !validImageCapability(path, scope, query.get("signature"))) {
      throw new AppError("Image not found.", 404);
    }
    await requireSession(scope === "admin");
    const { data, error } = await db().storage.from("closet-private").createSignedUrl(path, 3900);
    if (error || !data?.signedUrl) throw new AppError("Image not found.", 404);
    return new Response(null, {
      status: 302,
      headers: {
        "Location": data.signedUrl,
        // The URL is stable for an immutable object, while the short-lived Storage URL remains private.
        "Cache-Control": "private, max-age=3600, must-revalidate",
        "Vary": "Cookie",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
