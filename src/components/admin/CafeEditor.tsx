"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, X } from "lucide-react";
import type { Cafe } from "@/lib/types/cafe";
import { slugify } from "@/lib/types/cafe";
import {
  createCafe,
  updateCafe,
  deleteCafe,
  type CafeFormInput,
} from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const EMPTY_CAFE: CafeFormInput = {
  name: "",
  slug: "",
  city: "Jeddah",
  average: 0,
  aesthetic_score: 0,
  coffee_score: 0,
  desserts_score: 0,
  amenities_score: 0,
  times_visited: 0,
  price_min: null,
  price_max: null,
  price_to_quality: null,
  notes: null,
  latitude: null,
  longitude: null,
  google_maps_url: null,
  address: null,
  geocode_verified: false,
};

type InlineScoreKey =
  | "average"
  | "coffee_score"
  | "desserts_score"
  | "aesthetic_score"
  | "amenities_score";

type InlineCoordKey = "latitude" | "longitude";

type InlineFieldKey = InlineScoreKey | InlineCoordKey;

const INLINE_SCORE_COLUMNS: { key: InlineScoreKey; label: string }[] = [
  { key: "average", label: "Avg" },
  { key: "coffee_score", label: "Coffee" },
  { key: "desserts_score", label: "Desserts" },
  { key: "aesthetic_score", label: "Aesthetic" },
  { key: "amenities_score", label: "Amenities" },
];

function cafeToForm(cafe: Cafe): CafeFormInput {
  return {
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
    latitude: cafe.latitude,
    longitude: cafe.longitude,
    google_maps_url: cafe.google_maps_url,
    address: cafe.address,
    geocode_verified: cafe.geocode_verified,
  };
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium text-espresso/70">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-cream-dark bg-white px-3 py-2 text-sm outline-none focus:border-copper";

const inlineInputClass =
  "w-[4.5rem] rounded border border-cream-dark bg-white px-1.5 py-1 text-sm tabular-nums outline-none focus:border-copper";

const inlineCoordClass =
  "w-[6.5rem] rounded border border-cream-dark bg-white px-1.5 py-1 text-sm tabular-nums outline-none focus:border-copper";

function valuesEqual(a: number | null, b: number | null) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a === b;
}

