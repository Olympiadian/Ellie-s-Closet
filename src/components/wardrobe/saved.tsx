"use client";
import { useState } from "react";
import { DataGate, useWardrobe } from "./provider";
import { Drawer, Empty, ItemPhoto, PageShell } from "./ui";
import { ItemDetails } from "./browse";
import type { SavedBuild, WardrobeItem } from "@/lib/wardrobe";

export function SavedPage() {
  const { data, mutate } = useWardrobe();
  const [tab, setTab] = useState("All");
  const [build, setBuild] = useState<SavedBuild | null>(null);
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const builds = (data?.builds ?? []).filter(b => tab === "All" || (tab === "Outfits" && b.kind === "outfit") || (tab === "Collections" && b.kind === "collection")).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const items = tab === "All" || tab === "Items" ? (data?.items ?? []).filter(i => i.saved) : [];
  async function remove() {
    if (!build || !window.confirm("Remove this saved build? The clothing items will stay in your closet.")) return;
    setBusy(true);
    try { await mutate({ action: "removeBuild", id: build.id }); setBuild(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove."); }
    finally { setBusy(false); }
  }
  return <PageShell title="Saved"><DataGate><div className="closet-browser__filters wc-tabs">{["All", "Outfits", "Collections", "Items"].map(value => <button className={tab === value ? "is-active" : ""} aria-pressed={tab === value} key={value} onClick={() => setTab(value)}>{value}</button>)}</div>
    {!builds.length && !items.length && <Empty>Save an item from its details, or put together your first outfit in Build Outfit.</Empty>}
    <div className="wc-content wc-saved-grid">{builds.map(build => <button key={build.id} className="wc-saved-card" onClick={() => { setBuild(build); setMessage(""); }}><div className="wc-collage">{build.itemIds.slice(0, 4).map(id => { const item = data?.items.find(i => i.id === id); return item ? <ItemPhoto key={id} item={item}/> : null; })}</div><strong>{build.name}</strong><small>{build.kind} · {build.occasion || build.itemIds.length + " items"}</small></button>)}{items.map(item => <button className="wc-saved-card" key={item.id} onClick={() => setItem(item)}><ItemPhoto item={item}/><strong>{item.name}</strong><small>Saved item</small></button>)}</div>
    {build && <Drawer title={build.name} close={() => setBuild(null)}><p className="wc-muted">{build.kind} · {build.occasion}</p><div className="wc-saved-grid">{build.itemIds.map(id => { const item = data?.items.find(i => i.id === id); return item ? <div key={id}><ItemPhoto item={item}/><p>{item.name}</p></div> : <p key={id}>An item is no longer available.</p>; })}</div><button className="wc-button" disabled={busy} onClick={() => void remove()}>Remove saved build</button>{message && <p role="alert">{message}</p>}</Drawer>}
    {item && <ItemDetails item={item} close={() => setItem(null)}/>}
  </DataGate></PageShell>;
}
