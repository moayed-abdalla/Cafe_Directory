import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["react-map-gl", "maplibre-gl"],
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/": ["./data/**/*"],
    "/admin": ["./data/**/*"],
  },
};

export default nextConfig;