export function CafeEditor({ cafes }: { cafes: Cafe[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(cafes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CafeFormInput>(EMPTY_CAFE);
  const [error, setError] = useState("");
  const [inlineError, setInlineError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setRows(cafes);
  }, [cafes]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.notes?.toLowerCase().includes(q) ?? false)
    );
  }, [rows, search]);

  function openEdit(cafe: Cafe) {
    setIsCreating(false);
    setSelectedId(cafe.id);
    setForm(cafeToForm(cafe));
    setError("");
  }

  function openCreate() {
    setIsCreating(true);
    setSelectedId(null);
    setForm(EMPTY_CAFE);
    setError("");
  }

  function closePanel() {
    setSelectedId(null);
    setIsCreating(false);
    setError("");
  }

  function updateField<K extends keyof CafeFormInput>(key: K, value: CafeFormInput[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && (isCreating || !prev.slug)) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function updateRowField(id: string, key: InlineFieldKey, value: number | null) {
    setRows((prev) =>
      prev.map((cafe) => (cafe.id === id ? { ...cafe, [key]: value } : cafe))
    );
  }

  function commitInlineField(cafe: Cafe, key: InlineFieldKey, value: number | null) {
    const original = cafes.find((c) => c.id === cafe.id);
    if (!original || valuesEqual(original[key], value)) return;

    startTransition(async () => {
      const result = await updateCafe(cafe.id, { ...cafeToForm(cafe), [key]: value });
      if ("error" in result && result.error) {
        setInlineError(result.error);
        setRows((prev) =>
          prev.map((row) => (row.id === cafe.id ? { ...row, [key]: original[key] } : row))
        );
      } else {
        setInlineError("");
        router.refresh();
      }
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = isCreating
        ? await createCafe(form)
        : selectedId
          ? await updateCafe(selectedId, form)
          : { error: "No café selected" };

      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        closePanel();
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!selectedId) return;
    if (!confirm("Delete this café permanently?")) return;

    startTransition(async () => {
      const result = await deleteCafe(selectedId);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        closePanel();
        router.refresh();
      }
    });
  }

  const panelOpen = isCreating || selectedId !== null;

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className={cn("min-w-0 flex-1", panelOpen && "hidden lg:block")}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40" />
            <input
              type="search"
              placeholder="Search cafés…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-lg bg-espresso px-3 py-2 text-sm font-medium text-cream"
          >
            <Plus className="h-4 w-4" />
            Add café
          </button>
        </div>

        {inlineError && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {inlineError}
          </p>
        )}

        <div className="overflow-x-auto rounded-xl border border-cream-dark">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-cream-dark/60">
              <tr>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">City</th>
                {INLINE_SCORE_COLUMNS.map(({ key, label }) => (
                  <th key={key} className="px-2 py-2.5 font-medium">
                    {label}
                  </th>
                ))}
                <th className="px-2 py-2.5 font-medium">Lat</th>
                <th className="px-2 py-2.5 font-medium">Long</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cafe) => (
                <tr
                  key={cafe.id}
                  className="border-t border-cream-dark/60 hover:bg-cream-dark/40"
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => openEdit(cafe)}
                      className="text-left font-medium hover:text-copper"
                    >
                      {cafe.name}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => openEdit(cafe)}
                      className="text-left text-espresso/60 hover:text-copper"
                    >
                      {cafe.city}
                    </button>
                  </td>
                  {INLINE_SCORE_COLUMNS.map(({ key }) => (
                    <td key={key} className="px-2 py-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        aria-label={`${cafe.name} ${key}`}
                        className={inlineInputClass}
                        value={cafe[key]}
                        disabled={pending}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateRowField(
                            cafe.id,
                            key,
                            e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                          )
                        }
                        onBlur={(e) => {
                          const next =
                            e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                          commitInlineField(cafe, key, next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    </td>
                  ))}
                  {(["latitude", "longitude"] as const).map((key) => (
                    <td key={key} className="px-2 py-1.5">
                      <input
                        type="number"
                        step="any"
                        aria-label={`${cafe.name} ${key}`}
                        className={inlineCoordClass}
                        value={cafe[key] ?? ""}
                        disabled={pending}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (raw === "") {
                            updateRowField(cafe.id, key, null);
                            return;
                          }
                          const next = parseFloat(raw);
                          if (!Number.isNaN(next)) {
                            updateRowField(cafe.id, key, next);
                          }
                        }}
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const next = raw === "" ? null : parseFloat(raw);
                          if (raw !== "" && Number.isNaN(next)) {
                            const original = cafes.find((c) => c.id === cafe.id);
                            updateRowField(cafe.id, key, original?.[key] ?? null);
                            return;
                          }
                          commitInlineField(cafe, key, next);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {panelOpen && (
        <div className="w-full rounded-xl border border-cream-dark bg-white p-5 lg:max-w-md lg:shrink-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg text-espresso">
              {isCreating ? "New café" : "Edit café"}
            </h3>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-full p-1 text-espresso/50 hover:bg-cream-dark"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            <Field label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </Field>
            <Field label="Slug">
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
              />
            </Field>
            <Field label="City">
              <select
                className={inputClass}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              >
                <option value="Jeddah">Jeddah</option>
                <option value="Riyadh">Riyadh</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["average", "Average"],
                  ["coffee_score", "Coffee"],
                  ["desserts_score", "Desserts"],
                  ["aesthetic_score", "Aesthetic"],
                  ["amenities_score", "Amenities"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    className={inputClass}
                    value={form[key]}
                    onChange={(e) => updateField(key, parseFloat(e.target.value) || 0)}
                  />
                </Field>
              ))}
            </div>

            <Field label="Times visited">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.times_visited}
                onChange={(e) => updateField("times_visited", parseInt(e.target.value, 10) || 0)}
              />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Price min">
                <input
                  type="number"
                  className={inputClass}
                  value={form.price_min ?? ""}
                  onChange={(e) =>
                    updateField("price_min", e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </Field>
              <Field label="Price max">
                <input
                  type="number"
                  className={inputClass}
                  value={form.price_max ?? ""}
                  onChange={(e) =>
                    updateField("price_max", e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </Field>
              <Field label="Value score">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.price_to_quality ?? ""}
                  onChange={(e) =>
                    updateField(
                      "price_to_quality",
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                rows={3}
                className={inputClass}
                value={form.notes ?? ""}
                onChange={(e) => updateField("notes", e.target.value || null)}
              />
            </Field>

            <Field label="Google Maps URL">
              <input
                type="url"
                className={inputClass}
                value={form.google_maps_url ?? ""}
                onChange={(e) => updateField("google_maps_url", e.target.value || null)}
              />
            </Field>
            <Field label="Address">
              <input
                className={inputClass}
                value={form.address ?? ""}
                onChange={(e) => updateField("address", e.target.value || null)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input
                  type="number"
                  step="any"
                  className={inputClass}
                  value={form.latitude ?? ""}
                  onChange={(e) =>
                    updateField("latitude", e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="any"
                  className={inputClass}
                  value={form.longitude ?? ""}
                  onChange={(e) =>
                    updateField("longitude", e.target.value ? parseFloat(e.target.value) : null)
                  }
                />
              </Field>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.geocode_verified}
                onChange={(e) => updateField("geocode_verified", e.target.checked)}
              />
              Geocode verified (preserve on re-seed)
            </label>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="flex-1 rounded-lg bg-espresso px-4 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            {!isCreating && selectedId && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                aria-label="Delete café"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
