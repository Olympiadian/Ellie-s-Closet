import { MobilePageShell } from "@/components/mobile/mobile-page-shell";
import { LogContents } from "@/components/wardrobe/log";
export default function Page() {
  return <MobilePageShell eyebrow="Database check" title="Review clothes" description="Fix any missing or uncertain details."><LogContents/></MobilePageShell>;
}
