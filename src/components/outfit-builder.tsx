"use client";

import { useMemo, useState } from "react";
import { GarmentVisual } from "@/components/garment-visual";
import type { ClothingItem } from "@/lib/types";

const builderSlots = [
  { key: "tops", label: "Top" },
  { key: "bottoms", label: "Bottom" },
  { key: "shoes", label: "Shoes" },
  { key: "outerwear", label: "Layer" },
  { key: "bags", label: "Bag" },
] as const;

export function OutfitBuilder({ items }: { items: ClothingItem[] }) {
  const startingSelection = Object.fromEntries(
    builderSlots.map((slot) => [
      slot.key,
      items.find((item) => item.category === slot.key)?.id ?? "",
    ]),
  );
  const [selection, setSelection] = useState<Record<string, string>>(startingSelection);
  const [activeSlot, setActiveSlot] = useState<(typeof builderSlots)[number]["key"]>("tops");
  const [saved, setSaved] = useState(false);

  const selectedItems = useMemo(
    () =>
      builderSlots
        .map((slot) => items.find((item) => item.id === selection[slot.key]))
        .filter((item): item is ClothingItem => Boolean(item)),
    [items, selection],
  );

  const availableItems = items.filter((item) => item.category === activeSlot);

  function selectItem(item: ClothingItem) {
    setSelection((current) => ({ ...current, [activeSlot]: item.id }));
    setSaved(false);
  }

  return (
    <div className="builder-layout">
      <section className="outfit-canvas" aria-label="Selected outfit">
        <div className="canvas-heading">
          <div>
            <p className="eyebrow">Draft outfit</p>
            <h2>Soft neutral dinner</h2>
          </div>
          <span>{selectedItems.length} pieces</span>
        </div>
        <div className="canvas-items">
          {selectedItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveSlot(item.category as typeof activeSlot)}
              className={activeSlot === item.category ? "is-active" : undefined}
              aria-label={`Change ${item.name}`}
            >
              <GarmentVisual item={item} compact />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <div className="canvas-actions">
          <button type="button" className="button button--quiet" onClick={() => setSelection({})}>
            Clear
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setSaved(true)}
            disabled={!selectedItems.length}
          >
            {saved ? "Saved to looks" : "Save outfit"}
          </button>
        </div>
      </section>

      <section className="builder-picker">
        <div className="slot-tabs" aria-label="Outfit slots">
          {builderSlots.map((slot) => (
            <button
              type="button"
              key={slot.key}
              onClick={() => setActiveSlot(slot.key)}
              className={activeSlot === slot.key ? "is-active" : undefined}
            >
              {slot.label}
            </button>
          ))}
        </div>
        <div className="picker-heading">
          <div>
            <p className="eyebrow">Choose a piece</p>
            <h3>{builderSlots.find((slot) => slot.key === activeSlot)?.label}</h3>
          </div>
          <span>{availableItems.length} available</span>
        </div>
        <div className="picker-grid">
          {availableItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => selectItem(item)}
              className={selection[activeSlot] === item.id ? "is-selected" : undefined}
            >
              <GarmentVisual item={item} compact />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
