"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import {
  CATEGORY_LABELS,
  CATEGORY_SCORE_KEY,
  findCafeByName,
  formatScore,
  type Cafe,
  type CategoryPick,
} from "@/lib/types/cafe";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { CountUp } from "@/components/ui/CountUp";
import { useSite } from "@/components/providers/SiteProvider";
import { cn } from "@/lib/utils";

type CategoryTopFiveProps = {
  picks: CategoryPick[];
  cafes: Cafe[];
  category: CategoryPick["category"];
};

const rankIcons = [
  { icon: Trophy, color: "text-gold" },
  { icon: Medal, color: "text-copper" },
  { icon: Medal, color: "text-sage" },
];

export function CategoryTopFive({ picks, cafes, category }: CategoryTopFiveProps) {
  const { focusCafe } = useSite();
  const categoryPicks = picks
    .filter((p) => p.category === category)
    .sort((a, b) => a.rank - b.rank);

  const scoreKey = CATEGORY_SCORE_KEY[category];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="mb-6 font-display text-2xl text-espresso md:text-3xl">
          Top 5 — {CATEGORY_LABELS[category]}
        </h3>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5%" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-5"
        >
          {categoryPicks.map((pick, i) => {
            const cafe = findCafeByName(cafes, pick.cafe_name);
            const RankIcon = rankIcons[i]?.icon ?? Medal;
            const iconColor = rankIcons[i]?.color ?? "text-sage";
            const highlightScore = cafe ? cafe[scoreKey] : null;

            return (
              <motion.button
                key={`${pick.category}-${pick.rank}`}
                variants={fadeUp}
                onClick={() => cafe && focusCafe(cafe)}
                disabled={!cafe}
                className={cn(
                  "group rounded-2xl border border-cream-dark bg-cream p-5 text-left shadow-sm transition-all hover:border-copper/30 hover:shadow-lg",
                  !cafe && "opacity-60"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RankIcon className={cn("h-5 w-5", iconColor)} />
                    <span className="text-sm font-medium text-espresso/50">
                      #{pick.rank}
                    </span>
                  </div>
                  {highlightScore != null && typeof highlightScore === "number" && (
                    <span className="font-display text-2xl font-bold text-copper">
                      <CountUp value={highlightScore} />
                    </span>
                  )}
                </div>

                <h4 className="font-display text-xl font-semibold text-espresso group-hover:text-copper">
                  {pick.cafe_name}
                </h4>

                {cafe && (
                  <p className="mt-1 text-sm text-espresso/50">
                    {cafe.city} · Overall{" "}
                    <CountUp value={cafe.average} className="inline" />
                  </p>
                )}

                {!cafe && (
                  <p className="mt-1 text-sm text-espresso/40">
                    Not in full ratings yet
                  </p>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
