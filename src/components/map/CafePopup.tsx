"use client";

import { motion } from "framer-motion";
import { ExternalLink, MapPin } from "lucide-react";
import type { Cafe } from "@/lib/types/cafe";
import { formatScore, getScoreTier } from "@/lib/types/cafe";
import { cn } from "@/lib/utils";

type CafePopupProps = {
  cafe: Cafe;
};

const SCORE_LABELS = [
  { key: "aesthetic_score" as const, label: "Aesthetic" },
  { key: "coffee_score" as const, label: "Coffee" },
  { key: "desserts_score" as const, label: "Desserts" },
  { key: "amenities_score" as const, label: "Service" },
];

const tierColors = {
  gold: "text-gold",
  warm: "text-copper",
  muted: "text-sage",
};

export function CafePopup({ cafe }: CafePopupProps) {
  const tier = getScoreTier(cafe.average);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-[min(90vw,320px)] bg-cream p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold leading-tight text-espresso">
            {cafe.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-espresso/60">
            <MapPin className="h-3.5 w-3.5" />
            {cafe.city}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-espresso font-display text-lg font-bold text-cream",
            tier === "gold" && "ring-2 ring-gold ring-offset-2"
          )}
        >
          <span className={tierColors[tier]}>{formatScore(cafe.average)}</span>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {SCORE_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-16 text-xs text-espresso/60">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-dark">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(cafe[key] / 10) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-copper"
              />
            </div>
            <span className="w-8 text-right text-xs font-medium">
              {formatScore(cafe[key])}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-3 flex gap-4 text-xs text-espresso/60">
        <span>{cafe.times_visited} visits</span>
        {cafe.price_min != null && cafe.price_max != null && (
          <span>
            SAR {cafe.price_min}–{cafe.price_max}
          </span>
        )}
      </div>

      {cafe.notes && (
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-espresso/75">
          {cafe.notes}
        </p>
      )}

      {cafe.google_maps_url && (
        <a
          href={cafe.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-espresso/90"
        >
          Open in Google Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </motion.div>
  );
}
