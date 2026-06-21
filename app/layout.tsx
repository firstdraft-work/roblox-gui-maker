import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "./components/Analytics";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

// Google Analytics 4. Measurement IDs are public (visible in every visitor's
// page source), so hardcoding is fine; override with NEXT_PUBLIC_GA_ID if needed.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-BWJ7NSR55P";

export const metadata: Metadata = {
  metadataBase: new URL("https://robloxguimaker.app"),
  title: "Roblox GUI Maker — Drag, Drop, Export Clean Luau",
  description:
    "Build Roblox game GUIs visually. Drag and drop ScreenGui, Frame, TextButton and more, then export clean Luau you can paste straight into Roblox Studio. Free, no login.",
  openGraph: {
    title: "Roblox GUI Maker — Build Roblox UIs Visually, Export Clean Luau",
    description:
      "Free Roblox GUI maker. Drag and drop, tweak real Roblox properties, export clean Luau. No login.",
    url: "https://robloxguimaker.app",
    siteName: "Roblox GUI Maker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox GUI Maker — Build Roblox UIs Visually, Export Clean Luau",
    description:
      "Free Roblox GUI maker. Drag and drop, tweak real Roblox properties, export clean Luau. No login.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
            <Analytics />
          </>
        )}
      </body>
    </html>
  );
}
