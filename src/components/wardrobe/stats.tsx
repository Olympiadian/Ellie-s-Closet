"use client";

import { useMemo, useState } from "react";
import type { CalendarPlan, WardrobeItem } from "@/lib/wardrobe";
import { DataGate, useWardrobe } from "./provider";
import { Empty, PageShell } from "./ui";

type Period = "all" | "180" | "30";

const periods: { label: string; value: Period }[] = [
  { label: "All time", value: "all" },
  { label: "Last 180 days", value: "180" },
  { label: "Last 30 days", value: "30" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function titleCase(value: string) {
  return value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function inPeriod(value: string | undefined, period: Period, now: Date) {
  if (period === "all") return true;
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  const cutoff = now.getTime() - Number(period) * 24 * 60 * 60 * 1000;
  return Number.isFinite(timestamp) && timestamp >= cutoff;
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="stats-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function RankedBars({
  rows,
  empty,
}: {
  rows: { label: string; value: number; detail?: string }[];
  empty: string;
}) {
  const largest = Math.max(...rows.map((row) => row.value), 1);

  if (!rows.length) return <Empty>{empty}</Empty>;

  return (
    <div className="stats-bars">
      {rows.map((row, index) => (
        <div className="stats-bars__row" key={row.label}>
          <div className="stats-bars__label">
            <span>{row.label}</span>
            <small>{row.detail ?? `${row.value} ${row.value === 1 ? "piece" : "pieces"}`}</small>
          </div>
          <div className="stats-bars__track" aria-hidden="true">
            <span style={{ width: `${Math.max((row.value / largest) * 100, 4)}%`, "--bar-index": index } as React.CSSProperties} />
          </div>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function getPlanItems(plans: CalendarPlan[], items: WardrobeItem[]) {
  const uses = new Map<string, number>();
  plans.forEach((plan) => plan.itemIds.forEach((id) => uses.set(id, (uses.get(id) ?? 0) + 1)));
  const top = [...uses.entries()].sort((a, b) => b[1] - a[1])[0];
  const item = top ? items.find((candidate) => candidate.id === top[0]) : undefined;
  return item && top ? { name: item.name, uses: top[1] } : null;
}

function StatsContents() {
  const { data } = useWardrobe();
  const [period, setPeriod] = useState<Period>("all");
  const now = useMemo(() => new Date(), []);

  const stats = useMemo(() => {
    const allItems = data?.items ?? [];
    const items = allItems.filter((item) => inPeriod(item.createdAt, period, now));
    const builds = (data?.builds ?? []).filter((build) => inPeriod(build.createdAt, period, now));
    const plans = (data?.plans ?? []).filter((plan) => inPeriod(`${plan.date}T12:00:00`, period, now));
    const priced = items.filter((item) => item.cost !== null);
    const totalValue = priced.reduce((sum, item) => sum + (item.cost ?? 0), 0);
    const categories = new Map<string, number>();
    const stores = new Map<string, { count: number; value: number }>();

    items.forEach((item) => {
      categories.set(item.category, (categories.get(item.category) ?? 0) + 1);
      const store = item.store.trim() || "Store not added";
      const current = stores.get(store) ?? { count: 0, value: 0 };
      stores.set(store, { count: current.count + 1, value: current.value + (item.cost ?? 0) });
    });

    const categoryRows = [...categories.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label: titleCase(label), value }));
    const storeRows = [...stores.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([label, value]) => ({
        label,
        value: value.count,
        detail: value.value ? `${value.count} ${value.count === 1 ? "piece" : "pieces"} · ${money.format(value.value)}` : `${value.count} ${value.count === 1 ? "piece" : "pieces"}`,
      }));

    return {
      items,
      builds,
      plans,
      priced,
      totalValue,
      categoryRows,
      storeRows,
      favorites: items.filter((item) => item.favorite).length,
      saved: items.filter((item) => item.saved).length,
      topCategory: categoryRows[0]?.label ?? "—",
      topStore: storeRows[0]?.label ?? "—",
      mostPlanned: getPlanItems(plans, allItems),
    };
  }, [data, now, period]);

  const periodNote = period === "all" ? "Across your whole closet" : `Added in the last ${period} days`;

  return (
    <DataGate>
      <div className="stats-dashboard wc-content">
        <header className="stats-dashboard__intro">
          <div>
            <p className="stats-dashboard__eyebrow">Your closet, at a glance</p>
            <h2>A clearer look at what you own.</h2>
            <p>See where your closet is strongest, what it’s worth, and where your pieces came from.</p>
          </div>
          <div className="stats-period" role="group" aria-label="Stats time period">
            {periods.map((option) => (
              <button
                type="button"
                key={option.value}
                aria-pressed={period === option.value}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        <section className="stats-summary" aria-label="Closet summary">
          <StatCard label="Pieces" value={String(stats.items.length)} note={periodNote} />
          <StatCard label="Closet value" value={money.format(stats.totalValue)} note={`${stats.priced.length} priced pieces`} />
          <StatCard label="Average price" value={stats.priced.length ? money.format(stats.totalValue / stats.priced.length) : "$0"} note="Across priced pieces" />
          <StatCard label="Favorites" value={String(stats.favorites)} note={`${stats.saved} more saved for later`} />
        </section>

        <section className="stats-dashboard__grid">
          <article className="stats-panel stats-panel--wide">
            <header>
              <div>
                <span className="stats-panel__kicker">Category mix</span>
                <h3>What’s in your closet</h3>
              </div>
              <span className="stats-panel__total">{stats.items.length} total</span>
            </header>
            <RankedBars rows={stats.categoryRows} empty="No pieces were added in this time period." />
          </article>

          <article className="stats-panel">
            <header>
              <div>
                <span className="stats-panel__kicker">Stores</span>
                <h3>Where it came from</h3>
              </div>
            </header>
            <RankedBars rows={stats.storeRows} empty="Store details will appear as they’re added." />
          </article>

          <article className="stats-panel stats-snapshot">
            <header>
              <div>
                <span className="stats-panel__kicker">Collection notes</span>
                <h3>The quick read</h3>
              </div>
            </header>
            <dl>
              <div><dt>Largest category</dt><dd>{stats.topCategory}</dd></div>
              <div><dt>Top store</dt><dd>{stats.topStore}</dd></div>
              <div><dt>Outfits saved</dt><dd>{stats.builds.length}</dd></div>
              <div><dt>Looks planned</dt><dd>{stats.plans.length}</dd></div>
              <div><dt>Most planned piece</dt><dd>{stats.mostPlanned ? `${stats.mostPlanned.name} · ${stats.mostPlanned.uses}×` : "Not enough plans yet"}</dd></div>
            </dl>
          </article>
        </section>
      </div>
    </DataGate>
  );
}

export function StatsPage() {
  return <PageShell title="Closet Stats"><StatsContents /></PageShell>;
}
