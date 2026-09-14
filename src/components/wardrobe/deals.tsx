"use client";
import { Fragment } from "react";
import { safeExternalUrl } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { Empty, PageShell } from "./ui";
import type { DealScan } from "@/lib/wardrobe";

export const demoDealScan: DealScan = {
  id: "demo-preview", checkedAt: "2026-09-13T19:00:00.000Z", status: "complete", isDemo: true,
  text: "Aritzia — DEMO SALE PREVIEW: Example sale-page result for a polished everyday layer. This is sample content only, not a verified current offer. [Open Aritzia sale page](https://www.aritzia.com/us/en/sale)\n\nNordstrom — DEMO NEW ARRIVAL: Example occasion-ready edit with direct browsing link. This is sample content only, not a verified current offer. [Browse Nordstrom sale](https://www.nordstrom.com/browse/sale)\n\nSephora — DEMO BEAUTY FIND: Example beauty promotion card included to show the daily scan’s retailer mix. This is sample content only, not a verified current offer. [Browse Sephora offers](https://www.sephora.com/beauty/beauty-offers)",
  sources: [
    { title: "Aritzia sale", url: "https://www.aritzia.com/us/en/sale" },
    { title: "Nordstrom sale", url: "https://www.nordstrom.com/browse/sale" },
    { title: "Sephora offers", url: "https://www.sephora.com/beauty/beauty-offers" },
  ],
};
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
    {scan?.isDemo && <p className="wc-notice">Demo preview · These example finds are here to show the layout and links. They are not live offers.</p>}
    {latest?.status === "failed" && <p className="wc-notice">The latest scan didn’t finish. {scan ? "The last successful results are shown below." : "Please check back after the next scan."}</p>}
    {scan ? <><p className="wc-muted">Checked {new Date(scan.checkedAt).toLocaleString("en-US", { timeZone: "America/Phoenix" })} Arizona time. Offers and availability can change.</p><div className="wc-deals-grid">{scan.text.split(/\n\s*\n/).filter(Boolean).map((text, index) => <article className="wc-surface wc-deal" key={index}><LinkedText text={text}/></article>)}</div><section className="wc-surface"><h2>Open retailer pages</h2><div className="wc-source-list">{scan.sources.map(source => safeExternalUrl(source.url) ? <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : null)}</div></section></> : <Empty>{latest?.status === "running" ? "The daily research scan is running." : "No verified finds yet. Your first scan can be started from admin."}</Empty>}
  </div></DataGate></PageShell>;
}

export function DemoDealsPage() {
  return <PageShell title="A Few Good Finds"><div className="wc-content wc-deals"><p className="wc-muted">Women’s clothing around Scottsdale & Biltmore · refreshed daily</p><p className="wc-notice">Demo preview · These example finds are here to show the layout and links. They are not live offers.</p><p className="wc-muted">Checked today in Arizona time. Offers and availability can change.</p><div className="wc-deals-grid">{demoDealScan.text.split(/\n\s*\n/).map((text, index) => <article className="wc-surface wc-deal" key={index}><LinkedText text={text}/></article>)}</div><section className="wc-surface"><h2>Open retailer pages</h2><div className="wc-source-list">{demoDealScan.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div></section></div></PageShell>;
}
