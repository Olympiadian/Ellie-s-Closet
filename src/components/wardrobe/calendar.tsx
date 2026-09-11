"use client";

import { useEffect, useState, type FormEvent } from "react";
import { localDate, type CalendarPlan } from "@/lib/wardrobe";
import { ItemGrid } from "./browse";
import { DataGate, useWardrobe } from "./provider";
import { Drawer, PageShell } from "./ui";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

function weekStartFor(value: string) {
  const date = dateFromKey(value);
  date.setDate(date.getDate() - date.getDay());
  return localDate(date);
}

export function CalendarPage() {
  const { data, mutate } = useWardrobe();
  const today = localDate();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [weekStart, setWeekStart] = useState(() => weekStartFor(today));
  const [selected, setSelected] = useState<string | null>(null);
  const [draftItemIds, setDraftItemIds] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const first = new Date(`${month}-01T12:00:00`);
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const plan = data?.plans.find((entry) => entry.date === selected);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = dateFromKey(weekStart);
    date.setDate(date.getDate() + index);
    return { date, key: localDate(date) };
  });
  const weekLabel = `${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!selected || !isMobile) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [isMobile, selected]);

  function selectDate(date: string) {
    const existing = data?.plans.find((entry) => entry.date === date);
    setSelected(date);
    setDraftItemIds(existing?.itemIds ?? []);
    setDraftNote(existing?.note ?? "");
    setMessage("");
  }

  function moveMonth(direction: number) {
    const date = new Date(first.getFullYear(), first.getMonth() + direction, 1, 12);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }

  function moveWeek(direction: number) {
    const date = dateFromKey(weekStart);
    date.setDate(date.getDate() + direction * 7);
    setWeekStart(localDate(date));
  }

  function planLabels(entry?: CalendarPlan) {
    return entry
      ? [
          ...entry.buildIds.map((id) => data?.builds.find((build) => build.id === id)?.name),
          ...entry.itemIds.map((id) => data?.items.find((item) => item.id === id)?.name),
        ].filter((label): label is string => Boolean(label))
      : [];
  }

  async function savePlan(itemIds: FormDataEntryValue[] | string[], buildIds: FormDataEntryValue[] | string[], note: FormDataEntryValue | string | null) {
    setBusy(true);
    setMessage("");
    try {
      await mutate({
        action: "plan",
        date: selected,
        itemIds,
        buildIds,
        note,
      });
      setSelected(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await savePlan(form.getAll("itemIds"), form.getAll("buildIds"), form.get("note"));
  }

  function toggleDraftItem(id: string) {
    setDraftItemIds((current) => current.includes(id) ? current.filter((candidate) => candidate !== id) : [...current, id]);
  }

  return (
    <PageShell title="Calendar">
      <DataGate>
        <section className="wc-content wc-calendar">
          <div className="wc-calendar__desktop">
            <header className="wc-calendar__header">
              <button className="wc-icon-button" aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button>
              <h2>{first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
              <button className="wc-icon-button" aria-label="Next month" onClick={() => moveMonth(1)}>›</button>
            </header>
            <button className="wc-text-link" onClick={() => setMonth(today.slice(0, 7))}>Today</button>
            <div className="wc-calendar__grid">
              {weekdays.map((day) => <span className="wc-calendar__weekday" key={day}>{day}</span>)}
              {Array.from({ length: first.getDay() }, (_, index) => <span key={`blank-${index}`} />)}
              {Array.from({ length: count }, (_, index) => {
                const date = `${month}-${String(index + 1).padStart(2, "0")}`;
                const entry = data?.plans.find((candidate) => candidate.date === date);
                const labels = planLabels(entry);
                return (
                  <button
                    key={date}
                    className={`wc-calendar__day${date === today ? " is-today" : ""}`}
                    aria-label={`Plan outfit for ${date}`}
                    onClick={() => selectDate(date)}
                  >
                    <b>{index + 1}</b>
                    {labels.slice(0, 2).map((name) => <span key={name}>{name}</span>)}
                    {labels.length > 2 && <small>+{labels.length - 2} more</small>}
                    {entry?.note && <small>Note added</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="mobile-week-calendar" aria-label={`Week of ${weekLabel}`}>
            <header className="mobile-week-calendar__header">
              <div>
                <p>This week</p>
                <h2>{weekLabel}</h2>
              </div>
              <div className="mobile-week-calendar__controls">
                <button aria-label="Previous week" onClick={() => moveWeek(-1)}>‹</button>
                <button aria-label="Next week" onClick={() => moveWeek(1)}>›</button>
              </div>
            </header>
            <button className="mobile-week-calendar__today" onClick={() => setWeekStart(weekStartFor(today))}>Today</button>
            <div className="mobile-week-calendar__days">
              {weekDays.map(({ date, key }) => {
                const entry = data?.plans.find((candidate) => candidate.date === key);
                const labels = planLabels(entry);
                const summary = labels[0] ?? (entry?.note ? "Note added" : "Nothing planned yet");
                return (
                  <button
                    key={key}
                    className={`mobile-week-calendar__day${key === today ? " is-today" : ""}${entry ? " has-plan" : ""}`}
                    aria-label={`Plan outfit for ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`}
                    onClick={() => selectDate(key)}
                  >
                    <span className="mobile-week-calendar__date">
                      <small>{date.toLocaleDateString("en-US", { weekday: "short" })}</small>
                      <strong>{date.getDate()}</strong>
                    </span>
                    <span className="mobile-week-calendar__plan">
                      <strong>{date.toLocaleDateString("en-US", { weekday: "long" })}</strong>
                      <small>{summary}</small>
                    </span>
                    {labels.length > 1 && <span className="mobile-week-calendar__count">+{labels.length - 1}</span>}
                    <span className="mobile-week-calendar__chevron" aria-hidden="true">›</span>
                  </button>
                );
              })}
            </div>
          </section>
        </section>
      </DataGate>

      {selected && !isMobile && (
        <Drawer
          title={dateFromKey(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          close={() => { if (!busy) setSelected(null); }}
          small
        >
          <form className="wc-form wc-calendar-plan-form--desktop" onSubmit={save}>
            <fieldset>
              <legend>Saved outfits &amp; collections</legend>
              {data?.builds.length ? data.builds.map((build) => (
                <label className="wc-check" key={build.id}>
                  <input type="checkbox" name="buildIds" value={build.id} defaultChecked={plan?.buildIds.includes(build.id)} />
                  {build.name}
                </label>
              )) : <p className="wc-muted">Save a build to plan it here.</p>}
            </fieldset>
            <fieldset>
              <legend>Individual items</legend>
              <div className="wc-checkbox-list">
                {data?.items.map((item) => (
                  <label className="wc-check" key={item.id}>
                    <input type="checkbox" name="itemIds" value={item.id} defaultChecked={plan?.itemIds.includes(item.id)} />
                    {item.name}
                  </label>
                ))}
              </div>
            </fieldset>
            <label>
              Note
              <textarea name="note" rows={3} maxLength={1000} defaultValue={plan?.note} />
            </label>
            <p className="wc-muted">Uncheck everything and clear the note to leave this day empty.</p>
            <button className="wc-button wc-button--accent" disabled={busy}>{busy ? "Saving…" : "Save plan"}</button>
            {message && <p role="alert">{message}</p>}
          </form>
        </Drawer>
      )}

      {selected && isMobile && (
        <div
          className="mobile-calendar-drawer__backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !busy) setSelected(null);
          }}
        >
          <section className="mobile-calendar-drawer" role="dialog" aria-modal="true" aria-labelledby="mobile-calendar-drawer-title">
            <header className="mobile-calendar-drawer__header">
              <h2 id="mobile-calendar-drawer-title">{dateFromKey(selected).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2>
              <button type="button" className="wc-icon-button" onClick={() => { if (!busy) setSelected(null); }} aria-label="Close panel">×</button>
            </header>
            <section className="mobile-calendar-picker" aria-label="Choose clothes for this day">
            <p className="mobile-calendar-picker__intro">Choose any pieces you want to wear. Tap an item again to remove it.</p>
            <ItemGrid
              items={data?.items ?? []}
              builds={data?.builds ?? []}
              choose={(item) => toggleDraftItem(item.id)}
              selected={draftItemIds}
            />
            <label className="mobile-calendar-picker__note">
              Note
              <textarea rows={2} maxLength={1000} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} />
            </label>
            <button
              type="button"
              className="wc-button wc-button--accent mobile-calendar-picker__save"
              disabled={busy}
              onClick={() => void savePlan(draftItemIds, plan?.buildIds ?? [], draftNote)}
            >
              {busy ? "Saving…" : `Save ${draftItemIds.length ? `${draftItemIds.length} ${draftItemIds.length === 1 ? "item" : "items"}` : "day"}`}
            </button>
            {message && <p role="alert">{message}</p>}
            </section>
          </section>
        </div>
      )}
    </PageShell>
  );
}
