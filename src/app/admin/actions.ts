"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CategoryKey } from "@/lib/types/cafe";
import { slugify } from "@/lib/types/cafe";

const CATEGORY_KEYS: CategoryKey[] = [
  "overall",
  "coffee",
  "desserts",
  "social",
  "work",
  "value",
];

function parseScore(value: unknown, required = true): number | null {
  if (value === "" || value === null || value === undefined) {
    return required ? null : null;
  }
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || n < 0 || n > 10) return null;
  return n;
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function parseOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s || null;
}

export type CafeFormInput = {
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

function validateCafeInput(raw: CafeFormInput): CafeFormInput | { error: string } {
  const name = raw.name?.trim();
  const city = raw.city?.trim();
  const slug = (raw.slug?.trim() || slugify(name ?? "")).trim();

  if (!name) return { error: "Name is required" };
  if (!city) return { error: "City is required" };
  if (!slug) return { error: "Slug is required" };
  if (!["Jeddah", "Riyadh"].includes(city)) {
    return { error: "City must be Jeddah or Riyadh" };
  }

  const average = parseScore(raw.average);
  const aesthetic_score = parseScore(raw.aesthetic_score);
  const coffee_score = parseScore(raw.coffee_score);
  const desserts_score = parseScore(raw.desserts_score);
  const amenities_score = parseScore(raw.amenities_score);

  if (
    average === null ||
    aesthetic_score === null ||
    coffee_score === null ||
    desserts_score === null ||
    amenities_score === null
  ) {
    return { error: "Scores must be numbers between 0 and 10" };
  }

  const times_visited = Math.max(0, Math.round(Number(raw.times_visited) || 0));

  return {
    name,
    slug,
    city,
    average,
    aesthetic_score,
    coffee_score,
    desserts_score,
    amenities_score,
    times_visited,
    price_min: parseOptionalNumber(raw.price_min),
    price_max: parseOptionalNumber(raw.price_max),
    price_to_quality: parseOptionalNumber(raw.price_to_quality),
    notes: parseOptionalString(raw.notes),
    latitude: parseOptionalNumber(raw.latitude),
    longitude: parseOptionalNumber(raw.longitude),
    google_maps_url: parseOptionalString(raw.google_maps_url),
    address: parseOptionalString(raw.address),
    geocode_verified: Boolean(raw.geocode_verified),
  };
}

export async function createCafe(raw: CafeFormInput) {
  await requireAdmin();
  const data = validateCafeInput(raw);
  if ("error" in data) return { error: data.error };

  const supabase = createAdminClient();
  const { error } = await supabase.from("cafes").insert({
    ...data,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function updateCafe(id: string, raw: CafeFormInput) {
  await requireAdmin();
  const data = validateCafeInput(raw);
  if ("error" in data) return { error: data.error };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("cafes")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCafe(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("cafes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function createYetToTry(name: string, city: string) {
  await requireAdmin();
  const trimmedName = name.trim();
  const trimmedCity = city.trim() || "Jeddah";
  if (!trimmedName) return { error: "Name is required" };

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("yet_to_try")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("yet_to_try").insert({
    name: trimmedName,
    city: trimmedCity,
    sort_order,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function updateYetToTry(id: string, name: string, city: string) {
  await requireAdmin();
  const trimmedName = name.trim();
  const trimmedCity = city.trim() || "Jeddah";
  if (!trimmedName) return { error: "Name is required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("yet_to_try")
    .update({
      name: trimmedName,
      city: trimmedCity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function deleteYetToTry(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("yet_to_try").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

export async function reorderYetToTry(id: string, direction: "up" | "down") {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: items, error: fetchError } = await supabase
    .from("yet_to_try")
    .select("id, sort_order")
    .order("sort_order");

  if (fetchError || !items) return { error: fetchError?.message ?? "Failed to load items" };

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return { error: "Item not found" };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= items.length) return { ok: true };

  const current = items[index];
  const swap = items[swapIndex];

  const { error: e1 } = await supabase
    .from("yet_to_try")
    .update({ sort_order: swap.sort_order })
    .eq("id", current.id);
  const { error: e2 } = await supabase
    .from("yet_to_try")
    .update({ sort_order: current.sort_order })
    .eq("id", swap.id);

  if (e1 || e2) return { error: e1?.message ?? e2?.message ?? "Reorder failed" };
  revalidatePath("/");
  return { ok: true };
}

export type CategoryPickInput = {
  category: CategoryKey;
  rank: number;
  cafe_name: string;
  city: string | null;
};

export async function saveCategoryPicks(picks: CategoryPickInput[]) {
  await requireAdmin();

  for (const pick of picks) {
    if (!CATEGORY_KEYS.includes(pick.category)) {
      return { error: `Invalid category: ${pick.category}` };
    }
    if (pick.rank < 1 || pick.rank > 3) {
      return { error: "Rank must be between 1 and 3" };
    }
    if (!pick.cafe_name.trim()) {
      return { error: "Cafe name is required for all picks" };
    }
  }

  const supabase = createAdminClient();

  await supabase
    .from("category_picks")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const rows = picks
    .filter((p) => p.cafe_name.trim())
    .map((p) => ({
      category: p.category,
      rank: p.rank,
      cafe_name: p.cafe_name.trim(),
      city: p.city?.trim() || null,
      updated_at: new Date().toISOString(),
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from("category_picks").insert(rows);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}
