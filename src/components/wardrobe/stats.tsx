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

type GrowthPoint = {
  timestamp: number;
  pieces: number;
  value: number;
};

function getGrowthPoints(items: WardrobeItem[]) {
  const indexedByDay = new Map<number, { pieces: number; value: number }>();

  items.forEach((item) => {
    const indexedAt = new Date(item.createdAt);
    if (!Number.isFinite(indexedAt.getTime())) return;
    indexedAt.setHours(0, 0, 0, 0);
    const timestamp = indexedAt.getTime();
    const current = indexedByDay.get(timestamp) ?? { pieces: 0, value: 0 };
    indexedByDay.set(timestamp, {
      pieces: current.pieces + 1,
      value: current.value + (item.cost ?? 0),
    });
  });

  let pieces = 0;
  let value = 0;
  const points = [...indexedByDay.entries()]
    .sort(([first], [second]) => first - second)
    .map(([timestamp, additions]) => {
      pieces += additions.pieces;
      value += additions.value;
      return { timestamp, pieces, value };
    });

  if (points.length <= 8) return points;

  return Array.from({ length: 8 }, (_, index) => points[Math.round((index * (points.length - 1)) / 7)]);
}

function formatChartDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(timestamp);
}

function ClosetGrowthChart({
  points,
  now,
  startLabel,
}: {
  points: GrowthPoint[];
  now: Date;
  startLabel: string;
}) {
  if (!points.length) return <Empty>Add pieces with an index date to see your closet’s growth over time.</Empty>;

  const isSinglePoint = points.length === 1;
  const finalTimestamp = Math.max(now.getTime(), points[0].timestamp + 24 * 60 * 60 * 1000);
  const displayPoints = isSinglePoint
    ? [...points, { ...points[0], timestamp: finalTimestamp }]
    : points;
  const width = 720;
  const height = 220;
  const padding = { top: 12, right: 12, bottom: 18, left: 12 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const firstTimestamp = displayPoints[0].timestamp;
  const lastTimestamp = displayPoints[displayPoints.length - 1].timestamp;
  const timeRange = Math.max(lastTimestamp - firstTimestamp, 1);
  const maxPieces = Math.max(...displayPoints.map((point) => point.pieces), 1);
  const maxValue = Math.max(...displayPoints.map((point) => point.value), 1);
  const position = (point: GrowthPoint, maximum: number) => ({
    x: padding.left + ((point.timestamp - firstTimestamp) / timeRange) * plotWidth,
    y: padding.top + (1 - point.value / maximum) * plotHeight,
  });
  const piecesCoordinates = displayPoints.map((point) => ({
    x: padding.left + ((point.timestamp - firstTimestamp) / timeRange) * plotWidth,
    y: padding.top + (1 - point.pieces / maxPieces) * plotHeight,
  }));
  const valueCoordinates = displayPoints.map((point) => position(point, maxValue));
  const path = (coordinates: { x: number; y: number }[]) => coordinates
    .map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x.toFixed(1)} ${coordinate.y.toFixed(1)}`)
    .join(" ");
  const lastPoint = displayPoints[displayPoints.length - 1];

  return (
    <figure className="stats-timeline__figure" aria-label="Closet cataloging timeline">
      <div className="stats-timeline__legend" aria-hidden="true">
        <span><i className="stats-timeline__key stats-timeline__key--value" />Recorded value</span>
        <span><i className="stats-timeline__key stats-timeline__key--pieces" />Pieces indexed</span>
      </div>
      <svg className="stats-timeline__chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`A timeline from ${startLabel.toLowerCase()} to ${formatChartDate(lastPoint.timestamp)} showing recorded closet value and pieces indexed.`}>
        <title>Closet cataloging timeline</title>
        {[.2, .5, .8].map((line) => (
          <line key={line} className="stats-timeline__grid-line" x1={padding.left} x2={width - padding.right} y1={padding.top + plotHeight * line} y2={padding.top + plotHeight * line} />
        ))}
        <path className="stats-timeline__line stats-timeline__line--value" d={path(valueCoordinates)} />
        <path className="stats-timeline__line stats-timeline__line--pieces" d={path(piecesCoordinates)} />
        {displayPoints.length > 2 && valueCoordinates.map((coordinate, index) => (
          <circle className="stats-timeline__point stats-timeline__point--value" key={`value-${index}`} cx={coordinate.x} cy={coordinate.y} r="3.5" />
        ))}
        <circle className="stats-timeline__point stats-timeline__point--pieces" cx={piecesCoordinates[piecesCoordinates.length - 1].x} cy={piecesCoordinates[piecesCoordinates.length - 1].y} r="4" />
        <circle className="stats-timeline__point stats-timeline__point--value" cx={valueCoordinates[valueCoordinates.length - 1].x} cy={valueCoordinates[valueCoordinates.length - 1].y} r="4" />
      </svg>
      <figcaption>
        <span><b>{startLabel}</b> · {formatChartDate(firstTimestamp)}</span>
        <span><b>{isSinglePoint ? "Today" : "Latest entry"}</b> · {formatChartDate(lastPoint.timestamp)}</span>
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
      growthPoints: getGrowthPoints(items),
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
              <p className="stats-timeline__eyebrow">Your closet’s trajectory</p>
              <h3 id="closet-timeline-title">Cataloging momentum</h3>
            </div>
            <span className="stats-panel__total">{period === "all" ? "All time" : `Last ${period} days`}</span>
          </header>
          <p className="stats-timeline__description">Track how your recorded value and number of pieces grow together. This reflects when pieces were added to Ellie’s Closet, not when they were originally purchased.</p>
          <ClosetGrowthChart points={stats.growthPoints} now={now} startLabel={period === "all" ? "Index start" : "Period start"} />
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
