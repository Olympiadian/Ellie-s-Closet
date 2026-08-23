import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Wall — Private Closet",
    short_name: "The Wall",
    description: "A private visual wardrobe and outfit composition tool.",
    start_url: "/wall",
    display: "standalone",
    background_color: "#5b2969",
    theme_color: "#5b2969",
    orientation: "any",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
