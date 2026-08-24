import type { Metadata } from "next";
import {
  MobileDatabase,
  type MobileDatabaseIssue,
  type MobileDatabaseRecord,
} from "@/components/mobile/mobile-database";
import { MobilePageShell } from "@/components/mobile/mobile-page-shell";
import { clothingItems } from "@/lib/sample-data";

export const metadata: Metadata = {
  title: "Database check",
  description: "Review and improve closet information.",
};

const issueSeeds: Record<number, MobileDatabaseIssue[]> = {
  0: ["Missing size"],
  1: ["Missing tag"],
  2: ["A.I. unsure of category", "Missing size"],
  4: ["A.I. unsure of item type"],
  6: ["A.I. unsure of color"],
};

const sizeSeeds = ["", "6", "", "M", "S", "M", "", "8", "8", "One size", "M", "S"];

const records: MobileDatabaseRecord[] = clothingItems.map((item, index) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  subcategory: item.subcategory,
  color: item.primaryColor,
  size: sizeSeeds[index] ?? "",
  tags: index === 1 ? [] : item.tags,
  occasions: item.occasions,
  issues: issueSeeds[index] ?? [],
}));

export default function MobileDatabasePage() {
  return (
    <MobilePageShell
      eyebrow="Database check"
      title="Clean up the details"
      description="Review clothes as text and fix anything missing or uncertain."
    >
      <MobileDatabase initialRecords={records} />
    </MobilePageShell>
  );
}
