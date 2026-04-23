import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  allowedDevOrigins: ['hrms.infraplan.co.in', '192.168.1.49'],
};

export default nextConfig;