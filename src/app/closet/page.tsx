import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ClosetBrowser } from "@/components/closet-browser";
import { clothingItems } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Closet",
  description: "Browse and filter the visual wardrobe.",
};

export default function ClosetPage() {
  return (
    <AppShell
      active="closet"
      eyebrow="The full collection"
      title="Closet"
      description="Browse freely or narrow the wardrobe by what you need today."
      action={
        <Link href="/add" className="button button--primary">
          + Add piece
        </Link>
      }
      wide
    >
      <ClosetBrowser items={clothingItems} />
    </AppShell>
  );
}
