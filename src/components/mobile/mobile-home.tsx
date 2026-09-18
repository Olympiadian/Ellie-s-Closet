import Link from "next/link";
import { MessagesButton } from "@/components/wardrobe/messages";
import { WeatherIcon } from "@/components/weather-icon";
import type { WeatherSummary } from "@/lib/server/weather";
import {
  AddClothesIcon,
  BrowseClosetIcon,
  CalendarIcon,
  DealsIcon,
  SupportIcon,
} from "@/components/mobile/mobile-icons";

const mobilePrimaryActions = [
  {
    title: "New Clothes?",
    description: "Upload new items to your closet",
    href: "/mobile/new-clothes",
    icon: AddClothesIcon,
  },
  {
    title: "Browse Closet",
    description: "Browse your closet and saved items",
    href: "/closet",
    icon: BrowseClosetIcon,
  },
] as const;

export function MobileHome({ dateLabel, weather }: { dateLabel: string; weather: WeatherSummary | null }) {
  const weatherLabel = weather
    ? "Today is " + weather.condition + " with a high of " + weather.high + " degrees, a low of " + weather.low + " degrees, and a UV index of " + weather.uv + " peaking " + weather.uvPeak
    : "Today’s weather is unavailable";

  return (
    <div className="mobile-home">
      <header className="mobile-home__header">
        <p className="mobile-home__eyebrow">Mobile</p>
        <h1>Ellie&apos;s Closet</h1>
        <p className="mobile-home__date">{dateLabel}</p>
      </header>

      <nav className="mobile-home__actions" aria-label="Mobile closet actions">
        {mobilePrimaryActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link href={action.href} key={action.href}>
              <span className="mobile-home__action-copy">
                <strong>{action.title}</strong>
                <small>{action.description}</small>
              </span>
              <Icon className="mobile-home__action-icon" />
            </Link>
          );
        })}

        <div className="mobile-home__quick-actions">
          <Link href="/deals"><span>Stores</span><DealsIcon className="mobile-home__quick-icon" /></Link>
          <MessagesButton mobile />
          <Link href="/calendar"><span>Calendar</span><CalendarIcon className="mobile-home__quick-icon" /></Link>
          <Link href="/help"><span>Support</span><SupportIcon className="mobile-home__quick-icon" /></Link>
        </div>
      </nav>

      <section
        className={"mobile-home__weather mobile-home__weather--" + (weather?.kind ?? "cloudy")}
        aria-label={weatherLabel}
      >
        <div>
          <span className="mobile-home__weather-item"><WeatherIcon kind={weather?.kind ?? "cloudy"} />{weather?.condition ?? "Weather unavailable"}</span>
          <i aria-hidden="true" />
          <span>High {weather ? weather.high + "°" : "—"}</span>
          <span>Low {weather ? weather.low + "°" : "—"}</span>
          <i aria-hidden="true" />
          <span><strong>UV</strong> {weather ? weather.uv + " · " + weather.uvPeak : "—"}</span>
        </div>
      </section>
    </div>
  );
}
