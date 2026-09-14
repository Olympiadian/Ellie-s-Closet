"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FloppyDisk, PencilSimple, SlidersHorizontal, SortAscending, SortDescending } from "@phosphor-icons/react";
import type { SavedBuild, WardrobeItem } from "@/lib/wardrobe";
import { useWardrobe, DataGate } from "./provider";
import { Drawer, Empty, Heart, ItemPhoto, PageShell } from "./ui";

const topics = ["All", "Tops", "Jackets", "Dresses", "Sleep", "Bottoms", "Under", "Shoes", "Misc."];
const tags = ["All", "Everyday", "Work", "Club", "Church", "Comfy", "Basic", "Layers", "Formal", "Active"];

type SheetName = "filters" | "sort" | "saved";
type SortOrder = "newest" | "oldest";
type SavedView = "favorites" | "outfits" | "collections";

function MobileClosetSheet({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return <div
    className="mobile-closet-sheet__backdrop"
    role="presentation"
    onKeyDown={(event) => { if (event.key === "Escape") close(); }}
    onPointerDown={(event) => { event.stopPropagation(); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    }}
  >
    <section ref={panelRef} className="mobile-closet-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <span className="mobile-closet-sheet__handle" aria-hidden="true" />
      <h2 id={titleId}>{title}</h2>
      {children}
    </section>
  </div>;
}

function itemTopic(item: WardrobeItem) {
  if (item.category === "outerwear") return "Jackets";
  if (item.category === "loungewear") return "Sleep";
  if (item.category === "dresses") return "Dresses";
  if (item.category === "tops") return "Tops";
  if (item.category === "bottoms") return "Bottoms";
  if (item.category === "shoes") return "Shoes";
  if (item.tags.some(tag => /^(underwear|undergarment|lingerie|bra|bralette|underwear set)$/i.test(tag))) return "Under";
  return "Misc.";
}
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
    <Link className="wc-text-link" href={"/mobile/database?item=" + current.id}>Edit item information</Link>
  </Drawer>;
}
export function ItemGrid({ items, builds = [], choose, selected = [], compact = false }: { items: WardrobeItem[]; builds?: SavedBuild[]; choose?: (item: WardrobeItem) => void; selected?: string[]; compact?: boolean }) {
  const { mutate } = useWardrobe();
  const [mode, setMode] = useState<"topics" | "tags">("topics");
  const [filter, setFilter] = useState("All");
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [draftTopic, setDraftTopic] = useState("All");
  const [draftTag, setDraftTag] = useState("All");
  const [appliedTopic, setAppliedTopic] = useState("All");
  const [appliedTag, setAppliedTag] = useState("All");
  const [draftSort, setDraftSort] = useState<SortOrder>("newest");
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(null);
  const [draftSaved, setDraftSaved] = useState<SavedView>("favorites");
  const [savedView, setSavedView] = useState<SavedView | null>(null);
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [favoriteBusy, setFavoriteBusy] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState("");
  const visible = items.filter(item => {
    if (appliedTopic !== "All" && itemTopic(item) !== appliedTopic) return false;
    if (appliedTag !== "All") {
      const aliases: Record<string, string[]> = { Club: ["club", "going out", "night out"], Comfy: ["comfy", "comfortable", "cozy"], Layers: ["layers", "layering"] };
      const wanted = aliases[appliedTag] ?? [appliedTag.toLowerCase()];
      if (![...item.tags, ...item.occasions].some(value => wanted.includes(value.toLowerCase()))) return false;
    }
    if (savedView === "favorites" && !item.favorite) return false;
    if (savedView === "outfits" && !builds.some(build => build.kind === "outfit" && build.itemIds.includes(item.id))) return false;
    if (savedView === "collections" && !builds.some(build => build.kind === "collection" && build.itemIds.includes(item.id))) return false;
    if (filter === "All") return true;
    if (mode === "tags") return [...item.tags, ...item.occasions].some(t => t.toLowerCase() === filter.toLowerCase());
    return itemTopic(item) === filter;
  }).sort((a, b) => {
    if (!sortOrder) return 0;
    const left = a.publishedAt ?? a.createdAt;
    const right = b.publishedAt ?? b.createdAt;
    return sortOrder === "newest" ? right.localeCompare(left) : left.localeCompare(right);
  });
  const filterPreviewCount = items.filter(current => {
    if (draftTopic !== "All" && itemTopic(current) !== draftTopic) return false;
    if (draftTag === "All") return true;
    const aliases: Record<string, string[]> = { Club: ["club", "going out", "night out"], Comfy: ["comfy", "comfortable", "cozy"], Layers: ["layers", "layering"] };
    const wanted = aliases[draftTag] ?? [draftTag.toLowerCase()];
    return [...current.tags, ...current.occasions].some(value => wanted.includes(value.toLowerCase()));
  }).length;
  const savedPreviewCount = items.filter(current => {
    if (draftSaved === "favorites") return current.favorite;
    return builds.some(build => build.kind === (draftSaved === "outfits" ? "outfit" : "collection") && build.itemIds.includes(current.id));
  }).length;
  async function toggleFavorite(current: WardrobeItem) {
    if (favoriteBusy) return;
    setFavoriteBusy(current.id);
    setFavoriteError("");
    try {
      await mutate({ action: "mark", id: current.id, field: "favorite", value: !current.favorite });
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Could not update this favorite.");
    } finally {
      setFavoriteBusy(null);
    }
  }
  return <section className={`closet-browser${compact ? " closet-browser--compact" : ""}`}>
    <div className="closet-browser__controls">
      <div className="mobile-closet-toolbar" aria-label="Closet controls">
        <button type="button" aria-label="Filters" title="Filters" className={sheet === "filters" || appliedTopic !== "All" || appliedTag !== "All" ? "is-active" : ""} onClick={() => setSheet("filters")}><SlidersHorizontal color="#3d3d3d" weight="regular" aria-hidden="true"/><span>Filters</span></button>
        <button type="button" aria-label="Sort" title="Sort" className={sheet === "sort" ? "is-active" : ""} onClick={() => setSheet("sort")}><SortDescending color="#3d3d3d" weight="regular" aria-hidden="true"/><span>Sort</span></button>
        <button type="button" aria-label="Saved" title="Saved" className={sheet === "saved" || savedView ? "is-active" : ""} onClick={() => setSheet("saved")}><FloppyDisk color="#3d3d3d" weight="regular" aria-hidden="true"/><span>Saved</span></button>
      </div>
      <div className="closet-browser__filters" aria-label={mode === "topics" ? "Categories" : "Tags"}>{(mode === "topics" ? topics : tags).map(value => <button key={value} className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
    </div>
    <p className="mobile-closet-count" aria-live="polite">({visible.length}) {visible.length === 1 ? "item" : "items"}</p>
    <p className="closet-browser__display-count" aria-live="polite">Displaying {visible.length} {visible.length === 1 ? "item" : "items"}</p>
    {favoriteError && <p className="wc-notice" role="alert">{favoriteError}</p>}
    {visible.length ? <div className="closet-browser__grid">{visible.map(current => <article className={"closet-browser__item" + (selected.includes(current.id) ? " wc-selected" : "")} key={current.id}>
      <button type="button" className="closet-browser__item-open" aria-label={(choose ? (selected.includes(current.id) ? "Remove " : "Add ") : "Open details for ") + current.name} aria-pressed={choose ? selected.includes(current.id) : undefined} onClick={() => choose ? choose(current) : setItem(current)}>
        <div className="closet-browser__visual"><ItemPhoto item={current}/></div>
        <span className="closet-browser__item-meta"><small>{itemTopic(current)}</small><strong>{current.name}</strong></span>
      </button>
      <button type="button" className="closet-browser__favorite" disabled={favoriteBusy === current.id} aria-label={current.favorite ? `Remove ${current.name} from favorites` : `Add ${current.name} to favorites`} aria-pressed={current.favorite} onClick={() => void toggleFavorite(current)}><Heart filled={current.favorite}/></button>
    </article>)}</div> : <Empty>{items.length ? "No items in this category yet." : "Your clothes will appear here once they have been reviewed and published."}</Empty>}
    {item && <ItemDetails item={item} close={() => setItem(null)}/>}
    {sheet === "filters" && <MobileClosetSheet title="Filters" close={() => setSheet(null)}>
      <div className="closet-sheet-tabs" aria-label="Filter type">
        {(["topics", "tags"] as const).map(value => <button type="button" key={value} className={mode === value ? "is-selected" : ""} aria-pressed={mode === value} onClick={() => { setMode(value); setFilter("All"); setAppliedTopic("All"); setAppliedTag("All"); setSavedView(null); setSheet(null); }}>{value}</button>)}
      </div>
    </MobileClosetSheet>}
    {sheet === "sort" && <MobileClosetSheet title="Sort" close={() => setSheet(null)}>
      <div className="mobile-radio-list">{(["newest", "oldest"] as SortOrder[]).map(value => <label key={value}><input type="radio" name="closet-sort" value={value} checked={draftSort === value} onChange={() => { setDraftSort(value); setSortOrder(value); setSheet(null); }}/><span>{value}</span></label>)}</div>
    </MobileClosetSheet>}
    {sheet === "saved" && <MobileClosetSheet title="Saved" close={() => setSheet(null)}>
      <div className="mobile-radio-list">{([['favorites', 'Favorites'], ['outfits', 'Saved Outfits'], ['collections', 'Collections']] as [SavedView, string][]).map(([value, label]) => <label key={value}><input type="radio" name="closet-saved" value={value} checked={draftSaved === value} onChange={() => { setDraftSaved(value); setSavedView(value); setAppliedTopic("All"); setAppliedTag("All"); setSheet(null); }}/><span>{label}</span></label>)}</div>
    </MobileClosetSheet>}
  </section>;
}

function RecentList({ items }: { items: WardrobeItem[] }) {
  const { mutate } = useWardrobe();
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [favoriteBusy, setFavoriteBusy] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState("");
  const sortedItems = [...items].sort((a, b) => {
    const left = a.publishedAt ?? a.createdAt;
    const right = b.publishedAt ?? b.createdAt;
    return sortOrder === "newest" ? right.localeCompare(left) : left.localeCompare(right);
  });

  async function toggleFavorite(item: WardrobeItem) {
    if (favoriteBusy) return;
    setFavoriteBusy(item.id);
    setFavoriteError("");
    try {
      await mutate({ action: "mark", id: item.id, field: "favorite", value: !item.favorite });
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Could not update this favorite.");
    } finally {
      setFavoriteBusy(null);
    }
  }

  return <section className="recent-list">
    <div className="recent-list__sort" aria-label="Sort recent pieces">
      <button type="button" aria-label="Newest to oldest" aria-pressed={sortOrder === "newest"} onClick={() => setSortOrder("newest")}><SortDescending aria-hidden="true"/></button>
      <button type="button" aria-label="Oldest to newest" aria-pressed={sortOrder === "oldest"} onClick={() => setSortOrder("oldest")}><SortAscending aria-hidden="true"/></button>
      <span>{sortOrder === "newest" ? "Newest to oldest" : "Oldest to newest"}</span>
    </div>
    {favoriteError && <p className="wc-notice" role="alert">{favoriteError}</p>}
    {sortedItems.length ? <div className="recent-list__items">
      {sortedItems.map(item => <article className="recent-card" key={item.id}>
        <div className="recent-card__photo"><ItemPhoto item={item}/></div>
        <div className="recent-card__meta"><strong>{item.name}</strong><small>{itemTopic(item)}</small></div>
        <div className="recent-card__actions">
          <button type="button" disabled={favoriteBusy === item.id} aria-pressed={item.favorite} onClick={() => void toggleFavorite(item)}><span>{item.favorite ? "Favorited" : "Favorite"}</span><Heart filled={item.favorite}/></button>
          <Link href={`/mobile/database?item=${item.id}`}><span>Edit Info</span><PencilSimple aria-hidden="true"/></Link>
        </div>
      </article>)}
    </div> : <Empty>Your clothes will appear here once they have been reviewed and published.</Empty>}
  </section>;
}

export function BrowsePage({ view }: { view: "closet" | "favorites" | "recent" }) {
  const { data } = useWardrobe();
  const items = [...(data?.items ?? [])].filter(i => view !== "favorites" || i.favorite);
  if (view === "recent") items.sort((a,b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  return <PageShell title={view === "closet" ? "The Closet" : view === "favorites" ? "Favorites" : "Recent"}><DataGate>{view === "recent" ? <>
    <RecentList items={items}/>
    <div className="recent-mobile-grid"><ItemGrid items={items} builds={data?.builds ?? []}/></div>
  </> : <ItemGrid items={items} builds={data?.builds ?? []}/>}</DataGate></PageShell>;
}
