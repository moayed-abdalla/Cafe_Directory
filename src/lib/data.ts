import { createClient } from "@/lib/supabase/server";
import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";

export async function getCafes(): Promise<Cafe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cafes")
    .select("*")
    .order("average", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Cafe[];
}

export async function getCategoryPicks(): Promise<CategoryPick[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("category_picks")
    .select("*")
    .order("category")
    .order("rank");

  if (error) throw new Error(error.message);
  return (data ?? []) as CategoryPick[];
}

export async function getYetToTry(): Promise<YetToTry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("yet_to_try")
    .select("*")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return (data ?? []) as YetToTry[];
}

export async function getSiteData() {
  const [cafes, categoryPicks, yetToTry] = await Promise.all([
    getCafes(),
    getCategoryPicks(),
    getYetToTry(),
  ]);

  return { cafes, categoryPicks, yetToTry };
}
