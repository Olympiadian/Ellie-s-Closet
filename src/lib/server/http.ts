import { ZodError } from "zod";
import { AppError } from "./records";
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
export function apiError(error: unknown) {
  if (error instanceof AppError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError || error instanceof SyntaxError) return json({ error: "Please check the entered information and try again." }, 400);
  console.error("Closet request failed", error instanceof Error ? error.name : "UnknownError");
  return json({ error: "Something could not be saved or loaded. Please try again." }, 500);
}
