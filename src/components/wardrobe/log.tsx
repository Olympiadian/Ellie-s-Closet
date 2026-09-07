"use client";
import { useEffect, useState } from "react";
import { itemIssues, type WardrobeItem } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { Drawer, Empty, PageShell } from "./ui";
import { ItemEditor, IssueList } from "./item-editor";

export function LogContents() {
  const { data } = useWardrobe();
  const [query, setQuery] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  const [item, setItem] = useState<WardrobeItem | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("item");
    if (!id || !data) return;
    const selected = data.items.find(i => i.id === id);
    if (selected) {
      // Resolve an item deep-link only after its remote record is available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItem(selected);
      history.replaceState(null, "", window.location.pathname);
    }
  }, [data]);
  const items = (data?.items ?? []).filter(i => (!onlyFlagged || itemIssues(i).length) && [i.name, i.category, ...i.tags].join(" ").toLowerCase().includes(query.toLowerCase()));
  return <DataGate><div className="wc-content"><div className="wc-log-tools"><label className="wc-search"><span className="sr-only">Search clothes</span><input placeholder="Find an item…" value={query} onChange={e => setQuery(e.target.value)}/></label><label className="wc-check"><input type="checkbox" checked={onlyFlagged} onChange={e => setOnlyFlagged(e.target.checked)}/>Needs attention only</label></div>
    {items.length ? <div className="wc-record-list">{items.map(item => <button key={item.id} onClick={() => setItem(item)}><span><strong>{item.name}</strong><small>{item.category} · {item.color || "Color not added"}</small><IssueList item={item}/></span><span aria-hidden="true">↗</span></button>)}</div> : <Empty>{query ? "No matching clothes." : onlyFlagged ? "No published items need attention." : "Published clothes will appear here."}</Empty>}
  </div>{item && <Drawer title={item.name} close={() => setItem(null)}><ItemEditor item={item} onSaved={() => setItem(null)}/></Drawer>}</DataGate>;
}
export function LogPage() { return <PageShell title="The Log"><LogContents/></PageShell>; }
