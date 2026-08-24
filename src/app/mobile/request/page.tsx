import type { Metadata } from "next";
import { MobilePageShell } from "@/components/mobile/mobile-page-shell";
import { MobileRequestForm } from "@/components/mobile/mobile-request-form";

export const metadata: Metadata = {
  title: "Request a feature",
  description: "Request a change or addition to the closet experience.",
};

export default function MobileRequestPage() {
  return (
    <MobilePageShell
      eyebrow="Request feature"
      title="What should change?"
      description="Ask for anything you would like added, removed, fixed, or improved."
    >
      <MobileRequestForm />
    </MobilePageShell>
  );
}
