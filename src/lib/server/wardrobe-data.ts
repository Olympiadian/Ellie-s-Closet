import "server-only";
import { db, record, records } from "./records";
import { defaultSettings, localDate, type Activity, type CalendarPlan, type DailyMessage, type DealScan, type Preferences, type SavedBuild, type SupportRequest, type WardrobeData, type WardrobeItem } from "@/lib/wardrobe";

export async function wardrobeData(role: "admin" | "viewer", adminView = false): Promise<WardrobeData> {
  const [allItems, builds, plans, allMessages, settings, scans, requests, activity] = await Promise.all([
    records<WardrobeItem>("item"), records<SavedBuild>("build"), records<CalendarPlan>("plan"),
    records<DailyMessage>("message"), record<Preferences>("settings", "home"), records<DealScan>("scan"),
    adminView ? records<SupportRequest>("request") : Promise.resolve([]),
    adminView ? records<Activity>("activity") : Promise.resolve([]),
  ]);
  const items = allItems.filter(item => adminView || item.status === "published");
  const paths = [...new Set(items.flatMap(item => [
    item.frontProcessedPath ?? item.frontPath, item.backProcessedPath ?? item.backPath,
    ...(adminView ? [item.frontPath, item.backPath] : []),
  ]).filter((path): path is string => !!path))];
  const urls = new Map<string, string>();
  for (let start = 0; start < paths.length; start += 100) {
    const { data, error } = await db().storage.from("closet-private").createSignedUrls(paths.slice(start, start + 100), 3600);
    if (error) throw error;
    data?.forEach(value => { if (value.path && value.signedUrl) urls.set(value.path, value.signedUrl); });
  }
  return {
    items: items.map(item => ({
      ...item,
      frontUrl: urls.get(item.frontProcessedPath ?? item.frontPath ?? ""),
      backUrl: urls.get(item.backProcessedPath ?? item.backPath ?? ""),
      originalFrontUrl: adminView ? urls.get(item.frontPath ?? "") : undefined,
      originalBackUrl: adminView ? urls.get(item.backPath ?? "") : undefined,
    })),
    builds, plans, messages: allMessages.filter(m => adminView || m.date <= localDate()).sort((a,b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
    settings: { ...defaultSettings, ...settings }, scans: scans.sort((a,b) => b.checkedAt.localeCompare(a.checkedAt)).slice(0, 7),
    requests: requests.sort((a,b) => b.createdAt.localeCompare(a.createdAt)),
    activity: activity.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100), role,
  };
}
