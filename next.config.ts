import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent directory also contains a lockfile, which would make Turbopack
  // infer the wrong workspace root. Pin it to this project.
  turbopack: { root: process.cwd() },
  // Canonical: apex (robloxguimaker.app) is primary; www 308 → apex.
  async redirects() {
    return [
      {
        source: "/:path*",
        destination: "https://robloxguimaker.app/:path*",
        permanent: true,
        has: [{ type: "host", value: "www.robloxguimaker.app" }],
      },
    ];
  },
};

export default nextConfig;
