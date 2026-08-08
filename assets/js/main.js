!(function ($) {
  "use strict";

  // Someone who has asked their OS to reduce motion should not be given a
  // 1.5-second easing scroll or text that types itself out on a loop. CSS
  // handles the transitions and animations; these are the parts only JS can
  // switch off. Read once rather than watched, since none of the effects below
  // are re-created after load.
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Jumping straight to the target is the reduced-motion equivalent of the
  // eased scroll below, not a degraded version of it.
  var scrollDuration = prefersReducedMotion ? 0 : 1500;
  var scrollEasing = prefersReducedMotion ? "swing" : "easeInOutExpo";

  // Preloader
  $(window).on("load", function () {
    if ($("#preloader").length) {
      $("#preloader")
        .delay(100)
        .fadeOut("slow", function () {
          $(this).remove();
        });
    }
  });

  // Hero typed
  if ($(".typed").length) {
    var typed_strings = $(".typed").data("typed-items");
    typed_strings = typed_strings.split(",");
    if (prefersReducedMotion) {
      // The looping cursor is the problem, not the words. Show the first
      // string outright so the hero still reads as a sentence.
      $(".typed").text(typed_strings[0].trim());
    } else {
      new Typed(".typed", {
        strings: typed_strings,
        loop: true,
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 2000,
      });
    }
  }

  // Smooth scroll for the navigation menu and links with .scrollto classes
  $(document).on("click", ".nav-menu a, .scrollto", function (e) {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      var target = $(this.hash);
      if (target.length) {
        e.preventDefault();

        var scrollto = target.offset().top;

        $("html, body").animate(
          {
            scrollTop: scrollto,
          },
          scrollDuration,
          scrollEasing
        );

        if ($(this).parents(".nav-menu, .mobile-nav").length) {
          $(".nav-menu .active, .mobile-nav .active").removeClass("active");
          $(this).closest("li").addClass("active");
        }

        setMobileNav(false);
        return false;
      }
    }
  });

  // Single place that owns the open/closed state. The class, the icon and the
  // button's aria-expanded have to move together, and three call sites each
  // flipping them by hand is how they drift apart.
  function setMobileNav(open) {
    var toggle = $(".mobile-nav-toggle");
    if ($("body").hasClass("mobile-nav-active") === open) return;
    $("body").toggleClass("mobile-nav-active", open);
    toggle.attr("aria-expanded", open ? "true" : "false");
    toggle
      .find("i")
      .toggleClass("bx-menu", !open)
      .toggleClass("bx-x", open);
  }

  // Activate smooth scroll on page load with hash links in the url
  $(document).ready(function () {
    if (window.location.hash) {
      var initial_nav = window.location.hash;
      if ($(initial_nav).length) {
        var scrollto = $(initial_nav).offset().top;
        $("html, body").animate(
          {
            scrollTop: scrollto,
          },
          scrollDuration,
          scrollEasing
        );
      }
    }
  });

  $(document).on("click", ".mobile-nav-toggle", function (e) {
    setMobileNav(!$("body").hasClass("mobile-nav-active"));
  });

  $(document).click(function (e) {
    var container = $(".mobile-nav-toggle");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
      setMobileNav(false);
    }
  });

  // Escape closes the menu and hands focus back to the control that opened it,
  // so a keyboard user is not left stranded inside a panel they cannot dismiss.
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("body").hasClass("mobile-nav-active")) {
      setMobileNav(false);
      $(".mobile-nav-toggle").focus();
    }
  });

  // Navigation active state on scroll.
  //
  // Only the sections this page's nav actually points at with an in-page anchor
  // take part. The standalone Tools/Games/404 pages link to other documents
  // instead, so without this filter their single section would match on every
  // scroll, strip the active class the markup sets, and find no '#id' link to
  // put it back: one scroll event and the highlight was gone for good.
  var main_nav = $(".nav-menu, #mobile-nav");
  var nav_sections = $("section").filter(function () {
    return (
      this.id && main_nav.find('a[href="#' + this.id + '"]').length > 0
    );
  });

  if (nav_sections.length) {
    $(window).on("scroll", function () {
      var cur_pos = $(this).scrollTop() + 300;

      nav_sections.each(function () {
        var top = $(this).offset().top,
          bottom = top + $(this).outerHeight();

        if (cur_pos >= top && cur_pos <= bottom) {
          if (cur_pos <= bottom) {
            main_nav.find("li").removeClass("active");
          }
          main_nav
            .find('a[href="#' + $(this).attr("id") + '"]')
            .parent("li")
            .addClass("active");
        }
        if (cur_pos < 200) {
          $(".nav-menu ul:first li:first").addClass("active");
        }
      });
    });
  }

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".back-to-top").fadeIn("slow");
    } else {
      $(".back-to-top").fadeOut("slow");
    }
  });

  $(".back-to-top").click(function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      scrollDuration,
      scrollEasing
    );
    return false;
  });

  // Init AOS.
  // AOS hides every [data-aos] element with opacity:0 until it initialises, so
  // if it never runs the page renders blank while still being full height. Bind
  // defensively and verify afterwards.
  function initAos() {
    try {
      AOS.init({
        duration: 1000,
        once: true,
        // Still initialised rather than skipped. AOS's disable path strips the
        // data-aos attributes outright (verified in aos.js), which stops the
        // bundled `[data-aos^=fade]{opacity:0}` rule from matching and leaves
        // the content plainly visible. Never calling init at all would leave
        // those attributes in place and the page blank.
        disable: prefersReducedMotion,
      });
    } catch (e) {
      console.error("AOS failed to initialise:", e);
    }
  }

  if (document.readyState === "complete") {
    initAos();
  } else {
    $(window).on("load", initAos);
  }

  // The failsafe that used to live here now sits in assets/js/boot.js, which
  // runs without jQuery. Keeping it in this file meant it shared a fate with
  // the very thing it was meant to protect against: if jQuery is missing, the
  // IIFE wrapping this file throws before any of it is reached.

  // Service worker
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    $(window).on("load", function () {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(function (err) {
          console.log("ServiceWorker registration failed: ", err);
        });
    });
  }
})(jQuery);
