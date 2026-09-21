import type { ClothingItem } from "@/lib/types";

type GarmentVisualProps = {
  item: ClothingItem;
  compact?: boolean;
};

export function GarmentVisual({ item, compact = false }: GarmentVisualProps) {
  return (
    <div
      className={`item-visual item-visual--${item.tone} ${compact ? "item-visual--compact" : ""}`}
      aria-hidden="true"
    >
      <div className={`item-shape item-shape--${item.visual}`} />
    </div>
  );
}
