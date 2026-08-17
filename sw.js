// One cache for both precached and runtime-fetched entries. Using two caches
// would let the precached copy permanently shadow the revalidated one, since
// caches.match() searches caches in creation order.
const VERSION = "v10";
const CACHE = `site-${VERSION}`;

// App shell. Everything else (images, fonts) is cached at runtime on first use.
// jsrsasign is deliberately absent: tools.js fetches it on demand, and
// precaching 341 KB up front would hand back everything that buys.
const PRECACHE_URLS = [
  "index.html",
  "tools.html",
  "games.html",
  "404.html",
  "manifest.json",
  "assets/img/favicon.png",
  "assets/img/icon-512.png",
  "assets/img/icon-512-maskable.png",
  "assets/css/style.css",
  "assets/css/fonts.css",
  // The two faces every page paints with immediately. The other eight are
  // pulled in by unicode-range only if the text needs them, so they are left to
  // the runtime cache. Self-hosting is what makes this possible at all: the
  // fetch handler ignores cross-origin requests, so the old Google Fonts files
  // could never be cached here.
  "assets/fonts/raleway-normal-500-700-latin.woff2",
  "assets/fonts/opensans-normal-400-700-latin.woff2",
  "assets/js/boot.js",
  "assets/js/main.js",
  "assets/js/tools.js",
  "assets/js/games.js",
  "assets/js/peerjs.min.js",
  "assets/js/jwt-decode.min.js",
  "assets/js/crypto-js.min.js",
  "assets/js/js-yaml.min.js",
  "assets/vendor/bootstrap/css/bootstrap.min.css",
  "assets/vendor/boxicons/css/boxicons.min.css",
  "assets/vendor/aos/aos.css",
  "assets/vendor/jquery/jquery.min.js",
  "assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "assets/vendor/jquery.easing/jquery.easing.min.js",
  "assets/vendor/typed.js/typed.min.js",
  "assets/vendor/aos/aos.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Individual requests rather than addAll so one 404 can't fail the whole install.
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            cache
              .add(new Request(url, { cache: "reload" }))
              .catch((err) => console.warn(`SW: failed to precache ${url}`, err)),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE)
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Network-first: always try for fresh HTML, fall back to cache when offline.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === "navigate") {
      // "/" and "/index.html" are the same document to the server but different
      // keys in the cache, and only the latter was precached.
      const path = new URL(request.url).pathname;
      if (path === "/" || path.endsWith("/")) {
        const home = await cache.match("index.html");
        if (home) return home;
      }

      // Genuinely unknown URL. Handing back index.html with a 200 would claim a
      // page exists here; serve the real 404 body with a real 404 status.
      const notFound = await cache.match("404.html");
      if (notFound) {
        return new Response(await notFound.blob(), {
          status: 404,
          statusText: "Not Found",
          headers: notFound.headers,
        });
      }
      return cache.match("index.html");
    }

    // Not a navigation: this is a script or stylesheet we have no copy of.
    // Falling back to index.html here would hand HTML to a <script> tag, which
    // "loads" with a 200 and then fails as a parse error the loader cannot
    // catch -- the caller sees a missing global instead of a failed download.
    // A 504 lets script.onerror fire and the real message reach the user.
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

// Stale-while-revalidate: serve from cache immediately, refresh it in the
// background so the next load gets the new asset.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  const fetching = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    // With nothing cached and the network down, returning undefined here would
    // make respondWith() fail the request outright. Surface a real response.
    .catch(
      () => cached || new Response("", { status: 504, statusText: "Offline" }),
    );

  return cached || fetching;
}

// Scripts and stylesheets must stay in lockstep with the HTML that loads them.
// Serving a stale bundle alongside fresh markup breaks the page: the old script
// calls into libraries the new markup no longer includes, throws, and takes
// everything after it down with it. Images and fonts are safe to serve stale.
const CODE_ASSET = /\.(?:js|css)$/i;

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || CODE_ASSET.test(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
