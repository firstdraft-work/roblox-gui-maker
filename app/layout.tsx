import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
