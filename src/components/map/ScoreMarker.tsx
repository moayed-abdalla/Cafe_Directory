"use client";

import { motion } from "framer-motion";
import type { Cafe } from "@/lib/types/cafe";
import { formatScore, getScorePinColors } from "@/lib/types/cafe";
import { pinSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ScoreMarkerProps = {
  cafe: Cafe;
  index: number;
  selected: boolean;
  onClick: () => void;
};

export function ScoreMarker({ cafe, index, selected, onClick }: ScoreMarkerProps) {
  const { backgroundColor, color, ringColor } = getScorePinColors(cafe.average);
  const ringWidth = selected ? 4 : 2;
  const boxShadow = selected
    ? `0 0 0 ${ringWidth}px ${ringColor}, 0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)`
    : `0 0 0 ${ringWidth}px ${ringColor}, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`;

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
        "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xs font-bold transition-shadow md:h-11 md:w-11 md:text-sm",
        selected && "z-10 scale-125 animate-pulse"
      )}
      style={{ backgroundColor, color, boxShadow }}
      aria-label={`${cafe.name}: ${formatScore(cafe.average)}`}
    >
      {formatScore(cafe.average)}
    </motion.button>
  );
}
