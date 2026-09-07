"use client";
import { Fragment } from "react";
import { safeExternalUrl } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { Empty, PageShell } from "./ui";
function LinkedText({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]]+\]\(https:\/\/[^\s)]+\))/g).map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\((https:\/\/[^\s)]+)\)$/);
    return match && safeExternalUrl(match[2]) ? <a key={index} href={match[2]} target="_blank" rel="noreferrer">{match[1]}</a> : <Fragment key={index}>{part.replace(/\*\*/g, "")}</Fragment>;
  })}</>;
}
export function DealsPage() {
  const { data } = useWardrobe();
  const scan = data?.scans.find(s => s.status === "complete");
  const latest = data?.scans[0];
  return <PageShell title="A Few Good Finds"><DataGate><div className="wc-content wc-deals"><p className="wc-muted">Women’s clothing around Scottsdale & Biltmore · refreshed daily</p>
    {latest?.status === "failed" && <p className="wc-notice">The latest scan didn’t finish. {scan ? "The last successful results are shown below." : "Please check back after the next scan."}</p>}
    {scan ? <><p className="wc-muted">Checked {new Date(scan.checkedAt).toLocaleString("en-US", { timeZone: "America/Phoenix" })} Arizona time. Offers and availability can change.</p>{scan.text.split(/\n\s*\n/).filter(Boolean).map((text, index) => <article className="wc-surface wc-deal" key={index}><LinkedText text={text}/></article>)}<section className="wc-surface"><h2>Sources</h2><div className="wc-source-list">{scan.sources.map(source => safeExternalUrl(source.url) ? <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : null)}</div></section></> : <Empty>{latest?.status === "running" ? "The daily research scan is running." : "No verified finds yet. Your first scan can be started from admin."}</Empty>}
  </div></DataGate></PageShell>;
}
