import Image from "next/image";
import { PageShell } from "./ui";

const stores = [
  { name: "Aritzia", href: "https://www.aritzia.com/us/en/home", logo: "/images/stores/aritzia.svg", className: "wc-store-card--plus-15" },
  { name: "Cotton On", href: "https://cottonon.com/US/", logo: "/images/stores/cotton-on.png", className: "wc-store-card--plus-15" },
  { name: "Sephora", href: "https://www.sephora.com/", logo: "/images/stores/sephora.png", className: "wc-store-card--plus-15" },
  { name: "Altar'd State", href: "https://www.altardstate.com/", logo: "/images/stores/altard-state.png", className: "wc-store-card--altar" },
  { name: "Vuori", href: "https://vuoriclothing.com/", logo: "/images/stores/vuori.png", className: "wc-store-card--plus-15" },
  { name: "Brandy Melville", href: "https://us.brandymelville.com/", logo: "/images/stores/brandy-melville.png", className: "wc-store-card--plus-15" },
  { name: "Alo", href: "https://www.aloyoga.com/", logo: "/images/stores/alo.webp", className: "wc-store-card--minus-15" },
  { name: "Garage", href: "https://www.garageclothing.com/", logo: "/images/stores/garage.png", className: "wc-store-card--plus-40" },
  { name: "SKIMS", href: "https://skims.com/", logo: "/images/stores/skims.png" },
  { name: "Princess Polly", href: "https://us.princesspolly.com/", logo: "/images/stores/princess-polly.png", className: "wc-store-card--minus-30" },
  { name: "Victoria's Secret", href: "https://www.victoriassecret.com/us/", logo: "/images/stores/victorias-secret.png" },
  { name: "Steve Madden", href: "https://www.stevemadden.com/", logo: "/images/stores/steve-madden.png", className: "wc-store-card--plus-15" },
];

export function StoresPage() {
  return (
    <PageShell title="Stores">
      <section className="wc-content wc-stores" aria-label="Store links">
        {stores.map((store) => (
          <a className={`wc-store-card ${store.className ?? ""}`} href={store.href} key={store.name} target="_blank" rel="noreferrer" aria-label={`Open ${store.name}`}>
            <Image src={store.logo} alt={store.name} fill sizes="(max-width: 600px) 42vw, 26vw" />
          </a>
        ))}
      </section>
    </PageShell>
  );
}
