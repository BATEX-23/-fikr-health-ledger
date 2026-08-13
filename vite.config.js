import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Fikr Health International — Sales & Accounts Ledger",
        short_name: "Fikr Ledger",
        description: "Record daily sales, track inventory and expenses, and view reports.",
        theme_color: "#0F4C43",
        background_color: "#F3F6F3",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg}"],
        // Without this, the SPA fallback silently serves index.html for
        // ANY navigation that isn't the exact app shell — including
        // /recover.html — making that page unreachable once installed.
        navigateFallbackDenylist: [/^\/recover\.html$/],
      },
    }),
  ],
});
