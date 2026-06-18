/**
 * Basemap colors aligned with site tokens in globals.css.
 * Used as the source of truth when editing public/map/cafe-basemap.json.
 */
export const mapPalette = {
  background: "#f5f0e8",
  creamDark: "#e8dfd3",
  park: "#dde5d6",
  water: "#c8d4c4",
  waterway: "#b8c4b0",
  residential: "#ebe4da",
  buildingFill: "#e8dfd3",
  buildingOutline: "#d4a574",
  roadMinor: "#ede8df",
  roadMajor: "#faf6f0",
  roadCasing: "#d4a574",
  motorwayFill: "#f5f0e8",
  motorwayCasing: "#b87333",
  railway: "#e8dfd3",
  railwayDash: "#f5f0e8",
  boundary: "rgba(212, 165, 116, 0.4)",
  label: "rgba(44, 24, 16, 0.65)",
  labelStrong: "rgba(44, 24, 16, 0.85)",
  labelHalo: "#f5f0e8",
  waterLabel: "#8a9a7b",
  aeroway: "#ebe4da",
} as const;
