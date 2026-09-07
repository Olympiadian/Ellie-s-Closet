"use client";
import Link from "next/link";
import { useState } from "react";
import type { WardrobeItem } from "@/lib/wardrobe";
import { useWardrobe, DataGate } from "./provider";
import { Drawer, Empty, Heart, ItemPhoto, PageShell } from "./ui";

const topics = ["All", "Tops", "Jackets", "Bottoms", "Shoes", "Misc."];
const tags = ["All", "Everyday", "Work", "Going out", "Church", "Comfortable", "Basic", "Layering", "Formal", "Active"];
export function ItemDetails({ item, close }: { item: WardrobeItem; close: () => void }) {
  const { mutate, data } = useWardrobe();
  const current = data?.items.find(i => i.id === item.id) ?? item;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function mark(field: "favorite" | "saved") {
    setBusy(true); setError("");
    try { await mutate({ action: "mark", id: current.id, field, value: !current[field] }); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <Drawer title={current.name} close={close}>
    <div className="wc-item-photos"><ItemPhoto item={current}/><ItemPhoto item={current} side="back"/></div>
    <div className="wc-item-actions"><button className="wc-button" aria-pressed={current.saved} disabled={busy} onClick={() => void mark("saved")}>{current.saved ? "Saved" : "Save item"}</button><button className="wc-heart-button" disabled={busy} aria-label={current.favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={current.favorite} onClick={() => void mark("favorite")}><Heart filled={current.favorite}/></button></div>
    {error && <p role="alert">{error}</p>}
    <dl className="closet-item-drawer__details">
      {Object.entries({ Category: [current.category, current.subcategory].filter(Boolean).join(" · "), Tags: current.tags.join(" · "), Color: current.color, Details: [current.details, current.size && "Size " + current.size, current.fit, current.store, current.cost !== null && "$" + current.cost.toFixed(2), current.occasions.join(" · ")].filter(Boolean).join(" · ") }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not added yet"}</dd></div>)}
    </dl>
    <Link className="wc-text-link" href={"/log?item=" + current.id}>Edit item information</Link>
  </Drawer>;
}
export function ItemGrid({ items, choose, selected = [] }: { items: WardrobeItem[]; choose?: (item: WardrobeItem) => void; selected?: string[] }) {
  const [mode, setMode] = useState<"topics" | "tags">("topics");
  const [filter, setFilter] = useState("All");
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const visible = items.filter(item => {
    if (filter === "All") return true;
    if (mode === "tags") return [...item.tags, ...item.occasions].some(t => t.toLowerCase() === filter.toLowerCase());
    if (filter === "Jackets") return item.category === "outerwear";
    if (filter === "Misc.") return !["tops", "outerwear", "bottoms", "shoes"].includes(item.category);
    return item.category === filter.toLowerCase();
  });
  return <section className="closet-browser">
    <div className="closet-browser__mode">{(["topics", "tags"] as const).map(value => <button key={value} className={mode === value ? "is-active" : ""} aria-pressed={mode === value} onClick={() => { setMode(value); setFilter("All"); }}>{value === "topics" ? "Topics" : "Tags"}</button>)}</div>
    <div className="closet-browser__filters" aria-label="Categories">{(mode === "topics" ? topics : tags).map(value => <button key={value} className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
    {visible.length ? <div className="closet-browser__grid">{visible.map(item => <button className={"closet-browser__item" + (selected.includes(item.id) ? " wc-selected" : "")} key={item.id} aria-label={(choose ? "Add " : "Open details for ") + item.name} aria-pressed={choose ? selected.includes(item.id) : undefined} onClick={() => choose ? choose(item) : setItem(item)}><ItemPhoto item={item}/></button>)}</div> : <Empty>{items.length ? "No items in this category yet." : "Your clothes will appear here once they have been reviewed and published."}</Empty>}
    {item && <ItemDetails item={item} close={() => setItem(null)}/>}
  </section>;
}
export function BrowsePage({ view }: { view: "closet" | "favorites" | "recent" }) {
  const { data } = useWardrobe();
  const items = [...(data?.items ?? [])].filter(i => view !== "favorites" || i.favorite);
  if (view === "recent") items.sort((a,b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  return <PageShell title={view === "closet" ? "The Closet" : view === "favorites" ? "Favorites" : "Recent"}><DataGate><ItemGrid items={items}/></DataGate></PageShell>;
}
