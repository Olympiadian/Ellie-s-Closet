import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { GarmentVisual } from "@/components/garment-visual";
import { getOutfitItems, outfits } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Saved looks",
  description: "Reusable outfit combinations from the wardrobe.",
};

export default function SavedPage() {
  return (
    <AppShell
      active="saved"
      eyebrow="Looks that work"
      title="Saved"
      description="Complete outfits, ready whenever you need them again."
      wide
    >
      <div className="saved-filters" aria-label="Saved outfit groups">
        {['All looks', 'Favorites', 'Dinner', 'Work', 'Church', 'Going out'].map((label, index) => (
          <button type="button" key={label} className={index === 0 ? "is-active" : undefined}>
            {label}
          </button>
        ))}
      </div>
      <div className="outfit-grid">
        {outfits.map((outfit) => {
          const items = getOutfitItems(outfit);
          return (
            <article className="outfit-card" key={outfit.id}>
              <div className="outfit-card__visual">
                {items.map((item) => (
                  <GarmentVisual item={item} compact key={item.id} />
                ))}
              </div>
              <div className="outfit-card__meta">
                <div>
                  <p className="eyebrow">{outfit.occasion}</p>
                  <h2>{outfit.name}</h2>
                  <p>{items.length} pieces</p>
                </div>
                <span className={outfit.favorite ? "favorite is-favorite" : "favorite"}>
                  {outfit.favorite ? "♥" : "♡"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
