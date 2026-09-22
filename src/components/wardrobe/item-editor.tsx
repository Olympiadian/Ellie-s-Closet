"use client";
import { useState, type FormEvent } from "react";
import { clothingCategories } from "@/lib/types";
import { itemIssues, type ItemFields, type WardrobeItem } from "@/lib/wardrobe";
import { useWardrobe } from "./provider";

const fieldNames = ["name", "color", "size", "store"] as const;
const standardTags = ["Everyday", "Work", "Club", "Church", "Comfy", "Basic", "Layers", "Formal", "Active"];
export function ItemEditor({ item, onSaved }: { item: WardrobeItem; onSaved?: () => void }) {
  const { mutate } = useWardrobe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedTags, setSelectedTags] = useState(item.tags);
  const tagOptions = [...new Set([...standardTags, ...item.tags])];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const string = (name: string) => String(form.get(name) ?? "").trim();
    const fields: ItemFields = {
      ...Object.fromEntries(fieldNames.map(name => [name, string(name)])) as Pick<ItemFields, typeof fieldNames[number]>,
      subcategory: item.subcategory,
      fit: item.fit,
      category: string("category") as ItemFields["category"],
      tags: form.getAll("tags").map(String), occasions: item.occasions,
      cost: string("cost") ? Number(string("cost")) : null, details: string("details"),
      issues: form.getAll("issues").map(String),
    };
    try { await mutate({ action: "editItem", id: item.id, fields }); setMessage("Details saved."); onSaved?.(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <form className="wc-form" onSubmit={submit}>
    <div className="wc-form-grid">{fieldNames.map(name => <label key={name}><span>{name}</span><input name={name} defaultValue={item[name]} required={name === "name"} maxLength={160}/></label>)}
      <label><span>Topic</span><select name="category" defaultValue={item.category}>{clothingCategories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></label>
      <label><span>Cost (USD)</span><input name="cost" type="number" min="0" max="100000" step="0.01" defaultValue={item.cost ?? ""}/></label>
    </div>
    <div className="wc-field"><span>Tags</span><details className="wc-tag-select"><summary>{selectedTags.length ? selectedTags.join(", ") : "Select tags"}</summary><div>{tagOptions.map(tag => <label className="wc-check" key={tag}><input type="checkbox" name="tags" value={tag} checked={selectedTags.includes(tag)} onChange={event => setSelectedTags(current => event.target.checked ? [...current, tag] : current.filter(value => value !== tag))}/>{tag}</label>)}</div></details></div>
    <label><span>Details</span><textarea name="details" defaultValue={item.details} rows={4} maxLength={4000}/></label>
    {item.issues.length > 0 && <fieldset><legend>Still needs review — uncheck anything resolved</legend>{item.issues.map(issue => <label className="wc-check" key={issue}><input type="checkbox" name="issues" value={issue} defaultChecked/>{issue}</label>)}</fieldset>}
    <p className="wc-muted">Missing fields clear from the log when you fill them in.</p>
    <button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Saving…" : "Save details"}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
export function IssueList({ item }: { item: WardrobeItem }) {
  return <span className="wc-issues">{itemIssues(item).map(issue => <span key={issue}>{issue}</span>)}</span>;
}
