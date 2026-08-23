import Link from "next/link";
import { GarmentVisual } from "@/components/garment-visual";
import type { ClothingItem } from "@/lib/types";

type ItemCardProps = {
  item: ClothingItem;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/closet/${item.id}`} className="item-card">
      <GarmentVisual item={item} />
      <div className="item-card__meta">
        <div>
          <h3>{item.name}</h3>
          <p>
            {item.primaryColor} · {item.subcategory}
          </p>
        </div>
        <span className={item.favorite ? "favorite is-favorite" : "favorite"}>
          {item.favorite ? "♥" : "♡"}
        </span>
      </div>
    </Link>
  );
}
