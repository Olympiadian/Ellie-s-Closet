import type { Metadata } from "next";
import { StatsPage } from "@/components/wardrobe/stats";

export const metadata: Metadata = {
  title: "Closet Stats",
  description: "A simple view of the pieces, value, categories, and stores in Ellie’s Closet.",
};

export default function Page() {
  return <StatsPage />;
}
