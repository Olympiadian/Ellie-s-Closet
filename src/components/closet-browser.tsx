"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ClothingItem } from "@/lib/types";

type BrowseMode = "topics" | "tags";

const topicFilters = [
  { label: "All", value: "all" },
  { label: "Tops", value: "tops" },
  { label: "Jackets", value: "jackets" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Shoes", value: "shoes" },
  { label: "Misc.", value: "misc" },
] as const;

const primaryTopicCategories = new Set(["tops", "outerwear", "bottoms", "shoes"]);

export function ClosetBrowser({ items }: { items: ClothingItem[] }) {
  const [mode, setMode] = useState<BrowseMode>("topics");
  const [activeFilter, setActiveFilter] = useState("all");

  const tagFilters = useMemo(
    () => [
      { label: "All", value: "all" },
      ...Array.from(new Set(items.flatMap((item) => item.tags)))
        .toSorted((first, second) => first.localeCompare(second))
        .map((tag) => ({ label: tag, value: tag.toLowerCase() })),
    ],
    [items],
  );

  const visibleItems = useMemo(() => {
    if (activeFilter === "all") return items;

    if (mode === "tags") {
      return items.filter((item) =>
        item.tags.some((tag) => tag.toLowerCase() === activeFilter),
      );
    }

    if (activeFilter === "jackets") {
      return items.filter((item) => item.category === "outerwear");
    }

    if (activeFilter === "misc") {
      return items.filter((item) => !primaryTopicCategories.has(item.category));
    }

    return items.filter((item) => item.category === activeFilter);
  }, [activeFilter, items, mode]);

  const filters = mode === "topics" ? topicFilters : tagFilters;

  function changeMode(nextMode: BrowseMode) {
    setMode(nextMode);
    setActiveFilter("all");
  }

  return (
    <section className="closet-browser" aria-label="Browse the closet">
      <div className="closet-browser__mode" aria-label="Browse by topics or tags">
        <button
          type="button"
          className={mode === "topics" ? "is-active" : undefined}
          aria-pressed={mode === "topics"}
          onClick={() => changeMode("topics")}
        >
          Topics
        </button>
        <button
          type="button"
          className={mode === "tags" ? "is-active" : undefined}
          aria-pressed={mode === "tags"}
          onClick={() => changeMode("tags")}
        >
          Tags
        </button>
      </div>

      <div
        className="closet-browser__filters"
        aria-label={mode === "topics" ? "Filter by topic" : "Filter by tag"}
      >
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.value}
            className={activeFilter === filter.value ? "is-active" : undefined}
            aria-pressed={activeFilter === filter.value}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="closet-browser__grid" aria-live="polite">
        {visibleItems.map((item) => (
          <Link
            href={`/closet/${item.id}`}
            className="closet-browser__item"
            aria-label={`Open ${item.name}`}
            key={item.id}
          />
        ))}
      </div>
    </section>
  );
}
