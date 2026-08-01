// One cache for both precached and runtime-fetched entries. Using two caches
// would let the precached copy permanently shadow the revalidated one, since
// caches.match() searches caches in creation order.
const VERSION = "v6";
const CACHE = `site-${VERSION}`;

// App shell. Everything else (images, fonts) is cached at runtime on first use.
const PRECACHE_URLS = [
  "index.html",
  "tools.html",
  "games.html",
  "manifest.json",
  "assets/img/favicon.png",
  "assets/img/icon-512.png",
  "assets/img/icon-512-maskable.png",
  "assets/css/style.css",
  "assets/js/main.js",
  "assets/js/tools.js",
  "assets/js/games.js",
  "assets/js/peerjs.min.js",
  "assets/js/jwt-decode.min.js",
  "assets/js/diff.min.js",
  "assets/js/crypto-js.min.js",
  "assets/js/jsrsasign-all-min.js",
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
    return cached || cache.match("index.html");
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
