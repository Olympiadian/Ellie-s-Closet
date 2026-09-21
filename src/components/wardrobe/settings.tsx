"use client";
import Link from "next/link";
import { useState } from "react";
import { DataGate, useWardrobe } from "./provider";
import { PageShell } from "./ui";
export function SettingsPage() {
  const { data, mutate } = useWardrobe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function motion(value: boolean) {
    setBusy(true);
    try { await mutate({ action: "settings", reduceMotion: value }); setMessage("Preference saved."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <PageShell title="Settings"><div className="wc-content wc-narrow"><DataGate><section className="wc-surface wc-form"><label className="wc-check"><input type="checkbox" checked={data?.settings.reduceMotion ?? false} disabled={busy} onChange={e => void motion(e.target.checked)}/>Reduce motion</label><p className="wc-muted">Use quieter transitions across the closet.</p><p>Dates and daily messages use Arizona time. Prices are shown in USD.</p><Link className="wc-text-link" href="/help">Help & manual →</Link>{data?.role === "admin" && <Link href="/admin" className="wc-text-link">Open admin →</Link>}{message && <p role="status">{message}</p>}</section></DataGate></div></PageShell>;
}
