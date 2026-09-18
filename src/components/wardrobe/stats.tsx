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

type ValueCurvePoint = {
  itemShare: number;
  valueShare: number;
};

function getValueCurvePoints(items: WardrobeItem[]) {
  const pricedItems = items
    .filter((item) => typeof item.cost === "number" && Number.isFinite(item.cost))
    .sort((first, second) => (first.cost ?? 0) - (second.cost ?? 0));
  const totalValue = pricedItems.reduce((sum, item) => sum + (item.cost ?? 0), 0);

  if (!pricedItems.length || totalValue <= 0) return [];

  let cumulativeValue = 0;
  const points: ValueCurvePoint[] = [{ itemShare: 0, valueShare: 0 }];
  pricedItems.forEach((item, index) => {
    cumulativeValue += item.cost ?? 0;
    points.push({
      itemShare: (index + 1) / pricedItems.length,
      valueShare: cumulativeValue / totalValue,
    });
  });

  if (points.length <= 9) return points;

  return Array.from({ length: 9 }, (_, index) => points[Math.round((index * (points.length - 1)) / 8)]);
}

function ClosetValueCurve({ points }: { points: ValueCurvePoint[] }) {
  if (!points.length) return <Empty>Add prices to see how your closet value is distributed.</Empty>;

  const width = 720;
  const height = 220;
  const padding = { top: 14, right: 14, bottom: 28, left: 14 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const position = (point: ValueCurvePoint) => ({
    x: padding.left + point.itemShare * plotWidth,
    y: padding.top + (1 - point.valueShare) * plotHeight,
  });
  const coordinates = points.map(position);
  const path = coordinates
    .map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x.toFixed(1)} ${coordinate.y.toFixed(1)}`)
    .join(" ");

  return (
    <figure className="stats-timeline__figure" aria-label="Closet value distribution curve">
      <div className="stats-timeline__legend" aria-hidden="true">
        <span><i className="stats-timeline__key stats-timeline__key--value" />Your closet value</span>
        <span><i className="stats-timeline__key stats-timeline__key--benchmark" />Evenly spread value</span>
      </div>
      <svg className="stats-timeline__chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="A cumulative curve showing how your recorded closet value is distributed across priced pieces, from least to most expensive.">
        <title>Closet value distribution</title>
        {[.25, .5, .75].map((line) => (
          <line key={line} className="stats-timeline__grid-line" x1={padding.left} x2={width - padding.right} y1={padding.top + plotHeight * line} y2={padding.top + plotHeight * line} />
        ))}
        <path className="stats-timeline__line stats-timeline__line--benchmark" d={`M${padding.left} ${padding.top + plotHeight} L${width - padding.right} ${padding.top}`} />
        <path className="stats-timeline__line stats-timeline__line--value" d={path} />
        {coordinates.slice(1).map((coordinate, index) => (
          <circle className="stats-timeline__point stats-timeline__point--value" key={index} cx={coordinate.x} cy={coordinate.y} r="3.5" />
        ))}
        <text className="stats-timeline__axis-label" x={padding.left} y={height - 6}>0%</text>
        <text className="stats-timeline__axis-label" x={width / 2} y={height - 6} textAnchor="middle">50% of pieces</text>
        <text className="stats-timeline__axis-label" x={width - padding.right} y={height - 6} textAnchor="end">100%</text>
      </svg>
      <figcaption>
        <span><b>Least expensive</b> pieces first</span>
        <span><b>Highest-priced</b> pieces finish the curve</span>
      </figcaption>
    </figure>
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
    const highestValuePieces = [...priced].sort((first, second) => (second.cost ?? 0) - (first.cost ?? 0));
    const concentrationCount = Math.ceil(highestValuePieces.length / 4);
    const concentrationValue = highestValuePieces
      .slice(0, concentrationCount)
      .reduce((sum, item) => sum + (item.cost ?? 0), 0);

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
      valueCurvePoints: getValueCurvePoints(items),
      concentration: priced.length && totalValue > 0
        ? {
          pieces: concentrationCount,
          valueShare: Math.round((concentrationValue / totalValue) * 100),
        }
        : null,
    };
  }, [data, now, period]);

  const periodNote = period === "all" ? "Across your whole closet" : `Added in the last ${period} days`;

  return (
    <DataGate>
      <div className="stats-dashboard wc-content">
        <header className="stats-dashboard__intro">
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

        <section className="stats-panel stats-timeline" aria-labelledby="closet-timeline-title">
          <header>
            <div>
              <p className="stats-timeline__eyebrow">Value perspective</p>
              <h3 id="closet-timeline-title">Where your closet value lives</h3>
            </div>
            <span className="stats-panel__total">{stats.priced.length} priced</span>
          </header>
          <p className="stats-timeline__description">See whether your closet’s worth is shared across many pieces or carried by a small set of higher-value ones. The closer the blue line is to the diagonal, the more evenly your value is spread.</p>
          <ClosetValueCurve points={stats.valueCurvePoints} />
          <div className="stats-timeline__insight">
            <span>Value concentration</span>
            {stats.concentration ? (
              <p>Your top {stats.concentration.pieces} {stats.concentration.pieces === 1 ? "priced piece accounts" : "priced pieces account"} for <strong>{stats.concentration.valueShare}%</strong> of your recorded closet value.</p>
            ) : (
              <p>Add prices to see where your closet value is concentrated.</p>
            )}
          </div>
        </section>

        <section className="stats-dashboard__grid">
          <article className="stats-panel stats-panel--wide">
            <header>
              <div>
                <h3>What’s in your closet</h3>
              </div>
              <span className="stats-panel__total">{stats.items.length} total</span>
            </header>
            <RankedBars rows={stats.categoryRows} empty="No pieces were added in this time period." />
          </article>

          <article className="stats-panel">
            <header>
              <div>
                <h3>Where it came from</h3>
              </div>
            </header>
            <RankedBars rows={stats.storeRows} empty="Store details will appear as they’re added." />
          </article>

          <article className="stats-panel stats-snapshot">
            <header>
              <div>
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
