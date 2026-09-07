"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ApiError, requestJson } from "@/lib/api";
import type { WardrobeData } from "@/lib/wardrobe";

type Context = { data: WardrobeData | null; loading: boolean; error: string; locked: boolean; refresh: () => Promise<void>; mutate: (body: unknown) => Promise<void> };
const WardrobeContext = createContext<Context | null>(null);
export function WardrobeProvider({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const [data, setData] = useState<WardrobeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    try {
      const next = await requestJson<WardrobeData>("/api/closet" + (admin ? "?admin=1" : ""));
      if (version !== generation.current) return;
      setData(next); setError(""); setLocked(false);
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
    // This synchronizes remote data; state updates occur after the request settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const update = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener("focus", update);
    const timer = window.setInterval(update, 300000);
    return () => { window.removeEventListener("focus", update); window.clearInterval(timer); };
  }, [refresh]);
  const mutate = async (body: unknown) => { await requestJson("/api/closet", body); await refresh(); };
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
  if (locked) return <section className="wc-empty"><h2>Your closet, privately.</h2><p>Open your one-time setup link to connect this device.</p><Link className="wc-button" href="/admin">Admin sign in</Link></section>;
  if (error && !data) return <section className="wc-empty" role="alert"><p>{error}</p><button className="wc-button" onClick={() => void refresh()}>Try again</button></section>;
  return <>{error && <p className="wc-notice" role="alert">{error}</p>}{children}</>;
}
