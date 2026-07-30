import fs from "fs";
import path from "path";
import { geocodeAll, googleMapsUrl } from "./geocode";
import { parseXlsx } from "./parse-xlsx";

type GeoReviewEntry = {
  name: string;
  city: string;
  latitude: number;
  longitude: number;
};

function loadCachedGeocode(): Record<string, { latitude: number; longitude: number }> {
  const reviewPath = path.join(process.cwd(), "data", "geocode-review.json");
  if (!fs.existsSync(reviewPath)) return {};
  const entries = JSON.parse(fs.readFileSync(reviewPath, "utf-8")) as GeoReviewEntry[];
  const map: Record<string, { latitude: number; longitude: number }> = {};
  for (const e of entries) {
    map[`${e.name}|${e.city}`] = {
      latitude: e.latitude,
      longitude: e.longitude,
    };
  }
  return map;
}

async function main() {
  console.log("Parsing xlsx...");
  const { cafes, categoryPicks, yetToTry } = await parseXlsx();

  const cached = loadCachedGeocode();
  const missing = cafes.filter((c) => !cached[`${c.name}|${c.city}`]);

  let geocoded = { ...cached };
  if (missing.length > 0) {
    console.log(`Geocoding ${missing.length} cafes (rest from cache)...`);
    const fresh = await geocodeAll(missing, (cur, total, name) => {
      process.stdout.write(`\rGeocoding ${cur}/${total}: ${name}          `);
    });
    console.log("\n");
    geocoded = { ...geocoded, ...fresh };
  } else {
    console.log(`Using cached geocode for all ${cafes.length} cafes`);
  }

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const reviewLog = cafes.map((cafe) => {
    const geo = geocoded[`${cafe.name}|${cafe.city}`];
    return {
      name: cafe.name,
      city: cafe.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: cached[`${cafe.name}|${cafe.city}`] ? "cache" : "fresh",
    };
  });
  fs.writeFileSync(
    path.join(dataDir, "geocode-review.json"),
    JSON.stringify(reviewLog, null, 2)
  );

  const cafesJson = cafes.map((cafe) => {
    const geo = geocoded[`${cafe.name}|${cafe.city}`];
    const latitude = geo?.latitude ?? null;
    const longitude = geo?.longitude ?? null;
    return {
      id: cafe.slug,
      name: cafe.name,
      slug: cafe.slug,
      city: cafe.city,
      average: cafe.average,
      aesthetic_score: cafe.aesthetic_score,
      coffee_score: cafe.coffee_score,
      desserts_score: cafe.desserts_score,
      amenities_score: cafe.amenities_score,
      times_visited: cafe.times_visited,
      price_min: cafe.price_min,
      price_max: cafe.price_max,
      price_to_quality: cafe.price_to_quality,
      notes: cafe.notes,
      latitude,
      longitude,
      google_maps_url:
        latitude != null && longitude != null
          ? googleMapsUrl(latitude, longitude)
          : null,
      address: null as string | null,
      geocode_verified: false,
    };
  });

  const picksJson = categoryPicks.map((p) => ({
    id: `${p.category}-${p.rank}`,
    category: p.category,
    rank: p.rank,
    cafe_name: p.cafe_name,
    city: p.city,
  }));

  const yttJson = yetToTry.map((y) => ({
    id: `ytt-${y.sort_order}`,
    name: y.name,
    city: y.city,
    sort_order: y.sort_order,
  }));

  fs.writeFileSync(
    path.join(dataDir, "cafes.json"),
    JSON.stringify(cafesJson, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(dataDir, "category-picks.json"),
    JSON.stringify(picksJson, null, 2) + "\n"
  );
  fs.writeFileSync(
    path.join(dataDir, "yet-to-try.json"),
    JSON.stringify(yttJson, null, 2) + "\n"
  );

  console.log(
    `Wrote data/*.json (${cafesJson.length} cafes, ${picksJson.length} picks, ${yttJson.length} yet-to-try)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
