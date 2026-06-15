"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Cafe, CategoryKey } from "@/lib/types/cafe";

type SiteContextValue = {
  selectedCafe: Cafe | null;
  setSelectedCafe: (cafe: Cafe | null) => void;
  focusCafe: (cafe: Cafe) => void;
  leaderboardMode: "overall" | CategoryKey;
  setLeaderboardMode: (mode: "overall" | CategoryKey) => void;
  fullDataOpen: boolean;
  setFullDataOpen: (open: boolean) => void;
};

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [leaderboardMode, setLeaderboardMode] = useState<"overall" | CategoryKey>("overall");
  const [fullDataOpen, setFullDataOpen] = useState(false);

  const focusCafe = useCallback((cafe: Cafe) => {
    setSelectedCafe(cafe);
    const mapSection = document.getElementById("map-section");
    mapSection?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <SiteContext.Provider
      value={{
        selectedCafe,
        setSelectedCafe,
        focusCafe,
        leaderboardMode,
        setLeaderboardMode,
        fullDataOpen,
        setFullDataOpen,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
