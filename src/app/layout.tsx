import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { MobileRouteGuard } from "@/components/mobile/mobile-route-guard";
import { RouteLoadingScreen } from "@/components/route-loading-screen";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const hurricane = localFont({
  display: "swap",
  src: "./fonts/hurricane-regular.ttf",
  variable: "--font-hurricane",
  weight: "400",
});

const geistMono = localFont({
  display: "swap",
  src: [
    {
      path: "./fonts/geist-mono-regular.ttf",
      style: "normal",
      weight: "400",
    },
    {
      path: "./fonts/geist-mono-medium.ttf",
      style: "normal",
      weight: "500",
    },
  ],
  variable: "--font-geist-mono",
});

const funnelDisplay = localFont({
  display: "swap",
  src: "./fonts/funnel-display-variable.ttf",
  variable: "--font-funnel-display",
  weight: "300 800",
});

const instrumentSerif = localFont({
  display: "swap",
  src: "./fonts/instrument-serif-regular.ttf",
  variable: "--font-instrument-serif",
  weight: "400",
});

const manrope = localFont({
  display: "swap",
  src: "./fonts/manrope-variable.ttf",
  variable: "--font-manrope",
  weight: "200 800",
});

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl =
    process.env.VERCEL && (!configuredUrl || configuredUrl.includes("localhost"))
      ? "https://www.elliecloset.com"
      : configuredUrl || "http://localhost:3000";

  try {
    return new URL(siteUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "The Wall",
    template: "%s · The Wall",
  },
  description: "A private visual wardrobe and outfit composition tool.",
  applicationName: "Ellie's Closet",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/ellie-closet-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/ellie-closet-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "The Wall",
    description: "A private visual wardrobe and outfit composition tool.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wall",
    description: "A private visual wardrobe and outfit composition tool.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ellie's Closet",
  },
};

export const viewport: Viewport = {
  themeColor: "#e9e6da",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${hurricane.variable} ${geistMono.variable} ${funnelDisplay.variable} ${instrumentSerif.variable} ${manrope.variable}`}
    >
      <body>
        <MobileRouteGuard />
        <RouteLoadingScreen />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
