import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ellie's Closet",
    short_name: "Ellie's Closet",
    description: "A private visual wardrobe and outfit composition tool.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#e9e6da",
    theme_color: "#e9e6da",
    orientation: "any",
    icons: [
      {
        src: "/icons/ellie-closet-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ellie-closet-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ellie-closet-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
