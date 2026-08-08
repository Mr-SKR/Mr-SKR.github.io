/**
 * boot.js - runs first, depends on nothing.
 *
 * Loaded synchronously from <head> so it executes before the body paints. It
 * exists because two things on this site are hidden by default and only become
 * visible when JavaScript says so: AOS sets `opacity: 0` on every [data-aos]
 * element, and #preloader is an opaque full-screen panel. If the scripts that
 * clear them never run, the page is blank rather than degraded.
 *
 * Deliberately plain DOM, no jQuery. The failure this guards against includes
 * "jQuery did not load", and main.js cannot help there because it is wrapped in
 * an IIFE that takes jQuery as an argument and throws immediately without it.
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  // <html class="no-js"> is in the markup and the stylesheet uses it to force
  // everything visible. Removing it here, before paint, hands control back to
  // AOS without the content flashing in and then being hidden again. If
  // scripting is off this line never runs and the class does its job.
  root.className = root.className.replace(/(^|\s)no-js(\s|$)/, "$1$2").trim();

  function revealAll(reason) {
    var hidden = doc.querySelectorAll("[data-aos]");
    if (hidden.length) {
      console.warn(
        "boot: " + reason + "; revealing " + hidden.length +
          " elements without animation."
      );
      for (var i = 0; i < hidden.length; i++) {
        hidden[i].removeAttribute("data-aos");
        hidden[i].removeAttribute("data-aos-delay");
      }
    }
    var preloader = doc.getElementById("preloader");
    if (preloader && preloader.parentNode) {
      preloader.parentNode.removeChild(preloader);
    }
  }

  // If AOS had initialised it would have stamped .aos-init on these by now, and
  // main.js would have faded the preloader out. Either one still being here
  // means something upstream broke, so show the content rather than a blank page.
  setTimeout(function () {
    var stalled =
      doc.querySelector("[data-aos]:not(.aos-init)") || doc.getElementById("preloader");
    if (stalled) revealAll("page did not finish initialising");
  }, 5000);
})();
