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
}: {
  cafes: Cafe[];
  categoryPicks: CategoryPick[];
  yetToTry: YetToTry[];
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
        <div className="mb-6 rounded-xl border border-cream-dark bg-white px-4 py-3 text-sm text-espresso/70">
          Saves update JSON files under <code className="text-xs">data/</code>{" "}
          locally. Commit and redeploy to publish changes to production.
        </div>

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
