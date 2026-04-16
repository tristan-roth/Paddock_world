import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack est utilisé par défaut maintenant, plus besoin de watchOptions webpack
  output: "standalone",
};

export default nextConfig;
