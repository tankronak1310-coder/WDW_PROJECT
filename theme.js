/* ================================================================
   theme.js — MechControl Light / Dark Mode Toggle
   Persists user theme preference across all pages using localStorage
   ================================================================ */

function getSavedTheme() {
  var saved = localStorage.getItem("mc_theme");
  if (saved == null || saved == "") {
    return "light";
  }
  return saved;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("mc_theme", theme);

  var icon = document.getElementById("themeToggleIcon");
  var btn = document.getElementById("themeToggleBtn");

  if (icon) {
    if (theme === "dark") {
      icon.className = "bi bi-sun-fill text-warning";
    } else {
      icon.className = "bi bi-moon-stars-fill text-white";
    }
  }

  if (btn) {
    btn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
  }
}

function toggleTheme() {
  var current = document.documentElement.getAttribute("data-theme") || "light";
  var next = (current === "dark") ? "light" : "dark";
  applyTheme(next);
}

// Apply immediately on script load to avoid flash of wrong theme
(function() {
  var initialTheme = getSavedTheme();
  document.documentElement.setAttribute("data-theme", initialTheme);
})();

// Re-apply icon state when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  var currentTheme = getSavedTheme();
  applyTheme(currentTheme);
});
