import { createClient } from "@supabase/supabase-js";

function getAdminKey(): string | undefined {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;
  return key?.trim() || undefined;
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = getAdminKey();

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

/** Returns null when the service role key is missing or rejected by Supabase. */
export async function checkAdminWriteAccess(): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("cafes").select("id").limit(1);
    if (error) return error.message;
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Admin write access unavailable";
  }
}

