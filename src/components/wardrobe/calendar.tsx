"use client";
import { useState, type FormEvent } from "react";
import { localDate, type CalendarPlan } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { Drawer, PageShell } from "./ui";

export function CalendarPage() {
  const { data, mutate } = useWardrobe();
  const today = localDate();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const first = new Date(month + "-01T12:00:00");
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const plan = data?.plans.find(p => p.date === selected);
  function move(direction: number) {
    const date = new Date(first.getFullYear(), first.getMonth() + direction, 1, 12);
    setMonth(date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"));
  }
  function planLabels(plan?: CalendarPlan) {
    return plan ? [...plan.buildIds.map(id => data?.builds.find(b => b.id === id)?.name), ...plan.itemIds.map(id => data?.items.find(i => i.id === id)?.name)].filter((s): s is string => !!s) : [];
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try { await mutate({ action: "plan", date: selected, itemIds: form.getAll("itemIds"), buildIds: form.getAll("buildIds"), note: form.get("note") }); setSelected(null); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save."); }
    finally { setBusy(false); }
  }
  return <PageShell title="Calendar"><DataGate><section className="wc-content wc-calendar"><header className="wc-calendar__header"><button className="wc-icon-button" aria-label="Previous month" onClick={() => move(-1)}>‹</button><h2>{first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2><button className="wc-icon-button" aria-label="Next month" onClick={() => move(1)}>›</button></header><button className="wc-text-link" onClick={() => setMonth(today.slice(0, 7))}>Today</button><div className="wc-calendar__grid">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <span className="wc-calendar__weekday" key={d}>{d}</span>)}{Array.from({ length: first.getDay() }, (_, i) => <span key={"blank" + i}/>)}{Array.from({ length: count }, (_, i) => {
      const date = month + "-" + String(i + 1).padStart(2, "0");
      const plan = data?.plans.find(p => p.date === date);
      return <button key={date} className={"wc-calendar__day" + (date === today ? " is-today" : "")} aria-label={"Plan outfit for " + date} onClick={() => { setSelected(date); setMessage(""); }}><b>{i + 1}</b>{planLabels(plan).slice(0, 2).map((name, n) => <span key={n}>{name}</span>)}{planLabels(plan).length > 2 && <small>+{planLabels(plan).length - 2} more</small>}{plan?.note && <small>Note added</small>}</button>;
    })}</div></section>
      {selected && <Drawer title={new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} close={() => { if (!busy) setSelected(null); }} small><form className="wc-form" onSubmit={save}><fieldset><legend>Saved outfits & collections</legend>{data?.builds.length ? data.builds.map(build => <label className="wc-check" key={build.id}><input type="checkbox" name="buildIds" value={build.id} defaultChecked={plan?.buildIds.includes(build.id)}/>{build.name}</label>) : <p className="wc-muted">Save a build to plan it here.</p>}</fieldset><fieldset><legend>Individual items</legend><div className="wc-checkbox-list">{data?.items.map(item => <label className="wc-check" key={item.id}><input type="checkbox" name="itemIds" value={item.id} defaultChecked={plan?.itemIds.includes(item.id)}/>{item.name}</label>)}</div></fieldset><label>Note<textarea name="note" rows={3} maxLength={1000} defaultValue={plan?.note}/></label><p className="wc-muted">Uncheck everything and clear the note to leave this day empty.</p><button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Saving…" : "Save plan"}</button>{message && <p role="alert">{message}</p>}</form></Drawer>}
  </DataGate></PageShell>;
}
