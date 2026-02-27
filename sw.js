const CACHE_NAME = "tools-cache-v2";
const ASSETS_TO_CACHE = [
  "tools.html",
  "assets/css/style.css",
  "assets/js/main.js",
  "assets/js/tools.js",
  "assets/img/favicon.png",
  "assets/img/apple-touch-icon.png",
  "assets/vendor/bootstrap/css/bootstrap.min.css",
  "assets/vendor/icofont/icofont.min.css",
  "assets/vendor/boxicons/css/boxicons.min.css",
  "assets/vendor/venobox/venobox.css",
  "assets/vendor/owl.carousel/assets/owl.carousel.min.css",
  "assets/vendor/aos/aos.css",
  "assets/vendor/jquery/jquery.min.js",
  "assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
  "assets/vendor/jquery.easing/jquery.easing.min.js",
  "assets/vendor/php-email-form/validate.js",
  "assets/vendor/waypoints/jquery.waypoints.min.js",
  "assets/vendor/counterup/counterup.min.js",
  "assets/vendor/isotope-layout/isotope.pkgd.min.js",
  "assets/vendor/venobox/venobox.min.js",
  "assets/vendor/owl.carousel/owl.carousel.min.js",
  "assets/vendor/typed.js/typed.min.js",
  "assets/vendor/aos/aos.js",
  "assets/js/jwt-decode.min.js",
  "assets/js/diff.min.js",
  "assets/js/crypto-js.min.js",
  "assets/js/jsrsasign-all-min.js",
  "assets/js/js-yaml.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
  );
});
