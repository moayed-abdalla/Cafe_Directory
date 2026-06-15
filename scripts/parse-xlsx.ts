import ExcelJS from "exceljs";
import path from "path";
import type { CategoryKey } from "../src/lib/types/cafe";
import { slugify } from "../src/lib/types/cafe";

export type ParsedCafe = {
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
};

export type ParsedCategoryPick = {
  category: CategoryKey;
  rank: number;
  cafe_name: string;
  city: string | null;
};

export type ParsedYetToTry = {
  name: string;
  city: string;
  sort_order: number;
};

const CATEGORY_COLUMNS: { col: number; category: CategoryKey }[] = [
  { col: 5, category: "overall" },
  { col: 6, category: "coffee" },
  { col: 7, category: "desserts" },
  { col: 8, category: "social" },
  { col: 9, category: "work" },
  { col: 10, category: "value" },
];

function cellValue(row: ExcelJS.Row, col: number): string | number | null {
  const cell = row.getCell(col).value;
  if (cell == null) return null;
  if (typeof cell === "object" && "result" in cell) {
    return cell.result as string | number;
  }
  if (typeof cell === "object" && "richText" in cell) {
    return (cell as ExcelJS.CellRichTextValue).richText
      .map((t) => t.text)
      .join("");
  }
  return cell as string | number;
}

function asNumber(v: string | number | null): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function asString(v: string | number | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

export async function parseXlsx(filePath?: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(
    filePath ?? path.join(process.cwd(), "KSA Cafe Directory.xlsx")
  );

  const fullRatings = workbook.getWorksheet("Full Ratings");
  const summary = workbook.getWorksheet("Summary");
  const yetToTrySheet = workbook.getWorksheet("Yet to Try");

  if (!fullRatings || !summary) {
    throw new Error("Missing required worksheets: Full Ratings or Summary");
  }

  const cafes: ParsedCafe[] = [];

  fullRatings.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = asString(cellValue(row, 2));
    const city = asString(cellValue(row, 3));
    if (!name || !city) return;
    if (/averages?:/i.test(name) || /overall/i.test(name)) return;
    if (!["Jeddah", "Riyadh"].includes(city)) return;

    const average = asNumber(cellValue(row, 8));
    if (average == null || average <= 0 || average > 10) return;

    cafes.push({
      name,
      slug: slugify(name),
      city,
      average,
      aesthetic_score: asNumber(cellValue(row, 4)) ?? 0,
      coffee_score: asNumber(cellValue(row, 5)) ?? 0,
      desserts_score: asNumber(cellValue(row, 6)) ?? 0,
      amenities_score: asNumber(cellValue(row, 7)) ?? 0,
      times_visited: Math.round(asNumber(cellValue(row, 1)) ?? 0),
      price_min: asNumber(cellValue(row, 9)),
      price_max: asNumber(cellValue(row, 10)),
      price_to_quality: asNumber(cellValue(row, 11)),
      notes: asString(cellValue(row, 12)),
    });
  });

  const categoryPicks: ParsedCategoryPick[] = [];
  let currentCity: string | null = null;

  summary.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const cityCell = asString(cellValue(row, 1));
    if (cityCell) currentCity = cityCell;

    if (rowNumber >= 2 && rowNumber <= 4) {
      const rank = rowNumber - 1;
      for (const { col, category } of CATEGORY_COLUMNS) {
        const cafeName = asString(cellValue(row, col));
        if (cafeName) {
          categoryPicks.push({
            category,
            rank,
            cafe_name: cafeName,
            city: currentCity,
          });
        }
      }
    }
  });

  const yetToTry: ParsedYetToTry[] = [];
  if (yetToTrySheet) {
    let sortOrder = 0;
    yetToTrySheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const name = asString(cellValue(row, 1));
      if (!name) return;
      yetToTry.push({
        name,
        city: "Jeddah",
        sort_order: sortOrder++,
      });
    });
  }

  return { cafes, categoryPicks, yetToTry };
}
