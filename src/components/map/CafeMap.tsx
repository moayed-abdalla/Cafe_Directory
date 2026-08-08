"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Cafe } from "@/lib/types/cafe";
import { JEDDAH, MAP_STYLE } from "@/lib/map/constants";
import { useSite } from "@/components/providers/SiteProvider";
import { ScoreMarker } from "./ScoreMarker";
import { CafePopup } from "./CafePopup";
import { MapZoomControls } from "./MapZoomControls";

gsap.registerPlugin(ScrollTrigger);

type CafeMapProps = {
  cafes: Cafe[];
};

export function CafeMap({ cafes }: CafeMapProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);
  const { selectedCafe, setSelectedCafe } = useSite();
  const [popupCafe, setPopupCafe] = useState<Cafe | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mappableCafes = useMemo(
    () =>
      cafes
        .filter((c) => c.latitude != null && c.longitude != null)
        .sort((a, b) => a.average - b.average || a.name.localeCompare(b.name)),
    [cafes]
  );

  useEffect(() => {
    if (selectedCafe?.latitude && selectedCafe?.longitude) {
      setPopupCafe(selectedCafe);
      mapRef.current?.flyTo({
        center: [selectedCafe.longitude, selectedCafe.latitude],
        zoom: 14,
        duration: 1200,
      });
    }
  }, [selectedCafe]);

  useEffect(() => {
    const section = sectionRef.current;
    const mapWrap = mapWrapRef.current;
    if (!section || !mapWrap) return;

    const ctx = gsap.context(() => {
      gsap.to(mapWrap, {
        scale: 0.92,
        borderRadius: "24px",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const handleMarkerClick = (cafe: Cafe) => {
    setPopupCafe(cafe);
    setSelectedCafe(cafe);
  };

  return (
    <section
      id="map-section"
      ref={sectionRef}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      <div ref={mapWrapRef} className="h-full w-full origin-center">
        <Map
          ref={mapRef}
          initialViewState={{
            ...JEDDAH,
            zoom: 11.5,
            pitch: 0,
            bearing: 0,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={MAP_STYLE}
          attributionControl={false}
          scrollZoom={false}
          doubleClickZoom={false}
          onLoad={() => setMapReady(true)}
        >
          {mappableCafes.map((cafe, i) => (
            <Marker
              key={cafe.id}
              longitude={cafe.longitude!}
              latitude={cafe.latitude!}
              anchor="center"
            >
              <ScoreMarker
                cafe={cafe}
                index={i}
                selected={popupCafe?.id === cafe.id}
                mapReady={mapReady}
                onClick={() => handleMarkerClick(cafe)}
              />
            </Marker>
          ))}

          {popupCafe && popupCafe.latitude && popupCafe.longitude && (
            <Popup
              longitude={popupCafe.longitude}
              latitude={popupCafe.latitude}
              anchor="bottom"
              offset={[0, -20] as [number, number]}
              closeOnClick={false}
              onClose={() => {
                setPopupCafe(null);
                setSelectedCafe(null);
              }}
              className="cafe-popup"
            >
              <CafePopup cafe={popupCafe} />
            </Popup>
          )}
        </Map>
      </div>

      <MapZoomControls mapRef={mapRef} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/40 to-transparent pb-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex flex-col items-center gap-2 text-cream"
        >
          <p className="font-display text-sm tracking-widest uppercase opacity-90">
            Moayed&apos;s Cafe Directory
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-xs opacity-75">Scroll for rankings</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
