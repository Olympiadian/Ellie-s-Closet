"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowsDownUp, BookmarkSimple, FadersHorizontal, PencilSimple, SortAscending, SortDescending } from "@phosphor-icons/react";
import type { SavedBuild, WardrobeItem } from "@/lib/wardrobe";
import { useWardrobe, DataGate } from "./provider";
import { Drawer, Empty, Heart, ItemPhoto, PageShell } from "./ui";
import { ItemEditor } from "./item-editor";

const topics = ["All", "Tops", "Jackets", "Dresses", "Sleep", "Bottoms", "Under", "Shoes", "Misc."];
const tags = ["All", "Everyday", "Work", "Club", "Church", "Comfy", "Basic", "Layers", "Formal", "Active"];

type SheetName = "filters" | "sort" | "saved";
type SortOrder = "newest" | "oldest";
type SavedView = "favorites" | "outfits" | "collections";

function MobileClosetSheet({ title, kind, close, children }: { title: string; kind: SheetName; close: () => void; children: ReactNode }) {
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
    className={`mobile-closet-sheet__backdrop mobile-closet-sheet__backdrop--${kind}`}
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
    <section ref={panelRef} className={`mobile-closet-sheet mobile-closet-sheet--${kind}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
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
  const [editing, setEditing] = useState(false);
  async function mark(field: "favorite" | "saved") {
    setBusy(true); setError("");
    try { await mutate({ action: "mark", id: current.id, field, value: !current[field] }); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <Drawer title={current.name} close={close}>
    <div className="wc-item-photos"><ItemPhoto item={current}/>{current.backUrl && <ItemPhoto item={current} side="back"/>}</div>
    <div className="wc-item-actions"><button className="wc-button" aria-pressed={current.saved} disabled={busy} onClick={() => void mark("saved")}>{current.saved ? "Saved" : "Save item"}</button><button className="wc-heart-button" disabled={busy} aria-label={current.favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={current.favorite} onClick={() => void mark("favorite")}><Heart filled={current.favorite}/></button></div>
    {error && <p role="alert">{error}</p>}
    <dl className="closet-item-drawer__details">
      {Object.entries({ Category: itemTopic(current), Tags: current.tags.join(" · "), Color: current.color, Details: [current.details, current.size && "Size " + current.size, current.store, current.cost !== null && "$" + current.cost.toFixed(2)].filter(Boolean).join(" · ") }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not added yet"}</dd></div>)}
    </dl>
    {editing ? <div className="wc-inline-editor"><ItemEditor item={current} onSaved={() => setEditing(false)} onDeleted={close}/></div> : <button type="button" className="wc-text-link" onClick={() => setEditing(true)}>Edit item information</button>}
  </Drawer>;
}
export function ItemGrid({ items, builds = [], choose, selected = [], compact = false, showDesktopCount = false, allowDelete = false }: { items: WardrobeItem[]; builds?: SavedBuild[]; choose?: (item: WardrobeItem) => void; selected?: string[]; compact?: boolean; showDesktopCount?: boolean; allowDelete?: boolean }) {
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
  const [deleteReady, setDeleteReady] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const suppressOpen = useRef<string | null>(null);
  useEffect(() => () => {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
  }, []);
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
  function cancelLongPress() {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }
  function startLongPress(current: WardrobeItem) {
    if (!allowDelete || choose || !window.matchMedia("(max-width: 1050px)").matches) return;
    cancelLongPress();
    longPressTimer.current = window.setTimeout(() => {
      suppressOpen.current = current.id;
      setDeleteReady(current.id);
      longPressTimer.current = null;
    }, 550);
  }
  function openItem(current: WardrobeItem) {
    if (suppressOpen.current === current.id) {
      suppressOpen.current = null;
      return;
    }
    if (choose) choose(current);
    else setItem(current);
  }
  async function deleteItem(current: WardrobeItem) {
    if (!window.confirm("Confirm delete?")) return;
    setDeleteBusy(current.id); setFavoriteError("");
    try {
      await mutate({ action: "removeItem", id: current.id });
      if (item?.id === current.id) setItem(null);
      setDeleteReady(null);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Could not delete this item.");
    } finally {
      setDeleteBusy(null);
    }
  }
  const sheets = <>
    {sheet === "filters" && <MobileClosetSheet title="Filters" kind="filters" close={() => setSheet(null)}>
      <div className="mobile-filter-group">
        <h3>Topics</h3>
        <div>{topics.map(value => <button type="button" key={value} className={draftTopic === value ? "is-selected" : ""} aria-pressed={draftTopic === value} onClick={() => setDraftTopic(value)}>{value}</button>)}</div>
      </div>
      <div className="mobile-filter-group">
        <h3>Tags</h3>
        <div>{tags.map(value => <button type="button" key={value} className={draftTag === value ? "is-selected" : ""} aria-pressed={draftTag === value} onClick={() => setDraftTag(value)}>{value}</button>)}</div>
      </div>
      <button type="button" className="mobile-closet-sheet__confirm" onClick={() => { setAppliedTopic(draftTopic); setAppliedTag(draftTag); setFilter("All"); setSavedView(null); setSheet(null); }}>Show {filterPreviewCount} {filterPreviewCount === 1 ? "item" : "items"}</button>
    </MobileClosetSheet>}
    {sheet === "sort" && <MobileClosetSheet title="Sort" kind="sort" close={() => setSheet(null)}>
      <div className="mobile-radio-list">{(["newest", "oldest"] as SortOrder[]).map(value => <label key={value}><input type="radio" name="closet-sort" value={value} checked={draftSort === value} onChange={() => setDraftSort(value)}/><span>{value}</span></label>)}</div>
      <button type="button" className="mobile-closet-sheet__confirm" onClick={() => { setSortOrder(draftSort); setSheet(null); }}>Apply sort</button>
    </MobileClosetSheet>}
    {sheet === "saved" && <MobileClosetSheet title="Saved" kind="saved" close={() => setSheet(null)}>
      <div className="mobile-radio-list">{([['favorites', 'Favorites'], ['outfits', 'Saved Outfits'], ['collections', 'Collections']] as [SavedView, string][]).map(([value, label]) => <label key={value}><input type="radio" name="closet-saved" value={value} checked={draftSaved === value} onChange={() => setDraftSaved(value)}/><span>{label}</span></label>)}</div>
      <button type="button" className="mobile-closet-sheet__confirm" onClick={() => { setSavedView(draftSaved); setAppliedTopic("All"); setAppliedTag("All"); setFilter("All"); setSheet(null); }}>Show {savedPreviewCount} {savedPreviewCount === 1 ? "item" : "items"}</button>
    </MobileClosetSheet>}
  </>;
  return <section className={`closet-browser${compact ? " closet-browser--compact" : ""}`}>
    <div className="closet-browser__controls">
      <div className="mobile-closet-toolbar" aria-label="Closet controls">
        <button type="button" aria-label="Filters" title="Filters" className={sheet === "filters" || appliedTopic !== "All" || appliedTag !== "All" ? "is-active" : ""} onClick={() => { setDraftTopic(appliedTopic); setDraftTag(appliedTag); setSheet("filters"); }}><FadersHorizontal weight="thin" aria-hidden="true"/><span>Filters</span></button>
        <button type="button" aria-label="Sort" title="Sort" className={sheet === "sort" ? "is-active" : ""} onClick={() => { setDraftSort(sortOrder ?? "newest"); setSheet("sort"); }}><ArrowsDownUp weight="thin" aria-hidden="true"/><span>Sort</span></button>
        <button type="button" aria-label="Saved" title="Saved" className={sheet === "saved" || savedView ? "is-active" : ""} onClick={() => { setDraftSaved(savedView ?? "favorites"); setSheet("saved"); }}><BookmarkSimple weight="thin" aria-hidden="true"/><span>Saved</span></button>
      </div>
      <div className="closet-browser__filters" aria-label={mode === "topics" ? "Categories" : "Tags"}>{(mode === "topics" ? topics : tags).map(value => <button key={value} className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
      {showDesktopCount && <p className="mobile-closet-count wc-builder-count" aria-live="polite"><span className="wc-builder-count__desktop">Displaying {visible.length} {visible.length === 1 ? "item" : "items"}</span><span className="wc-builder-count__mobile">({visible.length}) {visible.length === 1 ? "item" : "items"}</span></p>}
      {showDesktopCount && sheets}
    </div>
    {!showDesktopCount && <p className="mobile-closet-count" aria-live="polite">({visible.length}) {visible.length === 1 ? "item" : "items"}</p>}
    {!showDesktopCount && <p className="closet-browser__display-count" aria-live="polite">Displaying {visible.length} {visible.length === 1 ? "item" : "items"}</p>}
    {favoriteError && <p className="wc-notice" role="alert">{favoriteError}</p>}
    {visible.length ? <div className="closet-browser__grid">{visible.map(current => <article className={"closet-browser__item" + (selected.includes(current.id) ? " wc-selected" : "") + (deleteReady === current.id ? " is-delete-ready" : "")} key={current.id}>
      <button type="button" className="closet-browser__item-open" aria-label={(choose ? (selected.includes(current.id) ? "Remove " : "Add ") : "Open details for ") + current.name} aria-pressed={choose ? selected.includes(current.id) : undefined} onPointerDown={() => startLongPress(current)} onPointerUp={cancelLongPress} onPointerCancel={cancelLongPress} onPointerLeave={cancelLongPress} onContextMenu={(event) => { if (allowDelete) event.preventDefault(); }} onClick={() => openItem(current)}>
        <div className="closet-browser__visual"><ItemPhoto item={current} thumbnail/></div>
        <span className="closet-browser__item-meta"><small>{itemTopic(current)}</small><strong>{current.name}</strong></span>
      </button>
      {deleteReady === current.id ? <button type="button" className="closet-browser__delete" disabled={deleteBusy === current.id} aria-label={`Delete ${current.name}`} onClick={() => void deleteItem(current)}>×</button> : <button type="button" className="closet-browser__favorite" disabled={favoriteBusy === current.id} aria-label={current.favorite ? `Remove ${current.name} from favorites` : `Add ${current.name} to favorites`} aria-pressed={current.favorite} onClick={() => void toggleFavorite(current)}><Heart filled={current.favorite}/></button>}
    </article>)}</div> : <Empty>{items.length ? "No items in this category yet." : "Your clothes will appear here once they have been reviewed and published."}</Empty>}
    {item && <ItemDetails item={item} close={() => setItem(null)}/>}
    {!showDesktopCount && sheets}
  </section>;
}

function RecentList({ items }: { items: WardrobeItem[] }) {
  const { mutate } = useWardrobe();
  const [item, setItem] = useState<WardrobeItem | null>(null);
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
        <div className="recent-card__photo"><ItemPhoto item={item} thumbnail/></div>
        <div className="recent-card__meta"><strong>{item.name}</strong><small>{itemTopic(item)}</small></div>
        <div className="recent-card__actions">
          <button type="button" disabled={favoriteBusy === item.id} aria-pressed={item.favorite} onClick={() => void toggleFavorite(item)}><span>{item.favorite ? "Favorited" : "Favorite"}</span><Heart filled={item.favorite}/></button>
          <button type="button" onClick={() => setItem(item)}><span>Edit Info</span><PencilSimple aria-hidden="true"/></button>
        </div>
      </article>)}
    </div> : <Empty>Your clothes will appear here once they have been reviewed and published.</Empty>}
    {item && <ItemDetails item={item} close={() => setItem(null)}/>}
  </section>;
}

export function BrowsePage({ view }: { view: "closet" | "favorites" | "recent" }) {
  const { data } = useWardrobe();
  const items = [...(data?.items ?? [])].filter(i => view !== "favorites" || i.favorite);
  if (view === "recent") items.sort((a,b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  return <PageShell title={view === "closet" ? "The Closet" : view === "favorites" ? "Favorites" : "Recent"}><DataGate>{view === "recent" ? <>
    <RecentList items={items}/>
    <div className="recent-mobile-grid"><ItemGrid items={items} builds={data?.builds ?? []} allowDelete/></div>
  </> : <ItemGrid items={items} builds={data?.builds ?? []} allowDelete/>}</DataGate></PageShell>;
}
