import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['hrms.infraplan.co.in'],
    },
  },
};

export default nextConfig;