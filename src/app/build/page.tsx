import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { OutfitBuilder } from "@/components/outfit-builder";
import { clothingItems } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Build an outfit",
  description: "Combine wardrobe pieces and save a complete look.",
};

export default function BuildPage() {
  return (
    <AppShell
      active="build"
      eyebrow="Outfit builder"
      title="Build around a piece."
      description="Choose one item, add what works around it, and keep the finished set."
      wide
    >
      <OutfitBuilder items={clothingItems} />
    </AppShell>
  );
}
