"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Cafe, YetToTry } from "@/lib/types/cafe";
import { formatScore } from "@/lib/types/cafe";
import { useSite } from "@/components/providers/SiteProvider";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

type FullDataPanelProps = {
  cafes: Cafe[];
  yetToTry: YetToTry[];
};

type SortKey = keyof Pick<
  Cafe,
  | "name"
  | "city"
  | "average"
  | "coffee_score"
  | "desserts_score"
  | "times_visited"
>;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Café" },
  { key: "city", label: "City" },
  { key: "average", label: "Avg" },
  { key: "coffee_score", label: "Coffee" },
  { key: "desserts_score", label: "Desserts" },
  { key: "times_visited", label: "Visits" },
];

export function FullDataSection({ cafes, yetToTry }: FullDataPanelProps) {
  const { fullDataOpen, setFullDataOpen } = useSite();

  return (
    <>
      <section
        id="full-data-section"
        className="flex min-h-[50dvh] flex-col items-center justify-center bg-espresso px-4 py-20"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <h2 className="mb-4 font-display text-3xl text-cream md:text-4xl">
            Want every detail?
          </h2>
          <p className="mb-8 max-w-md text-cream/60">
            Full ratings, notes, and price breakdowns for every café you&apos;ve
            visited.
          </p>
          <MagneticButton onClick={() => setFullDataOpen(true)}>
            Full Data
          </MagneticButton>
        </motion.div>
      </section>

      <AnimatePresence>
        {fullDataOpen && (
          <FullDataPanel
            cafes={cafes}
            yetToTry={yetToTry}
            onClose={() => setFullDataOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function FullDataPanel({
  cafes,
  yetToTry,
  onClose,
}: {
  cafes: Cafe[];
  yetToTry: YetToTry[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("average");
  const [sortAsc, setSortAsc] = useState(false);
  const [yttOpen, setYttOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = cafes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.notes?.toLowerCase().includes(q) ?? false)
    );

    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });

    return list;
  }, [cafes, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-cream"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-full flex-col"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-cream-dark px-4 py-4 md:px-8">
          <h2 className="font-display text-2xl text-espresso md:text-3xl">
            Full Data
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-espresso/60 transition-colors hover:bg-cream-dark hover:text-espresso"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="shrink-0 px-4 py-4 md:px-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/40" />
            <input
              type="search"
              placeholder="Search cafés, cities, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-cream-dark bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-copper"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-8 md:px-8">
          <div className="overflow-x-auto rounded-xl border border-cream-dark">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 bg-cream-dark/90 backdrop-blur-sm">
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-medium">
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 hover:text-copper"
                      >
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-copper">
                            {sortAsc ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cafe) => (
                  <tr
                    key={cafe.id}
                    className="border-t border-cream-dark/60 hover:bg-cream-dark/40"
                  >
                    <td className="px-4 py-3 font-medium">{cafe.name}</td>
                    <td className="px-4 py-3 text-espresso/60">{cafe.city}</td>
                    <td className="px-4 py-3 font-semibold text-copper">
                      {formatScore(cafe.average)}
                    </td>
                    <td className="px-4 py-3">{formatScore(cafe.coffee_score)}</td>
                    <td className="px-4 py-3">{formatScore(cafe.desserts_score)}</td>
                    <td className="px-4 py-3">{cafe.times_visited}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-espresso/60">
                      {cafe.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {yetToTry.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setYttOpen(!yttOpen)}
                className="flex w-full items-center justify-between rounded-xl bg-cream-dark px-4 py-3 text-left font-medium"
              >
                Yet to Try ({yetToTry.length})
                {yttOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <AnimatePresence>
                {yttOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 grid gap-2 overflow-hidden sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {yetToTry.map((item) => (
                      <li
                        key={item.id}
                        className={cn(
                          "rounded-lg border border-cream-dark px-4 py-2 text-sm text-espresso/80"
                        )}
                      >
                        {item.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
