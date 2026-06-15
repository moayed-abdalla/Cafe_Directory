"use client";

import { motion } from "framer-motion";
import {
  CATEGORY_LABELS,
  type CategoryKey,
} from "@/lib/types/cafe";
import { cn } from "@/lib/utils";
import { useSite } from "@/components/providers/SiteProvider";

const CATEGORIES: CategoryKey[] = [
  "overall",
  "coffee",
  "desserts",
  "social",
  "work",
  "value",
];

export function CategoryRail() {
  const { leaderboardMode, setLeaderboardMode } = useSite();

  return (
    <>
      {/* Desktop vertical rail */}
      <nav className="hidden shrink-0 flex-col gap-2 lg:flex">
        <button
          onClick={() => setLeaderboardMode("overall")}
          className={cn(
            "rounded-2xl px-5 py-3 text-left text-sm font-medium transition-all duration-300",
            leaderboardMode === "overall"
              ? "scale-105 bg-copper text-cream shadow-lg shadow-copper/30"
              : "bg-cream-dark/60 text-espresso/70 hover:bg-cream-dark hover:text-espresso"
          )}
        >
          All Rankings
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setLeaderboardMode(cat)}
            className={cn(
              "rounded-2xl px-5 py-3 text-left text-sm font-medium transition-all duration-300",
              leaderboardMode === cat
                ? "scale-105 bg-copper text-cream shadow-lg shadow-copper/30"
                : "bg-cream-dark/60 text-espresso/70 hover:bg-cream-dark hover:text-espresso"
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </nav>

      {/* Mobile horizontal chips */}
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:hidden scrollbar-none">
        <Chip
          label="All"
          active={leaderboardMode === "overall"}
          onClick={() => setLeaderboardMode("overall")}
        />
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={CATEGORY_LABELS[cat]}
            active={leaderboardMode === cat}
            onClick={() => setLeaderboardMode(cat)}
          />
        ))}
      </nav>
    </>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-copper text-cream shadow-md"
          : "bg-cream-dark text-espresso/70"
      )}
    >
      {label}
    </motion.button>
  );
}
