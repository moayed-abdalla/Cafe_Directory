import fs from "fs";
import path from "path";
import { geocodeAll, googleMapsUrl } from "./geocode";
import { parseXlsx } from "./parse-xlsx";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

async function main() {
  console.log("Parsing xlsx...");
  const { cafes, categoryPicks, yetToTry } = await parseXlsx();

  console.log(`Geocoding ${cafes.length} cafes...`);
  const geocoded = await geocodeAll(cafes, (cur, total, name) => {
    process.stdout.write(`\rGeocoding ${cur}/${total}: ${name}          `);
  });
  console.log("\n");

  const reviewLog = cafes.map((cafe) => {
    const geo = geocoded[`${cafe.name}|${cafe.city}`];
    return {
      name: cafe.name,
      city: cafe.city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      source: geo.source,
      confidence: geo.confidence,
      displayName: geo.displayName,
    };
  });

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "geocode-review.json"),
    JSON.stringify(reviewLog, null, 2)
  );

  const cafeValues = cafes
    .map((cafe) => {
      const geo = geocoded[`${cafe.name}|${cafe.city}`];
      const url = googleMapsUrl(geo.latitude, geo.longitude);
      return `(
        '${esc(cafe.slug)}',
        '${esc(cafe.name)}',
        '${esc(cafe.city)}',
        ${cafe.average},
        ${cafe.aesthetic_score},
        ${cafe.coffee_score},
        ${cafe.desserts_score},
        ${cafe.amenities_score},
        ${cafe.times_visited},
        ${cafe.price_min ?? "NULL"},
        ${cafe.price_max ?? "NULL"},
        ${cafe.price_to_quality ?? "NULL"},
        ${cafe.notes ? `'${esc(cafe.notes)}'` : "NULL"},
        ${geo.latitude},
        ${geo.longitude},
        '${url}',
        false
      )`;
    })
    .join(",\n");

  const pickValues = categoryPicks
    .map(
      (p) =>
        `('${p.category}', ${p.rank}, '${esc(p.cafe_name)}', ${p.city ? `'${esc(p.city)}'` : "NULL"})`
    )
    .join(",\n");

  const yttValues = yetToTry
    .map((y) => `('${esc(y.name)}', '${esc(y.city)}', ${y.sort_order})`)
    .join(",\n");

  const sql = `
-- Clear and reseed
truncate public.category_picks, public.yet_to_try, public.cafes cascade;

insert into public.cafes (
  slug, name, city, average, aesthetic_score, coffee_score, desserts_score,
  amenities_score, times_visited, price_min, price_max, price_to_quality,
  notes, latitude, longitude, google_maps_url, geocode_verified
) values
${cafeValues};

insert into public.category_picks (category, rank, cafe_name, city) values
${pickValues};

insert into public.yet_to_try (name, city, sort_order) values
${yttValues};
`;

  fs.writeFileSync(path.join(dataDir, "seed.sql"), sql, "utf-8");
  console.log(`Wrote data/seed.sql (${cafes.length} cafes)`);
}

main().catch(console.error);
