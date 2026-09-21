"use client";
import { useWardrobe } from "./provider";
import { safeExternalUrl } from "@/lib/wardrobe";
export function HomeCount({ saved = false }: { saved?: boolean }) {
  const { data } = useWardrobe();
  return <>{data ? saved ? data.builds.length + data.items.filter(i => i.saved).length : data.items.length : "–"}</>;
}
export function MobileManualLink() {
  const { data } = useWardrobe();
  const url = safeExternalUrl(data?.settings.manualUrl ?? "");
  return <p className="mobile-home__manual">{url ? <>Full Ellie’s Closet Manual:<a href={url} target="_blank" rel="noreferrer"><span>Here</span></a></> : "Your closet, made for you."}</p>;
}
