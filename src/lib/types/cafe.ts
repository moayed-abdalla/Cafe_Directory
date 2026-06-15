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
