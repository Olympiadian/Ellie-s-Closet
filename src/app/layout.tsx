import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
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
  applicationName: "The Wall",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
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
    statusBarStyle: "black-translucent",
    title: "The Wall",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b2969",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${hurricane.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
