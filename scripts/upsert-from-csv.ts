import fs from "fs";
import path from "path";
import { geocodeAll, googleMapsUrl } from "./geocode";
import type { Cafe, YetToTry } from "../src/lib/types/cafe";
import { normalizeName, slugify } from "../src/lib/types/cafe";

type ParsedCsvCafe = {
  name: string;
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

type GeoReviewEntry = {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  source?: string;
};

const ROUNDING_TOLERANCE = 0.05;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (c === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function asNumber(v: string | undefined): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s.toUpperCase() === "X" || s.includes("DIV")) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function asString(v: string | undefined): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s || null;
}

function cafeKey(name: string, city: string): string {
  return `${normalizeName(name)}|${normalizeName(city)}`;
}

function meaningfullyDifferent(
  csv: number | null,
  existing: number | null,
  options?: { allowRounding?: boolean }
): boolean {
  if (csv == null && existing == null) return false;
  if (csv == null || existing == null) return true;
  const delta = Math.abs(csv - existing);
  if (options?.allowRounding && delta < ROUNDING_TOLERANCE) return false;
  return delta > 1e-9;
}

function parseFullRatingsCsv(filePath: string): ParsedCsvCafe[] {
  const rows = parseCSV(fs.readFileSync(filePath, "utf-8"));
  const cafes: ParsedCsvCafe[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const name = asString(cols[1]);
    const city = asString(cols[2]);
    if (!name || !city) continue;
    if (/averages?:/i.test(name) || /overall/i.test(name)) continue;
    if (!["Jeddah", "Riyadh"].includes(city)) continue;

    const average = asNumber(cols[7]);
    if (average == null || average <= 0 || average > 10) continue;

    // desserts "X" → 0 (existing convention); other non-numeric → 0
    const dessertsRaw = cols[5];
    const dessertsNum = asNumber(dessertsRaw);
    const desserts_score =
      dessertsNum ??
      (String(dessertsRaw ?? "").trim().toUpperCase() === "X" ? 0 : 0);

    cafes.push({
      name,
      city,
      average,
      aesthetic_score: asNumber(cols[3]) ?? 0,
      coffee_score: asNumber(cols[4]) ?? 0,
      desserts_score,
      amenities_score: asNumber(cols[6]) ?? 0,
      times_visited: Math.round(asNumber(cols[0]) ?? 0),
      price_min: asNumber(cols[8]),
      price_max: asNumber(cols[9]),
      price_to_quality: asNumber(cols[10]),
      notes: asString(cols[11]),
    });
  }

  return cafes;
}

function applyCsvUpdates(existing: Cafe, csv: ParsedCsvCafe): Cafe {
  const next = { ...existing };
  let changed = false;

  const assignNum = (
    key: keyof Cafe,
    csvVal: number | null,
    existingVal: number | null,
    allowRounding = false
  ) => {
    if (meaningfullyDifferent(csvVal, existingVal, { allowRounding })) {
      (next as Record<string, unknown>)[key] = csvVal;
      changed = true;
    }
  };

  if (csv.times_visited !== existing.times_visited) {
    next.times_visited = csv.times_visited;
    changed = true;
  }

  assignNum("aesthetic_score", csv.aesthetic_score, existing.aesthetic_score);
  assignNum("coffee_score", csv.coffee_score, existing.coffee_score);
  assignNum("desserts_score", csv.desserts_score, existing.desserts_score);
  assignNum("amenities_score", csv.amenities_score, existing.amenities_score);
  assignNum("average", csv.average, existing.average, true);
  assignNum("price_min", csv.price_min, existing.price_min);
  assignNum("price_max", csv.price_max, existing.price_max);
  assignNum("price_to_quality", csv.price_to_quality, existing.price_to_quality, true);

  if ((csv.notes || "") !== (existing.notes || "")) {
    next.notes = csv.notes;
    changed = true;
  }

  if (changed) {
    console.log(`  updated: ${existing.name} (${existing.city})`);
  }
  return next;
}

