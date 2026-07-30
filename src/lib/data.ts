import {
  readCafes,
  readCategoryPicks,
  readYetToTry,
} from "@/lib/store";
import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";

export async function getCafes(): Promise<Cafe[]> {
  return [...readCafes()].sort((a, b) => b.average - a.average);
}

export async function getCategoryPicks(): Promise<CategoryPick[]> {
  return [...readCategoryPicks()].sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.rank - b.rank;
  });
}

export async function getYetToTry(): Promise<YetToTry[]> {
  return [...readYetToTry()].sort((a, b) => a.sort_order - b.sort_order);
}

export async function getSiteData() {
  const [cafes, categoryPicks, yetToTry] = await Promise.all([
    getCafes(),
    getCategoryPicks(),
    getYetToTry(),
  ]);

  return { cafes, categoryPicks, yetToTry };
}
