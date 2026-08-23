import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { clothingItems, outfits } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Closet hub",
  description: "A lightweight view of the wardrobe's shape.",
};

export default function HubPage() {
  const favoriteCount = clothingItems.filter((item) => item.favorite).length;
  const usedIds = new Set(outfits.flatMap((outfit) => outfit.itemIds));
  const unusedCount = clothingItems.filter((item) => !usedIds.has(item.id)).length;
  const categoryCounts = Object.entries(
    clothingItems.reduce<Record<string, number>>((counts, item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...categoryCounts.map(([, count]) => count));

  return (
    <AppShell
      active="hub"
      eyebrow="Closet shape"
      title="The collection, quietly understood."
      description="Useful context lives here, separate from the everyday experience."
      wide
    >
      <div className="stat-grid">
        <article>
          <p>Total pieces</p>
          <strong>{clothingItems.length}</strong>
          <span>Across {categoryCounts.length} categories</span>
        </article>
        <article>
          <p>Saved looks</p>
          <strong>{outfits.length}</strong>
          <span>Two marked as favorites</span>
        </article>
        <article>
          <p>Favorite pieces</p>
          <strong>{favoriteCount}</strong>
          <span>Easy to reach from the closet</span>
        </article>
        <article>
          <p>Not in a look</p>
          <strong>{unusedCount}</strong>
          <span>Ready to build around</span>
        </article>
      </div>

      <div className="hub-grid">
        <section className="category-balance">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Collection balance</p>
              <h2>By category</h2>
            </div>
          </div>
          <div className="category-bars">
            {categoryCounts.map(([category, count]) => (
              <div key={category}>
                <span>{category}</span>
                <div><i style={{ width: `${(count / maxCount) * 100}%` }} /></div>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="color-story">
          <p className="eyebrow">Common colors</p>
          <h2>Mostly quiet neutrals.</h2>
          <div className="color-orbit" aria-label="Black, cream, clay, denim blue, and stone">
            <span className="color-dot color-dot--black" />
            <span className="color-dot color-dot--cream" />
            <span className="color-dot color-dot--clay" />
            <span className="color-dot color-dot--denim" />
            <span className="color-dot color-dot--stone" />
          </div>
          <Link href="/closet">Browse by color →</Link>
        </section>
      </div>
    </AppShell>
  );
}
