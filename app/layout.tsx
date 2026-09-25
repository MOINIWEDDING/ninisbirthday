import type { Metadata, Viewport } from "next";
import { body, condensed, script, serif } from "./fonts";
import { EVENT } from "@/lib/event";
import "./globals.css";

function resolveSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000").trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `${raw.includes("localhost") ? "http" : "https"}://${raw}`;
  try {
    return new URL(withProtocol);
  } catch {
    return new URL("http://localhost:3000");
  }
}

const siteUrl = resolveSiteUrl();

const description = `${EVENT.dateLabel}, ${EVENT.timeLabel} en ${EVENT.venue.name}. Confirma tu asistencia.`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: `${EVENT.title} · ${EVENT.age}`,
  description,
  openGraph: {
    title: `${EVENT.title} · ${EVENT.age}`,
    description,
    type: "website",
    locale: "es_DO",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `Invitación a ${EVENT.title}` }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  // Invitación privada: que no aparezca en buscadores
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6a3bb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${body.variable} ${condensed.variable} ${script.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
