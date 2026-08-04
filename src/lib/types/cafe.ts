export type CategoryKey =
  | "overall"
  | "coffee"
  | "desserts"
  | "social"
  | "work"
  | "value";

export type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  average: number;
  aesthetic_score: number;
  coffee_score: number;
  desserts_score: number;
  amenities_score: number;
  times_visited: number;
  price_min: number | null;
  price_max: number | null;
  price_to_quality: number | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  address: string | null;
  geocode_verified: boolean;
};

export type CategoryPick = {
  id: string;
  category: CategoryKey;
  rank: number;
  cafe_name: string;
  city: string | null;
};

export type YetToTry = {
  id: string;
  name: string;
  city: string;
  sort_order: number;
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  overall: "Overall",
  coffee: "Coffee",
  desserts: "Desserts",
  social: "Social",
  work: "Work",
  value: "Value",
};

export const CATEGORY_SCORE_KEY: Record<
  CategoryKey,
  keyof Pick<
    Cafe,
    "average" | "coffee_score" | "desserts_score" | "aesthetic_score" | "amenities_score" | "price_to_quality"
  >
> = {
  overall: "average",
  coffee: "coffee_score",
  desserts: "desserts_score",
  social: "aesthetic_score",
  work: "amenities_score",
  value: "price_to_quality",
};

export function getScoreTier(score: number): "gold" | "warm" | "muted" {
  if (score >= 8.5) return "gold";
  if (score >= 7.5) return "warm";
  return "muted";
}

type Rgb = readonly [number, number, number];

const PIN_STOPS: { at: number; rgb: Rgb }[] = [
  { at: 0, rgb: [138, 154, 123] }, // sage
  { at: 5, rgb: [184, 115, 51] }, // copper
  { at: 10, rgb: [201, 162, 39] }, // gold
];

const ESPRESSO = "#2c1810";
const CREAM = "#f5f0e8";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(lerp(a[0], b[0], t)),
    Math.round(lerp(a[1], b[1], t)),
    Math.round(lerp(a[2], b[2], t)),
  ];
}

function rgbToCss([r, g, b]: Rgb, alpha?: number): string {
  if (alpha == null) return `rgb(${r} ${g} ${b})`;
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** Relative luminance (sRGB) for contrast decisions. */
function relativeLuminance([r, g, b]: Rgb): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function interpolatePinRgb(score: number): Rgb {
  const quantized = Math.round(clamp(score, 0, 10) * 10) / 10;

  for (let i = 0; i < PIN_STOPS.length - 1; i++) {
    const from = PIN_STOPS[i];
    const to = PIN_STOPS[i + 1];
    if (quantized <= to.at) {
      const t = (quantized - from.at) / (to.at - from.at);
      return lerpRgb(from.rgb, to.rgb, t);
    }
  }

  return PIN_STOPS[PIN_STOPS.length - 1].rgb;
}

/** Continuous pin colors quantized to 0.1 steps (101 shades, 0.0–10.0). */
export function getScorePinColors(score: number): {
  backgroundColor: string;
  color: string;
  ringColor: string;
} {
  const rgb = interpolatePinRgb(score);
  return {
    backgroundColor: rgbToCss(rgb),
    color: relativeLuminance(rgb) > 0.35 ? ESPRESSO : CREAM,
    ringColor: rgbToCss(rgb, 0.5),
  };
}

export function formatScore(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) return "—";
  return score.toFixed(1);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function findCafeByName(cafes: Cafe[], name: string): Cafe | undefined {
  const target = normalizeName(name);
  return (
    cafes.find((c) => normalizeName(c.name) === target) ??
    cafes.find((c) => normalizeName(c.name).includes(target) || target.includes(normalizeName(c.name)))
  );
}
