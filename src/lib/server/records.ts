import "server-only";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export class AppError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function db() { return createAdminClient(); }
export async function records<T>(kind: string): Promise<T[]> {
  const output: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db().from("closet_records").select("data").eq("kind", kind).order("id").range(from, from + 999);
    if (error) throw new AppError("The closet database is unavailable. Please check its setup.", 503);
    output.push(...data.map(row => row.data as T));
    if (data.length < 1000) return output;
  }
}
export async function record<T>(kind: string, id: string): Promise<T | null> {
  const { data, error } = await db().from("closet_records").select("data").eq("kind", kind).eq("id", id).maybeSingle();
  if (error) throw new AppError("The closet database is unavailable.", 503);
  return data?.data as T ?? null;
}
export async function put(kind: string, id: string, data: object, insertOnly = false) {
  const query = db().from("closet_records");
  const result = insertOnly ? await query.insert({ kind, id, data }) : await query.upsert({ kind, id, data });
  if (result.error) throw new AppError(result.error.code === "23505" ? "This record already exists." : "Could not save. Please try again.", result.error.code === "23505" ? 409 : 503);
}
export async function patch<T>(kind: string, id: string, data: object): Promise<T> {
  const { data: result, error } = await db().rpc("closet_patch", { record_kind: kind, record_id: id, patch: data });
  if (error) throw new AppError("Could not save changes. Please try again.", 503);
  if (!result) throw new AppError("Record not found.", 404);
  return result as T;
}
export async function remove(kind: string, id: string) {
  const { error } = await db().from("closet_records").delete().eq("kind", kind).eq("id", id);
  if (error) throw new AppError("Could not remove the record.", 503);
}
export async function activity(text: string) {
  const id = randomUUID();
  await put("activity", id, { id, text, createdAt: new Date().toISOString() });
}
export async function limit(key: string, max = 60, seconds = 60) {
  const { data, error } = await db().rpc("closet_rate_limit", { bucket: key, max_attempts: max, window_seconds: seconds });
  if (error) throw new AppError("Please finish the database setup before continuing.", 503);
  if (!data) throw new AppError("Too many attempts. Please try again later.", 429);
}
