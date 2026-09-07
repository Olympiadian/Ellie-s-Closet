import { randomUUID } from "node:crypto";
import { z } from "zod";
import { defaultSettings, itemFields, type Preferences, type WardrobeItem, type SavedBuild } from "@/lib/wardrobe";
import { activity, AppError, limit, patch, put, record, records, remove } from "@/lib/server/records";
import { requireSession, sameOrigin } from "@/lib/server/session";
import { apiError, json } from "@/lib/server/http";
import { wardrobeData } from "@/lib/server/wardrobe-data";

const uuid = z.string().uuid();
const text = z.string().trim();
const day = text.regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v + "T12:00:00Z"); return !isNaN(+d) && d.toISOString().slice(0, 10) === v; });
const actions = z.discriminatedUnion("action", [
  z.object({ action: z.literal("mark"), id: uuid, field: z.enum(["favorite", "saved"]), value: z.boolean() }),
  z.object({ action: z.literal("editItem"), id: uuid, fields: itemFields }),
  z.object({ action: z.literal("publish"), id: uuid, published: z.boolean() }),
  z.object({ action: z.literal("saveBuild"), id: uuid, name: text.min(1).max(100), occasion: text.max(100), kind: z.enum(["outfit", "collection"]), itemIds: z.array(uuid).min(1).max(50) }),
  z.object({ action: z.literal("removeBuild"), id: uuid }),
  z.object({ action: z.literal("plan"), date: day, itemIds: z.array(uuid).max(50), buildIds: z.array(uuid).max(20), note: text.max(1000) }),
  z.object({ action: z.literal("request"), subject: text.min(1).max(160), body: text.min(1).max(6000), kind: z.enum(["help", "feature", "change"]) }),
  z.object({ action: z.literal("resolveRequest"), id: uuid, resolved: z.boolean() }),
  z.object({ action: z.literal("message"), id: uuid, title: text.min(1).max(160), body: text.min(1).max(6000), date: day }),
  z.object({ action: z.literal("removeMessage"), id: uuid }),
  z.object({ action: z.literal("settings"), reduceMotion: z.boolean().optional(), stores: text.max(1500).optional(), area: text.max(250).optional(), manualUrl: text.max(2000).refine(v => !v || /^https:\/\//.test(v)).optional() }),
]);
export async function GET(request: Request) {
  try {
    const admin = new URL(request.url).searchParams.get("admin") === "1";
    const current = await requireSession(admin);
    return json(await wardrobeData(current.role, admin));
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession();
    if (Number(request.headers.get("content-length")) > 32000) throw new AppError("Request too large.", 413);
    const body = actions.parse(await request.json());
    const needsAdmin = ["publish", "resolveRequest", "message", "removeMessage"].includes(body.action)
      || (body.action === "settings" && (body.stores !== undefined || body.area !== undefined || body.manualUrl !== undefined));
    if (needsAdmin && current.role !== "admin") throw new AppError("Admin access is required.", 403);
    await limit("mutations:" + current.role, 120, 60);
    const now = new Date().toISOString();
    if (body.action === "mark" || body.action === "editItem" || body.action === "publish") {
      const item = await record<WardrobeItem>("item", body.id);
      if (!item || (current.role !== "admin" && item.status !== "published")) throw new AppError("Item not found.", 404);
      if (body.action === "mark") {
        await patch("item", body.id, { [body.field]: body.value });
        await activity(item.name + (body.value ? " added to " : " removed from ") + (body.field === "saved" ? "saved items" : "favorites"));
      } else if (body.action === "editItem") {
        await patch("item", body.id, body.fields);
        await activity("Updated details for " + body.fields.name);
      } else {
        if (body.published && (!item.frontPath || !item.backPath || !item.name.trim())) throw new AppError("Add both photos and a name before publishing.");
        await patch("item", body.id, { status: body.published ? "published" : "archived", ...(body.published ? { publishedAt: item.publishedAt ?? now } : {}) });
        await activity((body.published ? "Published " : "Archived ") + item.name);
      }
    } else if (body.action === "saveBuild" || body.action === "plan") {
      const available = new Set((await records<WardrobeItem>("item")).filter(i => i.status === "published").map(i => i.id));
      if (body.itemIds.some(id => !available.has(id))) throw new AppError("One of these items is no longer in the closet. Refresh and try again.");
      if (body.action === "saveBuild") {
        await put("build", body.id, { id: body.id, name: body.name, occasion: body.occasion, kind: body.kind, itemIds: [...new Set(body.itemIds)], createdAt: now });
        await activity("Saved " + body.kind + ": " + body.name);
      } else {
        const builds = new Set((await records<SavedBuild>("build")).map(b => b.id));
        if (body.buildIds.some(id => !builds.has(id))) throw new AppError("A saved outfit is no longer available. Refresh and try again.");
        await put("plan", body.date, { id: body.date, date: body.date, itemIds: [...new Set(body.itemIds)], buildIds: [...new Set(body.buildIds)], note: body.note });
        await activity("Updated outfit plan for " + body.date);
      }
    } else if (body.action === "removeBuild") {
      await remove("build", body.id);
      await activity("Removed a saved build");
    } else if (body.action === "request") {
      const id = randomUUID();
      await put("request", id, { id, subject: body.subject, body: body.body, kind: body.kind, status: "open", createdAt: now });
      await activity("New support request: " + body.subject);
    } else if (body.action === "resolveRequest") {
      await patch("request", body.id, { status: body.resolved ? "resolved" : "open" });
    } else if (body.action === "message") {
      await put("message", body.id, { id: body.id, title: body.title, body: body.body, date: body.date, createdAt: now });
      await activity("Scheduled a message for " + body.date);
    } else if (body.action === "removeMessage") {
      await remove("message", body.id);
    } else if (body.action === "settings") {
      const previous = await record<Preferences>("settings", "home");
      const { action: _action, ...fields } = body;
      void _action;
      await put("settings", "home", { ...defaultSettings, ...previous, ...fields });
    }
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}
