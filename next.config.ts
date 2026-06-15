import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["react-map-gl", "maplibre-gl"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
