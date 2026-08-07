/* ==========================================================================
   DevLaunch Portfolio Kit — main.js
   ==========================================================================
   ⚠️ EDIT CAREFULLY (it's beginner-friendly, but tidy).
   Progressive enhancement ONLY. Every feature here is a bonus layered
   on top of a site that already works with JavaScript switched off:

     • Smooth scrolling ....... handled in CSS (base.css), NOT here.
     • Footer year ............ filled in below (HTML has a real year
                                 fallback for no-JS visitors).
     • Active nav link ........ scroll-spy sets aria-current; the
                                 highlight itself is already styled in
                                 components.css.
     • Header scroll state .... sets a data-attribute hook you can style
                                 later — no visual change by default.

   Loaded with `defer`, so the DOM is ready when this runs. No libraries,
   no build step. Respects prefers-reduced-motion throughout.
   ========================================================================== */

(function () {
  "use strict";

  /* Does the visitor want reduced motion? Checked once; used to keep any
     motion-adjacent enhancement calm. */
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ========================================================================
     1. FOOTER YEAR
     ========================================================================
     Replace the fallback year in <span data-current-year> with the real
     current year. If JS is off, the hand-written year in the HTML shows
     instead — so the footer is never blank or wrong-looking. */

  function updateYear() {
    var nodes = document.querySelectorAll("[data-current-year]");
    if (!nodes.length) return;
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year;
    }
  }


  /* ========================================================================
     2. ACTIVE NAV LINK (SCROLL-SPY)
     ========================================================================
     As the visitor scrolls, mark the nav link for the section currently
     in view with aria-current="page". That attribute is BOTH the
     accessible signal (screen readers announce the current section) and
     the visual highlight hook (already styled in components.css) — one
     attribute, two jobs, zero new DOM.

     We only observe sections that actually have a matching nav link, so
     nothing is wasted on sections the nav doesn't point to. */

  function setupScrollSpy() {
    /* IntersectionObserver is the whole feature. If a browser lacks it,
       we simply skip scroll-spy — the nav still works as plain links. */
    if (!("IntersectionObserver" in window)) return;

    var navLinks = document.querySelectorAll(".site-nav__link[href^='#']");
    if (!navLinks.length) return;

    /* Map each observed section element → its nav link. */
    var linkForSection = new Map();
    var sections = [];

    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (!id) return;
      var section = document.getElementById(id);
      if (section) {
        linkForSection.set(section, link);
        sections.push(section);
      }
    });

    if (!sections.length) return;

    function clearCurrent() {
      navLinks.forEach(function (link) {
        link.removeAttribute("aria-current");
      });
    }

    /* rootMargin biases the "active" zone to the upper-middle of the
       viewport, so a link activates as its section reaches reading
       position — not only when it touches the very top. */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var link = linkForSection.get(entry.target);
            if (link) {
              clearCurrent();
              link.setAttribute("aria-current", "page");
            }
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }


  /* ========================================================================
     3. HEADER SCROLL STATE (DORMANT HOOK)
     ========================================================================
     Toggles data-scrolled="true" on the sticky header once the page has
     scrolled past a small threshold. This adds NO visual change on its
     own — it's a hook you can opt into from CSS if you ever want, e.g.:

         .site-header[data-scrolled="true"] { box-shadow: … }

     Kept deliberately inert so this JS sprint changes zero design.
     Uses requestAnimationFrame so the scroll handler stays cheap. */

  function setupHeaderState() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var threshold = 8; /* px scrolled before the state flips */
    var ticking = false;

    function apply() {
      var scrolled = window.scrollY > threshold;
      /* Only touch the DOM when the value actually changes. */
      if (scrolled && header.getAttribute("data-scrolled") !== "true") {
        header.setAttribute("data-scrolled", "true");
      } else if (!scrolled && header.hasAttribute("data-scrolled")) {
        header.removeAttribute("data-scrolled");
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(apply);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    apply(); /* set correct state if the page loads already scrolled */
  }


  /* ========================================================================
     INIT
     ======================================================================== */

  updateYear();
  setupScrollSpy();
  setupHeaderState();

  /* prefersReducedMotion is referenced so future motion features have it
     ready; scroll-spy and the header hook are non-animated by design. */
  void prefersReducedMotion;
})();