import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
    ignoreBuildErrors: true, // ⛔ abaikan type error saat build
  },

};

export default nextConfig;
