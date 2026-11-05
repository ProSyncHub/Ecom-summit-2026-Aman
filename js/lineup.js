/* Lineup "View More" toggle: slowly expands / collapses modules 6-11. */
(function () {
  "use strict";
  var btn = document.getElementById("lineup-toggle");
  var more = document.getElementById("lineup-more");
  if (!btn || !more) return;
  var label = btn.querySelector(".lineup-toggle__label");

  btn.addEventListener("click", function () {
    var open = more.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.classList.toggle("is-open", open);
    if (label) label.textContent = open ? "View Less" : "View More";
  });
})();
