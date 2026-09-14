import type { WeatherKind } from "@/lib/server/weather";

export function WeatherIcon({ kind }: { kind: WeatherKind }) {
  if (kind === "rain" || kind === "storm") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 16.5h11.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.2 1.7A3 3 0 0 0 5 16.5Z" />
        <path d="m9 19-1 2M14 19l-1 2M18 19l-1 2" />
      </svg>
    );
  }

  if (kind === "snow") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M8.8 4.8 12 7l3.2-2.2M8.8 19.2 12 17l3.2 2.2" />
      </svg>
    );
  }

  if (kind === "cloudy" || kind === "fog") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 16.5h11.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.2 1.7A3 3 0 0 0 5 16.5Z" />
        {kind === "fog" && <path d="M6 19.5h12" />}
      </svg>
    );
  }

  if (kind === "partly-cloudy") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="9" r="3" />
        <path d="M9 3v1.5M9 13.5V15M3 9h1.5M13.5 9H15M4.8 4.8l1 1M13.2 13.2l1 1M5 17h11.2a3.8 3.8 0 0 0 .4-7.6 5.3 5.3 0 0 0-3.1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </svg>
  );
}
