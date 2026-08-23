import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const primaryNavigation = [
  { label: "Closet", href: "/closet" },
  { label: "Build", href: "/build" },
  { label: "Saved", href: "/saved" },
];

const secondaryNavigation = [
  { label: "Deals", href: "/closet?view=deals" },
  { label: "Log", href: "/hub" },
  { label: "Recent", href: "/closet?sort=recent" },
  { label: "Favorites", href: "/closet?filter=favorites" },
];

const uvBarWidths = [12, 15, 20, 34, 39, 44, 42, 30, 21, 27, 24, 15];

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

  return `${value("weekday")}  |  ${value("month")} ${day}${getOrdinal(day)}, ${value("year")}`;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="9" />
      <path d="M24 3v7M24 38v7M3 24h7M38 24h7M9.2 9.2l5 5M33.8 33.8l5 5M38.8 9.2l-5 5M14.2 33.8l-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="15" />
      <path d="m17 24 5 5 10-11" />
    </svg>
  );
}

function WeatherBars({ widths }: { widths: number[] }) {
  return (
    <div className="home-dashboard__bars" aria-hidden="true">
      {widths.map((width, index) => (
        <span key={`${width}-${index}`} style={{ width }} />
      ))}
    </div>
  );
}

export default function Home() {
  const now = new Date();

  return (
    <main className="home-dashboard">
      <Image
        src="/images/mountain-lakeshore-geyser.png"
        alt=""
        className="home-dashboard__scene"
        fill
        priority
        sizes="100vw"
      />
      <div className="home-dashboard__tone" aria-hidden="true" />
      <div className="home-dashboard__glass-rail" aria-hidden="true" />
      <div className="home-dashboard__glass-dock" aria-hidden="true" />

      <section className="home-dashboard__greeting" aria-labelledby="home-greeting">
        <h1 id="home-greeting">{getGreeting(now)}, Ellie</h1>
        <p>{getDateLabel(now)}</p>
        <div className="home-dashboard__weather-summary" aria-label="Sunny weather">
          <SunIcon />
          <span>Sunny</span>
        </div>
      </section>

      <section className="home-dashboard__stats" aria-label="Weather details">
        <article className="home-dashboard__metric" aria-label="High 107 degrees, low 88 degrees">
          <span className="home-dashboard__metric-label">temp</span>
          <strong>107°</strong>
          <WeatherBars widths={Array(12).fill(39)} />
          <b>88°</b>
        </article>

        <article className="home-dashboard__metric" aria-label="UV index 11">
          <span className="home-dashboard__metric-label">uv</span>
          <strong>11</strong>
          <WeatherBars widths={uvBarWidths} />
          <span className="home-dashboard__check">
            <CheckIcon />
          </span>
        </article>
      </section>

      <nav className="home-dashboard__primary-nav" aria-label="Primary navigation">
        {primaryNavigation.map((item) => (
          <Link href={item.href} key={item.label}>
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="home-dashboard__secondary-nav" aria-label="Quick navigation">
        {secondaryNavigation.map((item) => (
          <Link href={item.href} key={item.label}>
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
