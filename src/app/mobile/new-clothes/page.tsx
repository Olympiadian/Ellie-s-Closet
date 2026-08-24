import type { Metadata } from "next";
import { MobileNewClothes } from "@/components/mobile/mobile-new-clothes";
import { MobilePageShell } from "@/components/mobile/mobile-page-shell";

export const metadata: Metadata = {
  title: "New clothes",
  description: "Add front and back photos for new closet items.",
};

export default function MobileNewClothesPage() {
  return (
    <MobilePageShell
      eyebrow="New clothes"
      title="Add photos"
      description="Add up to ten items. Each slot holds a front and back photo."
    >
      <MobileNewClothes />
    </MobilePageShell>
  );
}
