"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useWardrobe, DataGate } from "./provider";
import { Drawer, ItemPhoto, PageShell } from "./ui";
import { ItemGrid } from "./browse";

export function BuildPage() {
  const { data, mutate } = useWardrobe();
  const [ids, setIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const saveId = useRef<string | null>(null);
  function change(next: string[]) {
    setIds(next);
  }
  const items = data?.items ?? [];
  const selected = items.filter(i => ids.includes(i.id));
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      saveId.current ??= crypto.randomUUID();
      await mutate({ action: "saveBuild", id: saveId.current, name: form.get("name"), occasion: form.get("occasion"), kind: form.get("kind"), itemIds: selected.map(i => i.id) });
      saveId.current = null;
      change([]); setSaving(false); setMessage("Your build is saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <PageShell title="Build an Outfit"><DataGate>
    {message && <p className="wc-notice" role="status">{message} {!saving && <Link href="/saved">Open Saved →</Link>}</p>}
    <div className={selected.length ? "wc-builder is-building" : "wc-builder"}>
      {selected.length > 0 && <aside className="wc-build-tray" aria-label="Your build"><h2>Your build</h2><div className="wc-build-tray__items">{selected.map(item => <div className="wc-build-piece" key={item.id}><ItemPhoto item={item}/><span>{item.name}</span><button aria-label={"Remove " + item.name} onClick={() => change(ids.filter(id => id !== item.id))}>×</button></div>)}</div><button className="wc-button wc-button--accent" onClick={() => { setMessage(""); setSaving(true); }}>Save build</button></aside>}
      <ItemGrid items={items} selected={ids} choose={item => { if (!ids.includes(item.id) && selected.length < 50) { change([...ids, item.id]); setMessage(""); } }}/>
    </div>
    {saving && <Drawer title="Save your build" close={() => { if (!busy) setSaving(false); }} small><form className="wc-form" onSubmit={save}><label>Name<input name="name" required maxLength={100} placeholder="A name for this look"/></label><label>Occasion<input name="occasion" maxLength={100} placeholder="Going out, concert…"/></label><label>Save as<select name="kind"><option value="outfit">Outfit</option><option value="collection">Collection</option></select></label><button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Saving…" : "Save"}</button>{message && <p role="alert">{message}</p>}</form></Drawer>}
  </DataGate></PageShell>;
}
