"use client";
import { useState, type FormEvent } from "react";
import { safeExternalUrl } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { PageShell } from "./ui";

export function SupportForm() {
  const { mutate, data } = useWardrobe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      await mutate({ action: "request", subject: values.get("subject"), body: values.get("body"), kind: values.get("kind") });
      form.reset(); setMessage("Sent. Your request is now in the admin inbox.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send."); }
    finally { setBusy(false); }
  }
  const manualUrl = safeExternalUrl(data?.settings.manualUrl ?? "");
  return <DataGate><form className="wc-form wc-surface" onSubmit={submit}><label>What can I help with?<select name="kind"><option value="help">Help</option><option value="feature">A new feature</option><option value="change">A change or fix</option></select></label><label>Subject<input name="subject" required maxLength={160} placeholder="A little summary"/></label><label>Your request<textarea name="body" required maxLength={6000} rows={8} placeholder="Tell me what you have in mind…"/></label><button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>{message && <p role="status">{message}</p>}</form><div className="wc-manual">{manualUrl ? <a className="wc-text-link" href={manualUrl} target="_blank" rel="noreferrer">Open the closet manual (PDF) ↗</a> : <p className="wc-muted">The closet manual hasn’t been added yet.</p>}</div></DataGate>;
}
export function HelpPage() { return <PageShell title="A Little Help"><div className="wc-content wc-narrow"><SupportForm/></div></PageShell>; }
