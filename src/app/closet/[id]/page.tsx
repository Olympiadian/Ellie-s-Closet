import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GarmentVisual } from "@/components/garment-visual";
import { clothingItems, getClothingItem, outfits } from "@/lib/sample-data";

type ItemDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return clothingItems.map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getClothingItem(id);

  return item
    ? {
        title: item.name,
        description: `${item.primaryColor} ${item.subcategory} in The Wall wardrobe.`,
      }
    : { title: "Piece not found" };
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = getClothingItem(id);
  if (!item) notFound();

  const includedOutfits = outfits.filter((outfit) => outfit.itemIds.includes(item.id));

  return (
    <AppShell active="closet" title={item.name} eyebrow={`${item.category} · ${item.subcategory}`}>
      <div className="item-detail">
        <GarmentVisual item={item} />
        <section className="item-information">
          <div className="detail-title-row">
            <div>
              <p className="eyebrow">Piece details</p>
              <h2>{item.primaryColor}</h2>
            </div>
            <button type="button" className="favorite detail-favorite" aria-label="Favorite item">
              {item.favorite ? "♥" : "♡"}
            </button>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Season</dt>
              <dd>{item.season.join(", ")}</dd>
            </div>
            <div>
              <dt>Use</dt>
              <dd>{item.occasions.join(", ")}</dd>
            </div>
            <div>
              <dt>Added</dt>
              <dd>{new Date(item.addedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</dd>
            </div>
          </dl>
          <div className="tag-list" aria-label="Item tags">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="detail-actions">
            <Link href={`/build?start=${item.id}`} className="button button--primary">
              Build with this
            </Link>
            <button type="button" className="button button--quiet">
              Edit details
            </button>
          </div>
          <div className="included-outfits">
            <p className="eyebrow">Saved looks</p>
            {includedOutfits.length ? (
              includedOutfits.map((outfit) => <p key={outfit.id}>{outfit.name}</p>)
            ) : (
              <p>Not used in a saved outfit yet.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
