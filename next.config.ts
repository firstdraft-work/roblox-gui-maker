import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// CSP: GA's gtag loads from googletagmanager and beacons to google-analytics;
// the inline config + Next bootstrap need 'unsafe-inline'; dev (HMR/eval) gets
// 'unsafe-eval', which is dropped in production.
const csp = [
  "default-src 'self'",
  isProd
    ? "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // The parent directory also contains a lockfile, which would make Turbopack
  // infer the wrong workspace root. Pin it to this project.
  turbopack: { root: process.cwd() },
  // Canonical: apex (robloxguimaker.app) is primary; www 308 -> apex.
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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
