export type GeocodeResult = {
  latitude: number;
  longitude: number;
  displayName: string;
  source: "nominatim" | "mapbox" | "fallback";
  confidence: "high" | "low";
};

const JEDDAH_CENTER = { lat: 21.5433, lng: 39.1728 };
const RIYADH_CENTER = { lat: 24.7136, lng: 46.6753 };

function cityCenter(city: string) {
  return city.toLowerCase().includes("riyadh") ? RIYADH_CENTER : JEDDAH_CENTER;
}

function jitter(base: { lat: number; lng: number }, index: number) {
  const angle = (index * 137.5 * Math.PI) / 180;
  const radius = 0.008 + (index % 5) * 0.002;
  return {
    lat: base.lat + Math.cos(angle) * radius,
    lng: base.lng + Math.sin(angle) * radius,
  };
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

async function geocodeNominatim(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "sa");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "MoayedCafeDirectory/1.0" },
  });

  if (!res.ok) return null;
  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data.length) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    displayName: data[0].display_name,
    source: "nominatim",
    confidence: "high",
  };
}

async function geocodeMapbox(query: string): Promise<GeocodeResult | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? process.env.MAPBOX_TOKEN;
  if (!token) return null;

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "sa");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    features?: Array<{
      center: [number, number];
      place_name: string;
      relevance: number;
    }>;
  };

  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    latitude: feature.center[1],
    longitude: feature.center[0],
    displayName: feature.place_name,
    source: "mapbox",
    confidence: feature.relevance >= 0.6 ? "high" : "low",
  };
}

export async function geocodeCafe(
  name: string,
  city: string,
  index: number
): Promise<GeocodeResult> {
  const query = `${name}, ${city}, Saudi Arabia`;

  const nominatim = await geocodeNominatim(query);
  if (nominatim) return nominatim;

  await sleep(1100);

  const mapbox = await geocodeMapbox(query);
  if (mapbox) return mapbox;

  const center = jitter(cityCenter(city), index);
  return {
    latitude: center.lat,
    longitude: center.lng,
    displayName: `${name} (approximate city center)`,
    source: "fallback",
    confidence: "low",
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeAll(
  cafes: { name: string; city: string }[],
  onProgress?: (current: number, total: number, name: string) => void
) {
  const results: Record<string, GeocodeResult> = {};

  for (let i = 0; i < cafes.length; i++) {
    const cafe = cafes[i];
    onProgress?.(i + 1, cafes.length, cafe.name);
    results[`${cafe.name}|${cafe.city}`] = await geocodeCafe(
      cafe.name,
      cafe.city,
      i
    );
    if (i < cafes.length - 1) await sleep(1100);
  }

  return results;
}
