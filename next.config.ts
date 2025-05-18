import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true, // ⛔ abaikan type error saat build
  },

  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },

};

export default nextConfig;
