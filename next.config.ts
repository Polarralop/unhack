import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The prototype renders entirely in the browser (demo data in localStorage),
  // so server caching features (cacheComponents, partialPrefetching) are off.
  // Revisit once there is a real backend.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
