"use client";

import { motion } from "framer-motion";
import { CountUp } from "@/components/ui/CountUp";
import { useSite } from "@/components/providers/SiteProvider";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { Cafe } from "@/lib/types/cafe";
import { formatScore, getScoreTier } from "@/lib/types/cafe";
import { cn } from "@/lib/utils";

type OverallRankingProps = {
  cafes: Cafe[];
};

export function OverallRanking({ cafes }: OverallRankingProps) {
  const { focusCafe } = useSite();

  const sorted = [...cafes].sort((a, b) => {
    if (a.city !== b.city) {
      if (a.city === "Jeddah") return -1;
      if (b.city === "Jeddah") return 1;
      return a.city.localeCompare(b.city);
    }
    return b.average - a.average;
  });

  let lastCity = "";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-5%" }}
      className="space-y-1"
    >
      {sorted.map((cafe) => {
        const showCityHeader = cafe.city !== lastCity;
        lastCity = cafe.city;
        const tier = getScoreTier(cafe.average);
        const rank = sorted.filter((c) => c.city === cafe.city).indexOf(cafe) + 1;

        return (
          <div key={cafe.id}>
            {showCityHeader && (
              <motion.h3
                variants={fadeUp}
                className="mb-3 mt-6 font-display text-xl text-espresso/60 first:mt-0 md:text-2xl"
              >
                {cafe.city}
              </motion.h3>
            )}
            <motion.button
              variants={fadeUp}
              onClick={() => focusCafe(cafe)}
              className="group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-colors hover:bg-cream-dark/80 md:gap-6 md:px-4"
            >
              <span
                className={cn(
                  "w-8 shrink-0 font-display text-lg font-light md:text-2xl",
                  rank <= 3 ? "text-copper" : "text-espresso/30"
                )}
              >
                {String(rank).padStart(2, "0")}
              </span>

              <span className="min-w-0 flex-1 truncate font-medium text-espresso group-hover:text-copper md:text-lg">
                {cafe.name}
              </span>

              <span
                className={cn(
                  "shrink-0 font-display text-lg font-bold md:text-xl",
                  tier === "gold" && "text-gold",
                  tier === "warm" && "text-copper",
                  tier === "muted" && "text-sage"
                )}
              >
                <CountUp value={cafe.average} />
              </span>
            </motion.button>
          </div>
        );
      })}
    </motion.div>
  );
}
