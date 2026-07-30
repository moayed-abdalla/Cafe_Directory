import fs from "fs";
import path from "path";
import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";

const DATA_DIR = path.join(process.cwd(), "data");

function filePath(name: string) {
  return path.join(DATA_DIR, name);
}

function readJsonFile<T>(name: string): T {
  const raw = fs.readFileSync(filePath(name), "utf-8");
  return JSON.parse(raw) as T;
}

function writeJsonFile<T>(name: string, data: T) {
  const target = filePath(name);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n", "utf-8");
  fs.renameSync(tmp, target);
}

export function readCafes(): Cafe[] {
  return readJsonFile<Cafe[]>("cafes.json");
}

export function writeCafes(cafes: Cafe[]) {
  writeJsonFile("cafes.json", cafes);
}

export function readCategoryPicks(): CategoryPick[] {
  return readJsonFile<CategoryPick[]>("category-picks.json");
}

export function writeCategoryPicks(picks: CategoryPick[]) {
  writeJsonFile("category-picks.json", picks);
}

export function readYetToTry(): YetToTry[] {
  return readJsonFile<YetToTry[]>("yet-to-try.json");
}

export function writeYetToTry(items: YetToTry[]) {
  writeJsonFile("yet-to-try.json", items);
}

export function newId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
