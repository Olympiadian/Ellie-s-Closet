import "server-only";

type OpenMeteoResponse = {
  daily?: {
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    uv_index_max?: number[];
  };
  hourly?: { time?: string[]; uv_index?: number[] };
};

export type WeatherKind = "clear" | "partly-cloudy" | "cloudy" | "rain" | "snow" | "storm" | "fog";

export type WeatherSummary = {
  condition: string;
  kind: WeatherKind;
  high: number;
  low: number;
  uv: number;
  uvPeak: string;
};

const SCOTTSDALE = { latitude: 33.4942, longitude: -111.9261 };

function weatherKind(code: number): WeatherKind {
  if (code === 0) return "clear";
  if (code <= 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 67 || (code >= 80 && code <= 82)) return "rain";
  if (code <= 77 || code === 85 || code === 86) return "snow";
  return "storm";
}

function conditionLabel(code: number) {
  if (code === 0) return "Sunny";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}

function hourLabel(value: string) {
  const hour = Number(value.slice(11, 13));
  if (!Number.isFinite(hour)) return "today";
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display} ${suffix}`;
}

function peakLabel(times: string[], uvValues: number[], maxUv: number) {
  const peakIndexes = uvValues
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => value >= maxUv * 0.9 && value > 0)
    .map(({ index }) => index);
  if (!peakIndexes.length) return "today";
  const first = times[peakIndexes[0]];
  const last = times[peakIndexes[peakIndexes.length - 1]];
  return first && last && first !== last ? `${hourLabel(first)}–${hourLabel(last)}` : hourLabel(first ?? "");
}

export async function getWeatherSummary(): Promise<WeatherSummary> {
  const query = new URLSearchParams({
    latitude: String(SCOTTSDALE.latitude),
    longitude: String(SCOTTSDALE.longitude),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max",
    hourly: "uv_index",
    temperature_unit: "fahrenheit",
    timezone: "America/Phoenix",
    forecast_days: "1",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Weather service unavailable");
  const result = (await response.json()) as OpenMeteoResponse;
  const daily = result.daily;
  const high = daily?.temperature_2m_max?.[0];
  const low = daily?.temperature_2m_min?.[0];
  const uv = daily?.uv_index_max?.[0];
  const code = daily?.weather_code?.[0];
  if (![high, low, uv, code].every(value => typeof value === "number" && Number.isFinite(value))) {
    throw new Error("Weather response was incomplete");
  }
  const safeHigh = high as number;
  const safeLow = low as number;
  const safeUv = uv as number;
  const safeCode = code as number;
  return {
    condition: conditionLabel(safeCode),
    kind: weatherKind(safeCode),
    high: Math.round(safeHigh),
    low: Math.round(safeLow),
    uv: Math.round(safeUv * 10) / 10,
    uvPeak: peakLabel(result.hourly?.time ?? [], result.hourly?.uv_index ?? [], safeUv),
  };
}
