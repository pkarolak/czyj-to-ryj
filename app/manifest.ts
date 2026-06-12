import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Czyj to ryj?",
    short_name: "Czyj to ryj",
    description:
      "Teleturniej społecznościowo-satyryczny — edycja jubileuszowa 35 lat chóru Dysonans.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#f5c542",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
