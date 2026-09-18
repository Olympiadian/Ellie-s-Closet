"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ApiError, requestJson } from "@/lib/api";
import type { WardrobeData } from "@/lib/wardrobe";

type Context = { data: WardrobeData | null; loading: boolean; error: string; locked: boolean; refresh: () => Promise<void>; mutate: (body: unknown) => Promise<void> };
const WardrobeContext = createContext<Context | null>(null);

const CACHE_KEY = "ellie-closet:wardrobe-cache:v1";
const CACHE_TTL = 15 * 60 * 1000;
type CachedData = { savedAt: number; data: WardrobeData };
const inFlight = new Map<string, Promise<WardrobeData>>();

function readCache(): CachedData | null {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "null") as CachedData | null;
    return cached && Number.isFinite(cached.savedAt) && Array.isArray(cached.data?.items) ? cached : null;
  } catch { return null; }
}

function writeCache(data: WardrobeData) {
  // Image URLs are stable, server-authenticated application routes—not Supabase signed URLs or credentials.
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data } satisfies CachedData)); }
  catch { /* Local storage may be unavailable or full; in-memory state still works. */ }
}

function requestWardrobe(url: string) {
  const existing = inFlight.get(url);
  if (existing) return existing;
  const request = requestJson<WardrobeData>(url).finally(() => inFlight.delete(url));
  inFlight.set(url, request);
  return request;
}

function applyMutation(data: WardrobeData, body: unknown): WardrobeData {
  if (!body || typeof body !== "object" || !("action" in body)) return data;
  const mutation = body as Record<string, unknown>;
  const id = typeof mutation.id === "string" ? mutation.id : "";
  const updateItem = (change: (item: WardrobeData["items"][number]) => WardrobeData["items"][number]) => ({ ...data, items: data.items.map(item => item.id === id ? change(item) : item) });
  switch (mutation.action) {
    case "mark": return updateItem(item => ({ ...item, [mutation.field as "favorite" | "saved"]: Boolean(mutation.value) }));
    case "editItem": return updateItem(item => ({ ...item, ...(mutation.fields as object) }));
    case "removeItem": return { ...data, items: data.items.filter(item => item.id !== id) };
    case "publish": return updateItem(item => ({ ...item, status: mutation.published ? "published" : "archived", ...(mutation.published && !item.publishedAt ? { publishedAt: new Date().toISOString() } : {}) }));
    case "saveBuild": {
      const build = { id, name: String(mutation.name), occasion: String(mutation.occasion), kind: mutation.kind === "collection" ? "collection" as const : "outfit" as const, itemIds: Array.isArray(mutation.itemIds) ? mutation.itemIds.filter((value): value is string => typeof value === "string") : [], createdAt: new Date().toISOString() };
      return { ...data, builds: [...data.builds.filter(current => current.id !== id), build] };
    }
    case "removeBuild": return { ...data, builds: data.builds.filter(build => build.id !== id) };
    case "plan": {
      const date = String(mutation.date);
      const plan = { id: date, date, itemIds: Array.isArray(mutation.itemIds) ? mutation.itemIds.filter((value): value is string => typeof value === "string") : [], buildIds: Array.isArray(mutation.buildIds) ? mutation.buildIds.filter((value): value is string => typeof value === "string") : [], note: String(mutation.note ?? "") };
      return { ...data, plans: [...data.plans.filter(current => current.id !== date), plan] };
    }
    case "settings": return { ...data, settings: { ...data.settings, ...(mutation.reduceMotion === undefined ? {} : { reduceMotion: Boolean(mutation.reduceMotion) }), ...(typeof mutation.stores === "string" ? { stores: mutation.stores } : {}), ...(typeof mutation.area === "string" ? { area: mutation.area } : {}), ...(typeof mutation.manualUrl === "string" ? { manualUrl: mutation.manualUrl } : {}) } };
    default: return data;
  }
}

export function WardrobeProvider({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const [data, setData] = useState<WardrobeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const generation = useRef(0);
  const lastRemoteLoad = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    try {
      const next = await requestWardrobe("/api/closet" + (admin ? "?admin=1" : ""));
      if (version !== generation.current) return;
      setData(next); setError(""); setLocked(false);
      lastRemoteLoad.current = Date.now();
      if (!admin) writeCache(next);
      document.documentElement.dataset.reduceMotion = String(next.settings.reduceMotion);
    } catch (error) {
      if (version !== generation.current) return;
      setError(error instanceof Error ? error.message : "Could not load the closet.");
      const unauthorized = error instanceof ApiError && [401, 403].includes(error.status);
      setLocked(unauthorized);
      if (unauthorized) setData(null);
    } finally { setLoading(false); }
  }, [admin]);
  useEffect(() => {
    const cached = admin ? null : readCache();
    if (cached) {
      setData(cached.data);
      setLoading(false);
      lastRemoteLoad.current = cached.savedAt;
      document.documentElement.dataset.reduceMotion = String(cached.data.settings.reduceMotion);
      if (Date.now() - cached.savedAt >= CACHE_TTL) void refresh();
    } else {
      void refresh();
    }
    const update = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRemoteLoad.current >= CACHE_TTL) void refresh();
    };
    window.addEventListener("focus", update);
    const timer = window.setInterval(update, CACHE_TTL);
    return () => { window.removeEventListener("focus", update); window.clearInterval(timer); };
  }, [refresh]);
  const mutate = async (body: unknown) => {
    await requestJson("/api/closet", body);
    setData(current => {
      if (!current) return current;
      const next = applyMutation(current, body);
      if (!admin) writeCache(next);
      document.documentElement.dataset.reduceMotion = String(next.settings.reduceMotion);
      return next;
    });
  };
  return <WardrobeContext.Provider value={{ data, loading, error, locked, refresh, mutate }}>{children}</WardrobeContext.Provider>;
}
export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) throw new Error("WardrobeProvider is required");
  return context;
}
export function DataGate({ children }: { children: ReactNode }) {
  const { data, error, loading, locked, refresh } = useWardrobe();
  if (loading) return <p className="wc-empty" role="status">Opening your closet…</p>;
  if (locked) return <section className="wc-empty"><h2>Your closet, privately.</h2><Link className="wc-button" href="/admin">Admin sign in</Link></section>;
  if (error && !data) return <section className="wc-empty" role="alert"><p>{error}</p><button className="wc-button" onClick={() => void refresh()}>Try again</button></section>;
  return <>{error && <p className="wc-notice" role="alert">{error}</p>}{children}</>;
}
