import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { AppError, put, record } from "./records";

export const sessionCookie = "ellie_closet_session";
export type Session = { role: "admin" | "viewer"; expiresAt: string };
export const hash = (text: string) => createHash("sha256").update(text).digest("hex");
export function passwordsMatch(input: string) {
  if (!process.env.ADMIN_PASSWORD) throw new AppError("The admin password has not been configured in Vercel.", 503);
  return timingSafeEqual(Buffer.from(hash(input)), Buffer.from(hash(process.env.ADMIN_PASSWORD)));
}
export async function session() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const value = await record<Session>("session", hash(token));
  return value && new Date(value.expiresAt).getTime() > Date.now() ? value : null;
}
export async function requireSession(admin = false) {
  const current = await session();
  if (!current && !admin) return { role: "viewer", expiresAt: "9999-12-31T23:59:59.999Z" } satisfies Session;
  if (!current) throw new AppError("Admin access is required.", 401);
  if (admin && current.role !== "admin") throw new AppError("Admin access is required.", 403);
  return current;
}
export async function createSession(role: Session["role"]) {
  const token = randomBytes(32).toString("hex");
  const maxAge = role === "admin" ? 60 * 60 * 12 : 60 * 60 * 24 * 180;
  await put("session", hash(token), { role, expiresAt: new Date(Date.now() + maxAge * 1000).toISOString() });
  (await cookies()).set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const destination = new URL(request.url);
  // Next can normalize request.url to localhost behind its development proxy.
  // The HTTP Host still identifies the browser's actual same-origin destination.
  const requestOrigin = host ? destination.protocol + "//" + host : destination.origin;
  if (!origin || origin !== requestOrigin) throw new AppError("This request was not sent from the closet.", 403);
}
