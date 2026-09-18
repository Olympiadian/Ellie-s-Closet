import Link from "next/link";
import { MobileHome } from "@/components/mobile/mobile-home";
import { WeatherIcon } from "@/components/weather-icon";
import { HomeCount } from "@/components/wardrobe/home-count";
import { MessagesButton } from "@/components/wardrobe/messages";
import { getWeatherSummary } from "@/lib/server/weather";
import {
  CalendarIcon,
  DealsIcon,
  FavoritesIcon,
  RecentIcon,
  StatsIcon,
} from "@/components/mobile/mobile-icons";

export const dynamic = "force-dynamic";

const primaryNavigation = [
  {
    label: "Closet",
    tabletLabel: undefined,
    description: "Explore the main closet",
    badge: <HomeCount />,
    href: "/closet",
  },
  {
    label: "Saved",
    tabletLabel: "Saved Outfits",
    description: "Explore saved outfits & items",
    badge: <HomeCount saved />,
    href: "/saved",
  },
  {
    label: "Build Outfit",
    tabletLabel: undefined,
    description: "Build a collection or outfit",
    badge: "+",
    href: "/build",
  },
];

const secondaryNavigation = [
  { label: "Stores", description: "Shop favorites", href: "/deals", icon: DealsIcon },
  { label: "Favorites", description: "Loved pieces", href: "/favorites", icon: FavoritesIcon },
  { label: "Recent", description: "Just added", href: "/recent", icon: RecentIcon },
  { label: "Stats", description: "Closet insights", href: "/stats", icon: StatsIcon },
  { label: "Calendar", description: "Plan a look", href: "/calendar", icon: CalendarIcon },
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

function HelpIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" />
      <path d="M12.9 12.1a3.5 3.5 0 0 1 6.8 1.2c0 2.6-3.7 2.9-3.7 5.4M16 23h.01" />
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
  return <HomeContent />;
}

async function HomeContent() {
  const now = new Date();
  const weather = await getWeatherSummary().catch(() => null);

  return (
    <main className="home-page">
      <MobileHome dateLabel={getDateLabel(now)} weather={weather} />

      <div className="home-dashboard">
        <nav className="home-dashboard__utilities" aria-label="Utilities">
          <MessagesButton />
          <Link href="/help" aria-label="Help">
            <HelpIcon />
          </Link>
        </nav>

        <section className="home-dashboard__welcome" aria-labelledby="home-greeting">
          <h1 id="home-greeting">{getGreeting(now)}, Ellie</h1>
          <div
            className="home-dashboard__weather"
            aria-label={weather ? `Today is ${weather.condition} with a high of ${weather.high} degrees, a low of ${weather.low} degrees, and a UV index of ${weather.uv} peaking ${weather.uvPeak}` : "Today’s weather is unavailable"}
          >
            <span>{getDateLabel(now)}</span>
            <i aria-hidden="true" />
            <span className={"home-dashboard__weather-item home-dashboard__weather-item--" + (weather?.kind ?? "cloudy")}><WeatherIcon kind={weather?.kind ?? "cloudy"} />{weather?.condition ?? "Weather unavailable"}</span>
            <i aria-hidden="true" />
            {weather ? <span className="home-dashboard__temperature"><span><TemperatureIcon direction="up" />{weather.high}°</span><span><TemperatureIcon direction="down" />{weather.low}°</span></span> : null}
            <i aria-hidden="true" />
            {weather ? <span><strong>UV</strong>&nbsp; {weather.uv}&nbsp; {weather.uvPeak}</span> : null}
          </div>
        </section>

        <section className="home-dashboard__navigation" aria-label="Closet navigation">
          <nav className="home-dashboard__primary-nav" aria-label="Primary navigation">
            {primaryNavigation.map((item) => (
              <Link href={item.href} key={item.label}>
                <span className="home-dashboard__primary-card-copy">
                  <span className="home-dashboard__primary-card-title">
                    <strong>{item.tabletLabel ? <><span className="home-primary-label--default">{item.label}</span><span className="home-primary-label--tablet">{item.tabletLabel}</span></> : item.label}</strong>
                    <b>{item.badge}</b>
                  </span>
                  <small>{item.description}</small>
                </span>
              </Link>
            ))}
          </nav>

          <nav className="home-dashboard__secondary-nav" aria-label="Quick navigation">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link href={item.href} key={item.label}>
                  <span className="home-dashboard__secondary-card-copy">
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <span className="home-dashboard__secondary-icon" aria-hidden="true">
                      <Icon />
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>
        </section>
      </div>
    </main>
  );
}
