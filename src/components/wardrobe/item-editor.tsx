"use client";
import { useState, type FormEvent } from "react";
import { closetTopics, clothingCategoryLabels, clothingTags } from "@/lib/types";
import { itemIssues, type ItemFields, type WardrobeItem } from "@/lib/wardrobe";
import { useWardrobe } from "./provider";

const fieldNames = ["name", "color", "size", "store"] as const;
export function ItemEditor({ item, onSaved, onDeleted }: { item: WardrobeItem; onSaved?: () => void; onDeleted?: () => void }) {
  const { mutate } = useWardrobe();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const string = (name: string) => String(form.get(name) ?? "").trim();
    const fields: ItemFields = {
      ...Object.fromEntries(fieldNames.map(name => [name, string(name)])) as Pick<ItemFields, typeof fieldNames[number]>,
      category: string("category") as ItemFields["category"],
      subcategory: "", fit: "", occasions: [],
      tags: form.getAll("tags").map(String),
      cost: string("cost") ? Number(string("cost")) : null, details: string("details"),
      issues: form.getAll("issues").map(String),
    };
    try { await mutate({ action: "editItem", id: item.id, fields }); setMessage("Details saved."); onSaved?.(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  async function removeItem() {
    if (!window.confirm("Confirm delete?")) return;
    setBusy(true); setMessage("");
    try { await mutate({ action: "removeItem", id: item.id }); onDeleted?.(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete this item."); }
    finally { setBusy(false); }
  }
  const selectedCategory = closetTopics.includes(item.category as typeof closetTopics[number]) ? item.category : "";
  const selectedTags = item.tags.filter(tag => clothingTags.includes(tag as typeof clothingTags[number]));
  return <form className="wc-form" onSubmit={submit}>
    <div className="wc-form-grid">{fieldNames.map(name => <label key={name}><span>{name}</span><input name={name} defaultValue={item[name]} required={name === "name"} maxLength={160}/></label>)}
      <label><span>Topic</span><select name="category" defaultValue={selectedCategory} required>{selectedCategory === "" && <option value="" disabled>Choose a topic</option>}{closetTopics.map(topic => <option key={topic} value={topic}>{clothingCategoryLabels[topic]}</option>)}</select></label>
      <label><span>Cost (USD)</span><input name="cost" type="number" min="0" max="100000" step="0.01" defaultValue={item.cost ?? ""}/></label>
    </div>
    <label><span>Tags</span><select name="tags" defaultValue={selectedTags} multiple size={5}>{clothingTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}</select><small>Choose one or more tags.</small></label>
    <label><span>Details</span><textarea name="details" defaultValue={item.details} rows={4} maxLength={4000}/></label>
    {item.issues.length > 0 && <fieldset><legend>Still needs review — uncheck anything resolved</legend>{item.issues.map(issue => <label className="wc-check" key={issue}><input type="checkbox" name="issues" value={issue} defaultChecked/>{issue}</label>)}</fieldset>}
    <p className="wc-muted">Missing fields clear from the log when you fill them in.</p>
    <button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Saving…" : "Save details"}</button>
    <button type="button" className="wc-button wc-button--danger" disabled={busy} onClick={() => void removeItem()}>Delete clothing item</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
export function IssueList({ item }: { item: WardrobeItem }) {
  return <span className="wc-issues">{itemIssues(item).map(issue => <span key={issue}>{issue}</span>)}</span>;
}
