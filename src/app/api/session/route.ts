import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { AppError, db, limit, put, remove } from "@/lib/server/records";
import { createSession, hash, passwordsMatch, requireSession, sameOrigin, session, sessionCookie } from "@/lib/server/session";
import { apiError, json } from "@/lib/server/http";

export async function GET() {
  try { return json({ role: (await session())?.role ?? null }); } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const body = z.discriminatedUnion("action", [
      z.object({ action: z.literal("login"), password: z.string().max(200) }),
      z.object({ action: z.literal("pair"), token: z.string().regex(/^[a-f0-9]{64}$/) }),
      z.object({ action: z.literal("invite") }),
      z.object({ action: z.literal("logout") }),
    ]).parse(await request.json());
    if (body.action === "login" || body.action === "pair") {
      const ip = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "local";
      await limit("login:" + hash(ip), 8, 900);
      if (body.action === "login") {
        if (!passwordsMatch(body.password)) throw new AppError("Incorrect password.", 401);
        await createSession("admin");
      } else {
        const { data, error } = await db().rpc("closet_consume_invite", { invite_id: hash(body.token) });
        if (error || !data) throw new AppError("This setup link has expired or was already used.", 401);
        await createSession("viewer");
      }
    } else if (body.action === "invite") {
      await requireSession(true);
      const token = randomBytes(32).toString("hex");
      await put("invite", hash(token), { expiresAt: new Date(Date.now() + 86400000).toISOString() });
      return json({ url: new URL("/connect#token=" + token, request.url).href });
    } else {
      const jar = await cookies();
      const token = jar.get(sessionCookie)?.value;
      if (token) await remove("session", hash(token));
      jar.delete(sessionCookie);
    }
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}
