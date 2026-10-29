// Runs before first paint so the page never flashes the wrong theme.
(function () {
  var choice = "dark";
  try { choice = localStorage.getItem("ascii-sharks-theme") || "dark"; } catch (e) {}
  if (choice === "system") choice = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = choice;
})();
