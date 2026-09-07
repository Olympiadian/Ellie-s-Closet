import { z } from "zod";
import { clothingCategories } from "./types";

const short = z.string().trim().max(160);
const list = z.array(z.string().trim().min(1).max(60)).max(20);
export const itemFields = z.object({
  name: short.min(1), category: z.enum(clothingCategories),
  subcategory: short, color: short, size: short, fit: short,
  store: short, cost: z.number().min(0).max(100000).nullable(),
  tags: list, occasions: list, details: z.string().trim().max(4000),
  issues: list,
});
export type ItemFields = z.infer<typeof itemFields>;
export type WardrobeItem = ItemFields & {
  id: string; status: "uploading" | "pending" | "published" | "archived";
  favorite: boolean; saved: boolean; createdAt: string; publishedAt?: string;
  frontPath?: string; backPath?: string; frontProcessedPath?: string; backProcessedPath?: string;
  frontUrl?: string; backUrl?: string; originalFrontUrl?: string; originalBackUrl?: string;
};
export type SavedBuild = { id: string; name: string; occasion: string; kind: "outfit" | "collection"; itemIds: string[]; createdAt: string };
export type CalendarPlan = { id: string; date: string; itemIds: string[]; buildIds: string[]; note: string };
export type DailyMessage = { id: string; title: string; body: string; date: string; createdAt: string };
export type SupportRequest = { id: string; subject: string; body: string; kind: "help" | "feature" | "change"; status: "open" | "resolved"; createdAt: string };
export type Activity = { id: string; text: string; createdAt: string };
export type DealScan = { id: string; text: string; sources: { title: string; url: string }[]; checkedAt: string; status: "running" | "complete" | "failed"; error?: string };
export type Preferences = { stores: string; area: string; manualUrl: string; reduceMotion: boolean };
export type WardrobeData = {
  items: WardrobeItem[]; builds: SavedBuild[]; plans: CalendarPlan[];
  messages: DailyMessage[]; requests: SupportRequest[]; activity: Activity[];
  scans: DealScan[]; settings: Preferences; role: "admin" | "viewer";
};
export const defaultSettings: Preferences = {
  stores: "Aritzia, Anthropologie, Reformation, Free People, Madewell, Abercrombie & Fitch, Nordstrom",
  area: "Scottsdale Fashion Square and Biltmore, Phoenix, Arizona",
  manualUrl: "", reduceMotion: false,
};
export const emptyItem: ItemFields = {
  name: "New clothing item", category: "other", subcategory: "", color: "", size: "",
  fit: "", store: "", cost: null, tags: [], occasions: [], details: "", issues: [],
};
export function itemIssues(item: ItemFields) {
  return [...new Set([
    ...item.issues,
    ...(!item.color ? ["Missing color"] : []),
    ...(!item.size ? ["Missing size"] : []),
    ...(!item.tags.length ? ["Missing tags"] : []),
    ...(!item.occasions.length ? ["Missing occasion"] : []),
    ...(item.category === "other" ? ["Review category"] : []),
  ])];
}
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function safeExternalUrl(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
