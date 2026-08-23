"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/item-card";
import type { ClothingItem } from "@/lib/types";

const filters = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "bags"];

export function ClosetBrowser({ items }: { items: ClothingItem[] }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.category === activeFilter;
      const searchable = [
        item.name,
        item.category,
        item.subcategory,
        item.primaryColor,
        ...item.occasions,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeFilter, items, query]);

  return (
    <>
      <div className="closet-tools">
        <label className="closet-search">
          <span>Search</span>
          <input
            type="search"
            placeholder="Try “black dinner top”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="filter-row" aria-label="Filter by category">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? "is-active" : undefined}
            >
              {filter === "all" ? "All pieces" : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="results-line">
        <p>{visibleItems.length} pieces</p>
        <p>Recently added first</p>
      </div>

      {visibleItems.length ? (
        <div className="closet-grid">
          {visibleItems.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">○</span>
          <h2>No pieces found</h2>
          <p>Try another color, occasion, or category.</p>
        </div>
      )}
    </>
  );
}
