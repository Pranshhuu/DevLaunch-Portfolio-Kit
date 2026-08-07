/* ==========================================================================
   DevLaunch Portfolio Kit — theme.js
   ==========================================================================
   🚫 DON'T EDIT unless you know what you're doing.
   Handles light/dark theming. Loaded in the <head> WITHOUT defer, on
   purpose: the first block runs before the page paints so dark-mode
   visitors never see a white flash.

   HOW IT DECIDES WHICH THEME TO SHOW
   ----------------------------------
   1. A choice the visitor made before (saved in localStorage) — wins.
   2. Otherwise, the visitor's operating-system preference
      (prefers-color-scheme) — respected on first visit.
   3. If the OS preference later changes and the visitor hasn't picked
      manually, the site follows along.

   It only ever sets data-theme="dark" or "light" on <html>. Every
   color comes from css/tokens.css — this file touches no colors.
   ========================================================================== */

(function () {
  "use strict";

  var STORAGE_KEY = "devlaunch-theme";
  var root = document.documentElement;

  /* localStorage can throw (private mode, disabled storage). Wrap both
     sides so a storage failure never breaks theming — the site just
     falls back to following the OS preference each visit. */
  function readStored() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function writeStored(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* ignore — persistence is a nice-to-have, not a requirement */
    }
  }

  function systemPrefersDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  /* The theme to show right now: saved choice first, else OS preference. */
  function resolveTheme() {
    var stored = readStored();
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return systemPrefersDark() ? "dark" : "light";
  }

  /* Apply a theme to the document. `persist` is true only for an
     explicit user action — the no-flash boot and OS-driven changes
     apply WITHOUT writing storage, so "follow my system" stays intact
     until the visitor deliberately chooses. */
  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      writeStored(theme);
    }
    syncToggles(theme);
  }

  /* ---- NO-FLASH BOOT ---------------------------------------------------
     Runs immediately (this script is in <head>, before <body> paints).
     Sets the correct theme so there's never a wrong-color flash. */
  applyTheme(resolveTheme(), false);

  /* ---- Reflect state on any toggle buttons -----------------------------
     Buttons carry data-theme-toggle. We update aria-pressed (dark = on)
     and a fresh accessible label so screen readers announce the ACTION
     the button will perform next. The icon is CSS-driven off data-theme,
     so nothing here touches visuals. */
  function syncToggles(theme) {
    var isDark = theme === "dark";
    var nextLabel = isDark ? "Switch to light theme" : "Switch to dark theme";
    var buttons = document.querySelectorAll("[data-theme-toggle]");

    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute("aria-label", nextLabel);

      /* If the button uses a visually-hidden text label, keep it in
         sync too (belt and braces for older screen readers). */
      var srText = btn.querySelector(".visually-hidden");
      if (srText) {
        srText.textContent = nextLabel;
      }
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next, true); /* explicit choice — persist it */
  }

  /* ---- Wire up after the DOM is ready ---------------------------------- */
  function init() {
    /* Event delegation: one listener handles any/all toggle buttons,
       including a future one in the footer or mobile menu. Native
       <button> elements give us keyboard support (Enter/Space) and
       focus for free — no key handling needed here. */
    document.addEventListener("click", function (event) {
      var toggle = event.target.closest("[data-theme-toggle]");
      if (toggle) {
        toggleTheme();
      }
    });

    /* Follow the OS if it changes AND the visitor hasn't chosen manually. */
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystemChange = function (e) {
        if (!readStored()) {
          applyTheme(e.matches ? "dark" : "light", false);
        }
      };
      if (mq.addEventListener) {
        mq.addEventListener("change", onSystemChange);
      } else if (mq.addListener) {
        mq.addListener(onSystemChange); /* older Safari */
      }
    }

    /* Sync button labels now that they exist in the DOM. */
    syncToggles(currentTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();