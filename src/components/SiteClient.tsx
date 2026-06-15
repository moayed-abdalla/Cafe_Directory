"use client";

import type { Cafe, CategoryPick, YetToTry } from "@/lib/types/cafe";
import { SiteProvider } from "@/components/providers/SiteProvider";
import { CafeMap } from "@/components/map/CafeMap";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { FullDataSection } from "@/components/full-data/FullDataPanel";

type SiteClientProps = {
  cafes: Cafe[];
  categoryPicks: CategoryPick[];
  yetToTry: YetToTry[];
};

export function SiteClient({ cafes, categoryPicks, yetToTry }: SiteClientProps) {
  return (
    <SiteProvider>
      <main>
        <CafeMap cafes={cafes} />
        <Leaderboard cafes={cafes} categoryPicks={categoryPicks} />
        <FullDataSection cafes={cafes} yetToTry={yetToTry} />
      </main>
    </SiteProvider>
  );
}
