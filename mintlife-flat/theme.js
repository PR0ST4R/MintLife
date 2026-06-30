/* ===========================================================
   theme.js — handles light/dark theme with persistence
   =========================================================== */

const Theme = (() => {
  const STORAGE_KEY = "mintlife_theme";

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleIcons(theme);
  }

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    apply(current === "light" ? "dark" : "light");
  }

  function updateToggleIcons(theme) {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const sun = btn.querySelector(".icon-sun");
      const moon = btn.querySelector(".icon-moon");
      if (!sun || !moon) return;
      sun.style.display = theme === "dark" ? "block" : "none";
      moon.style.display = theme === "dark" ? "none" : "block";
    });
  }

  function init() {
    apply(getPreferred());
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", toggle);
    });
  }

  return { init, apply, toggle, getPreferred };
})();

document.addEventListener("DOMContentLoaded", Theme.init);
