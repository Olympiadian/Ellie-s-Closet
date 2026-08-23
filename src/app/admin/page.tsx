import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Management",
};

export default function AdminPage() {
  return (
    <AppShell
      eyebrow="Private management"
      title="Keep the system healthy."
      description="These controls stay away from the wall interface and everyday browsing."
    >
      <div className="admin-grid">
        <Link href="/review"><strong>Review queue</strong><span>Resolve uncertain labels and failed uploads →</span></Link>
        <button type="button"><strong>Export wardrobe</strong><span>Download structured data and original images</span></button>
        <button type="button"><strong>Manage tags</strong><span>Edit common and custom organization labels</span></button>
        <button type="button"><strong>Archive</strong><span>Review pieces hidden from normal browsing</span></button>
      </div>
    </AppShell>
  );
}
