import { timingSafeEqual } from "node:crypto";
import { scanDeals } from "@/lib/server/deals";
import { requireSession, sameOrigin } from "@/lib/server/session";
import { apiError, json } from "@/lib/server/http";
import { AppError } from "@/lib/server/records";
export const maxDuration = 240;
export async function GET(request: Request) {
  try {
    const expected = process.env.CRON_SECRET ? Buffer.from("Bearer " + process.env.CRON_SECRET) : null;
    const actual = Buffer.from(request.headers.get("authorization") ?? "");
    if (!expected || expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new AppError("Unauthorized.", 401);
    return json(await scanDeals());
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await requireSession(true);
    return json(await scanDeals(true));
  } catch (error) { return apiError(error); }
}
