import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solo Quest — Full Gamification v2.0",
  description:
    "Gamified personal productivity and learning management system.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-sq-bg text-sq-text min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
