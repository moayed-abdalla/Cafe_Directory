"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, type MapRef, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapPin, X } from "lucide-react";
import { JEDDAH, MAP_STYLE } from "@/lib/map/constants";
import { MapZoomControls } from "@/components/map/MapZoomControls";

type LocationPickerMapProps = {
  latitude: number | null;
  longitude: number | null;
  onConfirm: (latitude: number, longitude: number) => void;
  onClose: () => void;
};

type Coords = { latitude: number; longitude: number };

export function LocationPickerMap({
  latitude,
  longitude,
  onConfirm,
  onClose,
}: LocationPickerMapProps) {
  const mapRef = useRef<MapRef>(null);
  const hasInitial =
    latitude != null && longitude != null && !Number.isNaN(latitude) && !Number.isNaN(longitude);

  const [pin, setPin] = useState<Coords | null>(
    hasInitial ? { latitude, longitude } : null
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleMapClick = (e: MapLayerMouseEvent) => {
    setPin({
      latitude: e.lngLat.lat,
      longitude: e.lngLat.lng,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select location on map"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-cream shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream-dark px-4 py-3">
          <div>
            <h2 className="text-sm font-medium text-espresso">Select location</h2>
            <p className="text-xs text-espresso/60">
              Click the map to place a pin, then drag to fine-tune.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-espresso/70 hover:bg-cream-dark hover:text-espresso"
            aria-label="Close map picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[min(70vh,520px)] w-full">
          <Map
            ref={mapRef}
            initialViewState={{
              latitude: hasInitial ? latitude : JEDDAH.latitude,
              longitude: hasInitial ? longitude : JEDDAH.longitude,
              zoom: hasInitial ? 15 : 11.5,
              pitch: 0,
              bearing: 0,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLE}
            attributionControl={false}
            scrollZoom
            doubleClickZoom
            cursor="crosshair"
            onClick={handleMapClick}
          >
            {pin && (
              <Marker
                latitude={pin.latitude}
                longitude={pin.longitude}
                anchor="bottom"
                draggable
                onDragEnd={(e) => {
                  setPin({
                    latitude: e.lngLat.lat,
                    longitude: e.lngLat.lng,
                  });
                }}
              >
                <MapPin className="h-8 w-8 fill-copper text-espresso drop-shadow-md" />
              </Marker>
            )}
          </Map>
          <MapZoomControls mapRef={mapRef} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-dark px-4 py-3">
          <p className="font-mono text-xs tabular-nums text-espresso/70">
            {pin
              ? `${pin.latitude.toFixed(6)}, ${pin.longitude.toFixed(6)}`
              : "No pin placed yet"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-cream-dark px-3 py-2 text-sm text-espresso hover:bg-cream-dark/40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!pin}
              onClick={() => {
                if (!pin) return;
                onConfirm(pin.latitude, pin.longitude);
              }}
              className="rounded-lg bg-espresso px-3 py-2 text-sm font-medium text-cream disabled:opacity-50"
            >
              Use location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
