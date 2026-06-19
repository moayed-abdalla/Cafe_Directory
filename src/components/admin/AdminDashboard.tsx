"use client";

import { useState } from "react";
import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";
import { CafeEditor } from "@/components/admin/CafeEditor";
import { YetToTryEditor } from "@/components/admin/YetToTryEditor";
import { CategoryPicksEditor } from "@/components/admin/CategoryPicksEditor";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { cn } from "@/lib/utils";

type Tab = "cafes" | "yet-to-try" | "category-picks";

const TABS: { id: Tab; label: string }[] = [
  { id: "cafes", label: "Cafés" },
  { id: "yet-to-try", label: "Yet to Try" },
  { id: "category-picks", label: "Category Picks" },
];

export function AdminDashboard({
  cafes,
  categoryPicks,
  yetToTry,
  writeError,
}: {
  cafes: Cafe[];
  categoryPicks: CategoryPick[];
  yetToTry: YetToTry[];
  writeError: string | null;
}) {
  const [tab, setTab] = useState<Tab>("cafes");

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-cream-dark bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <h1 className="font-display text-2xl text-espresso">Admin</h1>
          <LogoutButton />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        {writeError && (
          <div
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="alert"
          >
            <p className="font-medium">Saves are disabled — Supabase rejected the service role key.</p>
            <p className="mt-1 text-amber-900/80">
              In Vercel (and locally in <code className="text-xs">.env.local</code>), set{" "}
              <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> to the{" "}
              <strong>service_role</strong> secret from Supabase Dashboard → Settings → API
              (not the publishable/anon key). Then redeploy.
            </p>
            <p className="mt-1 text-xs text-amber-900/60">Error: {writeError}</p>
          </div>
        )}

        <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-cream-dark bg-white p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-espresso text-cream"
                  : "text-espresso/70 hover:bg-cream-dark"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "cafes" && <CafeEditor cafes={cafes} />}
        {tab === "yet-to-try" && <YetToTryEditor items={yetToTry} />}
        {tab === "category-picks" && (
          <CategoryPicksEditor categoryPicks={categoryPicks} cafes={cafes} />
        )}
      </div>
    </div>
  );
}