async function main() {
  const csvPath =
    process.argv[2] ??
    path.join(
      process.env.USERPROFILE ?? process.env.HOME ?? "",
      "Downloads",
      "KSA Cafe Directory - Full Ratings.csv"
    );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const dataDir = path.join(process.cwd(), "data");
  const cafesPath = path.join(dataDir, "cafes.json");
  const yetPath = path.join(dataDir, "yet-to-try.json");
  const geoPath = path.join(dataDir, "geocode-review.json");

  console.log(`Parsing CSV: ${csvPath}`);
  const csvCafes = parseFullRatingsCsv(csvPath);
  console.log(`Parsed ${csvCafes.length} cafes from CSV`);

  const existingCafes: Cafe[] = JSON.parse(fs.readFileSync(cafesPath, "utf-8"));
  const yetToTry: YetToTry[] = JSON.parse(fs.readFileSync(yetPath, "utf-8"));
  const geoReview: GeoReviewEntry[] = fs.existsSync(geoPath)
    ? JSON.parse(fs.readFileSync(geoPath, "utf-8"))
    : [];

  const existingByKey = new Map(
    existingCafes.map((c) => [cafeKey(c.name, c.city), c])
  );
  const geoByKey = new Map(
    geoReview.map((e) => [
      `${e.name}|${e.city}`,
      { latitude: e.latitude, longitude: e.longitude },
    ])
  );

  const updated: Cafe[] = [];
  const newParsed: ParsedCsvCafe[] = [];
  let updateCount = 0;

  for (const csv of csvCafes) {
    const key = cafeKey(csv.name, csv.city);
    const match = existingByKey.get(key);
    if (match) {
      const before = JSON.stringify(match);
      const after = applyCsvUpdates(match, csv);
      if (JSON.stringify(after) !== before) updateCount++;
      updated.push(after);
      existingByKey.delete(key);
    } else {
      newParsed.push(csv);
    }
  }

  // Keep any cafes that were in JSON but not in CSV (none expected)
  for (const leftover of existingByKey.values()) {
    console.log(`  keeping (not in CSV): ${leftover.name} (${leftover.city})`);
    updated.push(leftover);
  }

  console.log(`Matched updates with field changes: ${updateCount}`);
  console.log(`New cafes to add: ${newParsed.length}`);

  let geocoded: Record<string, { latitude: number; longitude: number }> = {};
  if (newParsed.length > 0) {
    const needGeo = newParsed.filter((c) => !geoByKey.has(`${c.name}|${c.city}`));
    console.log(`Geocoding ${needGeo.length} new cafes...`);
    if (needGeo.length > 0) {
      const fresh = await geocodeAll(needGeo, (cur, total, name) => {
        process.stdout.write(`\rGeocoding ${cur}/${total}: ${name}          `);
      });
      console.log("\n");
      for (const [k, v] of Object.entries(fresh)) {
        geocoded[k] = { latitude: v.latitude, longitude: v.longitude };
      }
    }
    for (const c of newParsed) {
      const k = `${c.name}|${c.city}`;
      if (!geocoded[k] && geoByKey.has(k)) {
        geocoded[k] = geoByKey.get(k)!;
      }
    }
  }

  const usedSlugs = new Set(updated.map((c) => c.slug));
  for (const csv of newParsed) {
    let slug = slugify(csv.name);
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${slugify(csv.city)}`;
    }
    usedSlugs.add(slug);

    const geo = geocoded[`${csv.name}|${csv.city}`];
    const latitude = geo?.latitude ?? null;
    const longitude = geo?.longitude ?? null;

    updated.push({
      id: slug,
      name: csv.name,
      slug,
      city: csv.city,
      average: csv.average,
      aesthetic_score: csv.aesthetic_score,
      coffee_score: csv.coffee_score,
      desserts_score: csv.desserts_score,
      amenities_score: csv.amenities_score,
      times_visited: csv.times_visited,
      price_min: csv.price_min,
      price_max: csv.price_max,
      price_to_quality: csv.price_to_quality,
      notes: csv.notes,
      latitude,
      longitude,
      google_maps_url:
        latitude != null && longitude != null
          ? googleMapsUrl(latitude, longitude)
          : null,
      address: null,
      geocode_verified: false,
    });
    console.log(`  added: ${csv.name} (${csv.city})`);
  }

  // Prune yet-to-try entries that now appear in rated cafes
  const ratedNames = new Set(updated.map((c) => normalizeName(c.name)));
  const prunedYet = yetToTry.filter((y) => !ratedNames.has(normalizeName(y.name)));
  const removedYet = yetToTry.length - prunedYet.length;
  const reindexedYet: YetToTry[] = prunedYet.map((y, i) => ({
    id: `ytt-${i}`,
    name: y.name,
    city: y.city,
    sort_order: i,
  }));

  // Update geocode-review: keep existing, append new
  const geoOut: GeoReviewEntry[] = [...geoReview];
  const geoKeys = new Set(geoOut.map((e) => `${e.name}|${e.city}`));
  for (const csv of newParsed) {
    const k = `${csv.name}|${csv.city}`;
    if (geoKeys.has(k)) continue;
    const geo = geocoded[k];
    if (!geo) continue;
    geoOut.push({
      name: csv.name,
      city: csv.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: "fresh",
    });
    geoKeys.add(k);
  }

  fs.writeFileSync(cafesPath, JSON.stringify(updated, null, 2) + "\n");
  fs.writeFileSync(yetPath, JSON.stringify(reindexedYet, null, 2) + "\n");
  fs.writeFileSync(geoPath, JSON.stringify(geoOut, null, 2) + "\n");

  console.log(
    `\nDone: ${updated.length} cafes, removed ${removedYet} from yet-to-try (${reindexedYet.length} remaining). Category picks untouched.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
