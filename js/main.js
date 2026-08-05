// Scroll-reveal animation + footer year. No dependencies.
(function () {
  "use strict";

  document.getElementById("year").textContent = String(new Date().getFullYear());

  var revealed = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealed.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealed.forEach(function (el) { observer.observe(el); });
})();
