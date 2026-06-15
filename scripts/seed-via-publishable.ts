import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { googleMapsUrl } from "./geocode";
import { parseXlsx } from "./parse-xlsx";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.error("Missing Supabase URL or key in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const reviewPath = path.join(process.cwd(), "data", "geocode-review.json");
  if (!fs.existsSync(reviewPath)) {
    console.error("Run: npx tsx scripts/generate-seed-sql.ts first");
    process.exit(1);
  }

  const geocoded = Object.fromEntries(
    (JSON.parse(fs.readFileSync(reviewPath, "utf-8")) as Array<{
      name: string;
      city: string;
      latitude: number;
      longitude: number;
    }>).map((g) => [`${g.name}|${g.city}`, g])
  );

  const { cafes, categoryPicks, yetToTry } = await parseXlsx();

  const cafeRows = cafes.map((cafe) => {
    const geo = geocoded[`${cafe.name}|${cafe.city}`];
    const lat = geo?.latitude ?? 21.5433;
    const lng = geo?.longitude ?? 39.1728;
    return {
      ...cafe,
      latitude: lat,
      longitude: lng,
      google_maps_url: googleMapsUrl(lat, lng),
      geocode_verified: false,
      updated_at: new Date().toISOString(),
    };
  });

  const { error: cafeError } = await supabase.from("cafes").upsert(cafeRows, {
    onConflict: "slug",
  });
  if (cafeError) throw cafeError;

  await supabase.from("category_picks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: picksError } = await supabase.from("category_picks").insert(
    categoryPicks.map((p) => ({ ...p, updated_at: new Date().toISOString() }))
  );
  if (picksError) throw picksError;

  await supabase.from("yet_to_try").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: yttError } = await supabase.from("yet_to_try").insert(
    yetToTry.map((y) => ({ ...y, updated_at: new Date().toISOString() }))
  );
  if (yttError) throw yttError;

  console.log(
    `Seeded ${cafeRows.length} cafes, ${categoryPicks.length} picks, ${yetToTry.length} yet-to-try.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
