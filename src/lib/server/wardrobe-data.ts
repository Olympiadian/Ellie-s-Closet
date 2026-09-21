import "server-only";
import { db, record, records } from "./records";
import { privateImageUrl } from "./image-url";
import { defaultSettings, localDate, type Activity, type CalendarPlan, type DailyMessage, type DealScan, type Preferences, type SavedBuild, type SupportRequest, type WardrobeData, type WardrobeItem } from "@/lib/wardrobe";

export async function wardrobeData(role: "admin" | "viewer", adminView = false): Promise<WardrobeData> {
  const [allItems, builds, plans, allMessages, settings, scans, requests, activity] = await Promise.all([
    records<WardrobeItem>("item"), records<SavedBuild>("build"), records<CalendarPlan>("plan"),
    records<DailyMessage>("message"), record<Preferences>("settings", "home"), records<DealScan>("scan"),
    adminView ? records<SupportRequest>("request") : Promise.resolve([]),
    adminView ? records<Activity>("activity") : Promise.resolve([]),
  ]);
  const items = allItems.filter(item => adminView || item.status === "published");
  const imageUrl = (path: string | undefined) => path ? privateImageUrl(path, adminView ? "admin" : "viewer") : undefined;
  return {
    items: items.map(item => ({
      ...item,
      frontUrl: imageUrl(item.frontProcessedPath ?? item.frontPath ?? item.backProcessedPath ?? item.backPath),
      backUrl: imageUrl(item.backProcessedPath ?? item.backPath),
      frontThumbnailUrl: imageUrl(item.frontThumbnailPath ?? item.frontProcessedPath ?? item.frontPath ?? item.backThumbnailPath ?? item.backProcessedPath ?? item.backPath),
      backThumbnailUrl: imageUrl(item.backThumbnailPath ?? item.backProcessedPath ?? item.backPath),
      originalFrontUrl: adminView ? imageUrl(item.frontPath) : undefined,
      originalBackUrl: adminView ? imageUrl(item.backPath) : undefined,
    })),
    builds, plans, messages: allMessages.filter(m => adminView || m.date <= localDate()).sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    settings: { ...defaultSettings, ...settings }, scans: scans.sort((a,b) => b.checkedAt.localeCompare(a.checkedAt)).slice(0, 7),
    requests: requests.sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    activity: activity.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100), role,
  };
}
