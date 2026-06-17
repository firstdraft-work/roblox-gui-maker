import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent directory also contains a lockfile, which would make Turbopack
  // infer the wrong workspace root. Pin it to this project.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
