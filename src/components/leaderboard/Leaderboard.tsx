"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cafe, CategoryPick } from "@/lib/types/cafe";
import { useSite } from "@/components/providers/SiteProvider";
import { CategoryRail } from "./CategoryRail";
import { CategoryTopFive } from "./CategoryTopFive";
import { OverallRanking } from "./OverallRanking";

gsap.registerPlugin(ScrollTrigger);

type LeaderboardProps = {
  cafes: Cafe[];
  categoryPicks: CategoryPick[];
};

export function Leaderboard({ cafes, categoryPicks }: LeaderboardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { leaderboardMode } = useSite();

  return (
    <section
      ref={sectionRef}
      id="leaderboard-section"
      className="min-h-[100dvh] bg-cream px-4 py-16 md:px-8 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-14"
        >
          <h2 className="font-display text-4xl font-semibold text-espresso md:text-5xl lg:text-6xl">
            Leaderboard
          </h2>
          <p className="mt-3 max-w-xl text-espresso/60 md:text-lg">
            Ranked by your visits and scores. Switch categories to see your
            hand-picked top five.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <CategoryRail />

          <div className="min-w-0 flex-1">
            {leaderboardMode === "overall" ? (
              <OverallRanking cafes={cafes} />
            ) : (
              <CategoryTopFive
                picks={categoryPicks}
                cafes={cafes}
                category={leaderboardMode}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
