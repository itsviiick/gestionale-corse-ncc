import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gestione Corse NCC",
    short_name: "Corse NCC",
    description: "Calendario e promemoria per le corse di un servizio NCC",
    start_url: "/",
    display: "standalone",
    background_color: "#e4e9f0",
    theme_color: "#0f172a",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
