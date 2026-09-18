import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type ImageScope = "viewer" | "admin";

function signingKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  return key;
}

function signature(path: string, scope: ImageScope) {
  return createHmac("sha256", signingKey()).update(`${scope}\0${path}`).digest("base64url");
}

/** A stable, signed capability for one private Storage object. */
export function privateImageUrl(path: string, scope: ImageScope) {
  const params = new URLSearchParams({ path, scope, signature: signature(path, scope) });
  return `/api/image?${params}`;
}

export function validImageCapability(path: string, scope: string | null, value: string | null): scope is ImageScope {
  if ((scope !== "viewer" && scope !== "admin") || !value) return false;
  const expected = signature(path, scope);
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
