import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defaultState, metrics } from "./src/model";

/**
 * Fills %PLAN_DAYS% and %PLAN_COST% in index.html from the plan itself, so the
 * description and the no-JavaScript summary never drift from what the page
 * shows. The words of that summary describe MY_PLAN; a test pins it.
 */
function planFacts(): Plugin {
  return {
    name: "plan-facts",
    transformIndexHtml(html) {
      const m = metrics(defaultState());
      const cost = (Math.round(m.cost / 1000) * 1000).toLocaleString("en-IN");
      return html.replaceAll("%PLAN_DAYS%", String(m.days)).replaceAll("%PLAN_COST%", cost);
    },
  };
}

// Builds into ../trip so GitHub Pages serves it at /trip/ straight from the
// branch. Everything, the service worker included, is scoped to /trip/: the
// rest of the site never loads or caches any of it.
export default defineConfig({
  base: "/trip/",
  plugins: [
    react(),
    planFacts(),
    VitePWA({
      registerType: "autoUpdate",
      // Registered from main.tsx so a new build takes over and reloads the page
      // as soon as it is downloaded, instead of waiting for a second visit.
      injectRegister: null,
      scope: "/trip/",
      base: "/trip/",
      includeAssets: ["fonts/*.woff2", "icons/*.png"],
      manifest: {
        name: "ABC Trek Planner",
        short_name: "ABC Trek",
        description: "Plan an Annapurna Base Camp trek and carry it offline.",
        start_url: "/trip/",
        scope: "/trip/",
        display: "standalone",
        background_color: "#f6f7f9",
        theme_color: "#0f1720",
        icons: [
          { src: "icons/favicon.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The app shell plus the small hero. Place photos and the large hero
        // are cached on first view (or all at once via "Save for offline").
        globPatterns: ["**/*.{js,css,html,woff2}", "img/abc-dusk-1200.webp", "icons/*.png"],
        navigateFallback: "/trip/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Photo filenames carry no content hash, so CacheFirst would pin
            // a replaced photo forever. Serve the cached copy (works offline)
            // and refresh it in the background.
            urlPattern: ({ url }) => url.pathname.startsWith("/trip/img/"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "trip-img", expiration: { maxEntries: 80 } },
          },
          {
            urlPattern: ({ url }) => /(^|\.)tile\.opentopomap\.org$/.test(url.hostname),
            handler: "CacheFirst",
            options: {
              cacheName: "trip-tiles",
              expiration: { maxEntries: 1500 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "../trip",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      output: {
        // Libraries change far less often than the plan's data and code, so
        // keep them in their own file: an update to a price or a story then
        // leaves the cached library chunk alone.
        manualChunks: (id) => (/node_modules\/(react|react-dom|scheduler|motion|motion-dom|motion-utils|framer-motion|@radix-ui)\//.test(id) ? "vendor" : undefined),
      },
    },
  },
});
