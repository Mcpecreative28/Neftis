import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./neftis-modern.css";
import "./neftis-atlas.css";
import "./product-console.css";
import "./neftis-editorial.css";
import NeftisMotion from "@/components/motion/neftis-motion";

export const metadata: Metadata = {
  title: "Neftis — Digital Commons",
  description: "An open digital ecosystem for AI, tools, community, and knowledge.",
  applicationName: "Neftis",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101116",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body><NeftisMotion>{children}</NeftisMotion></body></html>;
}
