"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const featuredTags = [
  "Basic",
  "Comfortable",
  "Everyday",
  "Fitted",
  "Layering",
  "Leather",
  "Minimal",
  "Relaxed",
  "Soft",
] as const;

const tagFilters = [
  { label: "All", value: "all" },
  ...featuredTags.map((tag) => ({ label: tag, value: tag.toLowerCase() })),
];

const primaryTopicCategories = new Set(["tops", "outerwear", "bottoms", "shoes"]);

function CloseIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="m8 8 16 16M24 8 8 24" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 27S5 20.7 5 12.7C5 8.5 7.7 6 11.2 6c2.2 0 3.9 1.2 4.8 2.8C16.9 7.2 18.6 6 20.8 6 24.3 6 27 8.5 27 12.7 27 20.7 16 27 16 27Z" />
      {filled ? (
        <path
          className="closet-item-drawer__heart-fill"
          d="M16 27S5 20.7 5 12.7C5 8.5 7.7 6 11.2 6c2.2 0 3.9 1.2 4.8 2.8C16.9 7.2 18.6 6 20.8 6 24.3 6 27 8.5 27 12.7 27 20.7 16 27 16 27Z"
        />
      ) : null}
    </svg>
  );
}

function formatCategory(item: ClothingItem) {
  const category = item.category === "outerwear" ? "Jackets" : item.category;
  return `${category.charAt(0).toUpperCase()}${category.slice(1)} · ${item.subcategory}`;
}

export function ClosetBrowser({ items }: { items: ClothingItem[] }) {
  const [mode, setMode] = useState<BrowseMode>("topics");
  const [activeFilter, setActiveFilter] = useState("all");
  const [drawerItem, setDrawerItem] = useState<ClothingItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.favorite])),
  );
  const lastFocusedItem = useRef<HTMLButtonElement | null>(null);
  const closeButton = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        lastFocusedItem.current?.focus();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [drawerOpen]);

  function changeMode(nextMode: BrowseMode) {
    setMode(nextMode);
    setActiveFilter("all");
  }

  function openItem(item: ClothingItem, trigger: HTMLButtonElement) {
    lastFocusedItem.current = trigger;
    setDrawerItem(item);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    lastFocusedItem.current?.focus();
  }

  function toggleFavorite() {
    if (!drawerItem) return;
    setFavoriteItems((current) => ({
      ...current,
      [drawerItem.id]: !current[drawerItem.id],
    }));
  }

  const drawerIsFavorite = drawerItem ? favoriteItems[drawerItem.id] : false;

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
          <button
            type="button"
            className="closet-browser__item"
            aria-label={`Open details for ${item.name}`}
            onClick={(event) => openItem(item, event.currentTarget)}
            key={item.id}
          />
        ))}
      </div>

      <div
        className={`closet-item-drawer__backdrop${drawerOpen ? " is-open" : ""}`}
        aria-hidden="true"
        onClick={closeDrawer}
      />

      <aside
        className={`closet-item-drawer${drawerOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal={drawerOpen ? "true" : undefined}
        aria-hidden={!drawerOpen}
        aria-labelledby="closet-item-drawer-title"
      >
        <header className="closet-item-drawer__header">
          <h2 id="closet-item-drawer-title" className="sr-only">
            {drawerItem ? drawerItem.name : "Item details"}
          </h2>
          <button
            ref={closeButton}
            type="button"
            className="closet-item-drawer__close"
            aria-label="Close item details"
            disabled={!drawerOpen}
            onClick={closeDrawer}
          >
            <CloseIcon />
          </button>
        </header>

        <div className="closet-item-drawer__images" aria-label="Item photos">
          <div role="img" aria-label="Front image placeholder" />
          <div role="img" aria-label="Back image placeholder" />
        </div>

        <div className="closet-item-drawer__favorite-row">
          <button
            type="button"
            aria-label={drawerIsFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={drawerIsFavorite}
            disabled={!drawerOpen}
            onClick={toggleFavorite}
          >
            <HeartIcon filled={drawerIsFavorite} />
          </button>
        </div>

        {drawerItem ? (
          <dl className="closet-item-drawer__details">
            <div>
              <dt>Category</dt>
              <dd>{formatCategory(drawerItem)}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{drawerItem.tags.join(" · ")}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{drawerItem.primaryColor}</dd>
            </div>
            <div>
              <dt>Details</dt>
              <dd>
                {drawerItem.season.join(", ")} · {drawerItem.occasions.join(", ")}
              </dd>
            </div>
          </dl>
        ) : null}
      </aside>
    </section>
  );
}
