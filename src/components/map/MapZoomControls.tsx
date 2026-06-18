"use client";

import type { RefObject } from "react";
import { Minus, Plus } from "lucide-react";
import type { MapRef } from "react-map-gl/maplibre";

type MapZoomControlsProps = {
  mapRef: RefObject<MapRef | null>;
};

export function MapZoomControls({ mapRef }: MapZoomControlsProps) {
  const zoomIn = () => {
    mapRef.current?.getMap().zoomIn();
  };

  const zoomOut = () => {
    mapRef.current?.getMap().zoomOut();
  };

  return (
    <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-cream shadow-[0_4px_20px_rgba(44,24,16,0.15)]">
      <button
        type="button"
        onClick={zoomIn}
        aria-label="Zoom in"
        className="flex h-10 w-10 items-center justify-center text-espresso transition-colors hover:bg-copper hover:text-cream"
      >
        <Plus className="h-5 w-5" />
      </button>
      <div className="h-px bg-cream-dark" />
      <button
        type="button"
        onClick={zoomOut}
        aria-label="Zoom out"
        className="flex h-10 w-10 items-center justify-center text-espresso transition-colors hover:bg-copper hover:text-cream"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  );
}
