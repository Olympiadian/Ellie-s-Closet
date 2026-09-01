import Link from "next/link";
import { MobileHome } from "@/components/mobile/mobile-home";
import { clothingItems, outfits } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

const primaryNavigation = [
  {
    label: "Closet",
    description: "Explore the main closet",
    badge: String(clothingItems.length),
    href: "/closet",
  },
  {
    label: "Saved",
    description: "Explore saved outfits & items",
    badge: String(clothingItems.filter((item) => item.favorite).length + outfits.length),
    href: "/saved",
  },
  {
    label: "Build",
    description: "Build a collection or outfit",
    badge: "+",
    href: "/build",
  },
];

const secondaryNavigation = [
  { label: "Deals", href: "/closet?view=deals" },
  { label: "Favorites", href: "/closet?filter=favorites" },
  { label: "Recent", href: "/closet?sort=recent" },
  { label: "Log", href: "/hub" },
];

function getGreeting(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/Phoenix",
    }).format(date),
  );

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getOrdinal(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

function getDateLabel(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "America/Phoenix",
    weekday: "long",
    year: "numeric",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const day = Number(value("day"));

  return `${value("weekday")}, ${value("month")} ${day}${getOrdinal(day)}, ${value("year")}`;
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 7.5h13.5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H12l-5 3.8V7.5Z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M13.5 4.7h5l.8 3a9.7 9.7 0 0 1 2.2 1.3l3-.8 2.5 4.3-2.2 2.1a9.2 9.2 0 0 1 0 2.8l2.2 2.1-2.5 4.3-3-.8a9.7 9.7 0 0 1-2.2 1.3l-.8 3h-5l-.8-3a9.7 9.7 0 0 1-2.2-1.3l-3 .8L5 19.5l2.2-2.1a9.2 9.2 0 0 1 0-2.8L5 12.5l2.5-4.3 3 .8a9.7 9.7 0 0 1 2.2-1.3l.8-3Z" />
      <circle cx="16" cy="16" r="3.6" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" />
      <path d="M12.9 12.1a3.5 3.5 0 0 1 6.8 1.2c0 2.6-3.7 2.9-3.7 5.4M16 23h.01" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  );
}

function TemperatureIcon({ direction }: { direction: "up" | "down" }) {
  const path =
    direction === "up"
      ? "m7 10 5-5 5 5M7 16l5-5 5 5"
      : "m7 8 5 5 5-5M7 14l5 5 5-5";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export default function Home() {
  const now = new Date();

  return (
    <main className="home-page">
      <MobileHome />

      <div className="home-dashboard">
        <nav className="home-dashboard__utilities" aria-label="Utilities">
          <Link href="/mobile/request" aria-label="Request a feature">
            <FeedbackIcon />
          </Link>
          <Link href="/admin" aria-label="Settings">
            <SettingsIcon />
          </Link>
          <Link href="/hub" aria-label="Help">
            <HelpIcon />
          </Link>
        </nav>

        <section className="home-dashboard__welcome" aria-labelledby="home-greeting">
          <h1 id="home-greeting">{getGreeting(now)}, Ellie</h1>
          <div className="home-dashboard__divider" aria-hidden="true" />
          <div
            className="home-dashboard__weather"
            aria-label="Today is sunny with a high of 108 degrees, a low of 78 degrees, and a UV index of 10 between 11 AM and 1 PM"
          >
            <span>{getDateLabel(now)}</span>
            <i aria-hidden="true" />
            <span className="home-dashboard__weather-item">
              <SunIcon />
              Sunny
            </span>
            <i aria-hidden="true" />
            <span className="home-dashboard__temperature">
              <span><TemperatureIcon direction="up" />108°</span>
              <span><TemperatureIcon direction="down" />78°</span>
            </span>
            <i aria-hidden="true" />
            <span><strong>UV:</strong>&nbsp; 10 | 11–1pm</span>
          </div>
        </section>

        <section className="home-dashboard__navigation" aria-label="Closet navigation">
          <nav className="home-dashboard__primary-nav" aria-label="Primary navigation">
            {primaryNavigation.map((item) => (
              <Link href={item.href} key={item.label}>
                <span className="home-dashboard__primary-card-copy">
                  <span className="home-dashboard__primary-card-title">
                    <strong>{item.label}</strong>
                    <b>{item.badge}</b>
                  </span>
                  <small>{item.description}</small>
                </span>
              </Link>
            ))}
          </nav>

          <nav className="home-dashboard__secondary-nav" aria-label="Quick navigation">
            {secondaryNavigation.map((item) => (
              <Link href={item.href} key={item.label}>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}
