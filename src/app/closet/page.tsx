import type { Metadata } from "next";
import Link from "next/link";
import { ClosetBrowser } from "@/components/closet-browser";
import { clothingItems } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Closet",
  description: "Browse and filter the visual wardrobe.",
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="m6 14 10-9 10 9v12H6V14Z" />
      <path d="M13 26v-8h6v8" />
    </svg>
  );
}

export default function ClosetPage() {
  return (
    <main className="closet-index-page">
      <Link href="/" className="closet-index-page__home" aria-label="Return home">
        <HomeIcon />
      </Link>

      <header className="closet-index-page__header">
        <h1>The Closet</h1>
      </header>

      <ClosetBrowser items={clothingItems} />
    </main>
  );
}
