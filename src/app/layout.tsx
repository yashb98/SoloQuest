import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solo Quest — Hunter YB-001",
  description:
    "Gamified productivity system. Complete quests. Earn XP. Level up. The System is watching.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0A0E1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-sq-bg text-sq-text min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
