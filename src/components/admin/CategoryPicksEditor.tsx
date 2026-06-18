"use client";

import { useMemo, useState, useTransition } from "react";
import type { Cafe, CategoryPick, CategoryKey } from "@/lib/types/cafe";
import { CATEGORY_LABELS } from "@/lib/types/cafe";
import { saveCategoryPicks, type CategoryPickInput } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as CategoryKey[];
const RANKS = [1, 2, 3] as const;

function buildInitialPicks(picks: CategoryPick[]): CategoryPickInput[] {
  const map = new Map<string, CategoryPickInput>();
  for (const pick of picks) {
    map.set(`${pick.category}-${pick.rank}`, {
      category: pick.category,
      rank: pick.rank,
      cafe_name: pick.cafe_name,
      city: pick.city,
    });
  }

  const result: CategoryPickInput[] = [];
  for (const category of CATEGORY_KEYS) {
    for (const rank of RANKS) {
      const key = `${category}-${rank}`;
      result.push(
        map.get(key) ?? {
          category,
          rank,
          cafe_name: "",
          city: null,
        }
      );
    }
  }
  return result;
}

const inputClass =
  "w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm outline-none focus:border-copper";

export function CategoryPicksEditor({
  categoryPicks,
  cafes,
}: {
  categoryPicks: CategoryPick[];
  cafes: Cafe[];
}) {
  const [picks, setPicks] = useState(() => buildInitialPicks(categoryPicks));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const cafeOptions = useMemo(
    () =>
      cafes.map((c) => ({
        label: `${c.name} (${c.city})`,
        name: c.name,
        city: c.city,
      })),
    [cafes]
  );

  function updatePick(
    category: CategoryKey,
    rank: number,
    field: "cafe_name" | "city",
    value: string
  ) {
    setPicks((prev) =>
      prev.map((p) =>
        p.category === category && p.rank === rank ? { ...p, [field]: value || null } : p
      )
    );
    setSuccess(false);
  }

  function selectCafe(category: CategoryKey, rank: number, cafeName: string) {
    const cafe = cafes.find((c) => c.name === cafeName);
    setPicks((prev) =>
      prev.map((p) =>
        p.category === category && p.rank === rank
          ? { ...p, cafe_name: cafeName, city: cafe?.city ?? p.city }
          : p
      )
    );
    setSuccess(false);
  }

  function handleSave() {
    startTransition(async () => {
      const toSave = picks.filter((p) => p.cafe_name.trim());
      const result = await saveCategoryPicks(toSave);
      if ("error" in result && result.error) {
        setError(result.error);
        setSuccess(false);
      } else {
        setError("");
        setSuccess(true);
      }
    });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-espresso/60">
        Set the top 3 cafés for each leaderboard category. Leave a slot empty to omit it.
      </p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORY_KEYS.map((category) => (
          <div
            key={category}
            className="rounded-xl border border-cream-dark bg-white p-4"
          >
            <h3 className="mb-3 font-display text-lg text-espresso">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-3">
              {RANKS.map((rank) => {
                const pick = picks.find((p) => p.category === category && p.rank === rank)!;
                return (
                  <div key={rank} className="space-y-1">
                    <span className="text-xs font-medium text-espresso/50">#{rank}</span>
                    <select
                      className={inputClass}
                      value={pick.cafe_name}
                      onChange={(e) => selectCafe(category, rank, e.target.value)}
                    >
                      <option value="">— Select café —</option>
                      {cafeOptions.map((opt) => (
                        <option key={opt.name} value={opt.name}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputClass}
                      placeholder="Or type café name"
                      value={pick.cafe_name}
                      onChange={(e) => updatePick(category, rank, "cafe_name", e.target.value)}
                    />
                    <input
                      className={cn(inputClass, "text-espresso/70")}
                      placeholder="City (optional)"
                      value={pick.city ?? ""}
                      onChange={(e) => updatePick(category, rank, "city", e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-sage" role="status">
          Category picks saved.
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="rounded-lg bg-espresso px-6 py-2.5 text-sm font-medium text-cream disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save all category picks"}
      </button>
    </div>
  );
}
