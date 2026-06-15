"use client";

import { motion } from "framer-motion";
import type { Cafe } from "@/lib/types/cafe";
import { formatScore, getScoreTier } from "@/lib/types/cafe";
import { pinSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScoreMarkerProps = {
  cafe: Cafe;
  index: number;
  selected: boolean;
  onClick: () => void;
};

const tierStyles = {
  gold: "bg-gold text-espresso ring-gold/50",
  warm: "bg-copper text-cream ring-copper/50",
  muted: "bg-sage text-cream ring-sage/50",
};

export function ScoreMarker({ cafe, index, selected, onClick }: ScoreMarkerProps) {
  const tier = getScoreTier(cafe.average);

  return (
    <motion.button
      custom={index}
      variants={pinSpring}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xs font-bold shadow-lg ring-2 transition-shadow md:h-11 md:w-11 md:text-sm",
        tierStyles[tier],
        selected && "z-10 scale-125 ring-4 ring-offset-2 ring-offset-transparent animate-pulse"
      )}
      aria-label={`${cafe.name}: ${formatScore(cafe.average)}`}
    >
      {formatScore(cafe.average)}
    </motion.button>
  );
}
