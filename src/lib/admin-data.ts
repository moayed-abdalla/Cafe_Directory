import { createAdminClient } from "@/lib/supabase/admin";
import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";

export async function getAdminData() {
  const supabase = createAdminClient();

  const [cafesRes, picksRes, yttRes] = await Promise.all([
    supabase.from("cafes").select("*").order("average", { ascending: false }),
    supabase.from("category_picks").select("*").order("category").order("rank"),
    supabase.from("yet_to_try").select("*").order("sort_order"),
  ]);

  if (cafesRes.error) throw new Error(cafesRes.error.message);
  if (picksRes.error) throw new Error(picksRes.error.message);
  if (yttRes.error) throw new Error(yttRes.error.message);

  return {
    cafes: (cafesRes.data ?? []) as Cafe[],
    categoryPicks: (picksRes.data ?? []) as CategoryPick[],
    yetToTry: (yttRes.data ?? []) as YetToTry[],
  };
}
