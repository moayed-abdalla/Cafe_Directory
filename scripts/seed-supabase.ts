import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { geocodeAll, googleMapsUrl } from "./geocode";
import { parseXlsx } from "./parse-xlsx";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    console.error(
      "Add SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  console.log("Parsing xlsx...");
  const { cafes, categoryPicks, yetToTry } = await parseXlsx();

  console.log(`Geocoding ${cafes.length} cafes (1 req/sec)...`);
  const geocoded = await geocodeAll(cafes, (cur, total, name) => {
    process.stdout.write(`\rGeocoding ${cur}/${total}: ${name}          `);
  });
  console.log("\n");

  const reviewLog: Array<{
    name: string;
    city: string;
    latitude: number;
    longitude: number;
    source: string;
    confidence: string;
    displayName: string;
  }> = [];

  for (const cafe of cafes) {
    const key = `${cafe.name}|${cafe.city}`;
    const geo = geocoded[key];

    const { data: existing } = await supabase
      .from("cafes")
      .select("geocode_verified, latitude, longitude, google_maps_url")
      .eq("slug", cafe.slug)
      .maybeSingle();

    let latitude = geo.latitude;
    let longitude = geo.longitude;
    let google_maps_url = googleMapsUrl(latitude, longitude);
    let geocode_verified = false;

    if (existing?.geocode_verified && existing.latitude && existing.longitude) {
      latitude = existing.latitude;
      longitude = existing.longitude;
      google_maps_url = existing.google_maps_url ?? googleMapsUrl(latitude, longitude);
      geocode_verified = true;
    }

    reviewLog.push({
      name: cafe.name,
      city: cafe.city,
      latitude,
      longitude,
      source: geo.source,
      confidence: geo.confidence,
      displayName: geo.displayName,
    });

    const { error } = await supabase.from("cafes").upsert(
      {
        ...cafe,
        latitude,
        longitude,
        google_maps_url,
        geocode_verified,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`Failed to upsert ${cafe.name}:`, error.message);
    }
  }

  await supabase.from("category_picks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: picksError } = await supabase.from("category_picks").insert(
    categoryPicks.map((p) => ({
      ...p,
      updated_at: new Date().toISOString(),
    }))
  );
  if (picksError) console.error("category_picks error:", picksError.message);

  await supabase.from("yet_to_try").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: yttError } = await supabase.from("yet_to_try").insert(
    yetToTry.map((y) => ({
      ...y,
      updated_at: new Date().toISOString(),
    }))
  );
  if (yttError) console.error("yet_to_try error:", yttError.message);

  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, "geocode-review.json"),
    JSON.stringify(reviewLog, null, 2),
    "utf-8"
  );

  console.log(`Seeded ${cafes.length} cafes, ${categoryPicks.length} category picks, ${yetToTry.length} yet-to-try.`);
  console.log("Review geocode-review.json for approximate coordinates.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
