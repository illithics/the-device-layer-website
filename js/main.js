// The Device Layer — shared behavior. No dependencies, no tracking.
(function () {
  "use strict";

  // Footer year
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Theme toggle (paper/light is the default; choice persists in localStorage only)
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var root = document.documentElement;
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      if (next === "dark") root.dataset.theme = "dark";
      else delete root.dataset.theme;
      try { localStorage.setItem("tdl-theme", next); } catch (e) { /* private mode */ }
    });
  }

  // Reading progress bar (article pages only)
  var bar = document.querySelector(".progress-bar");
  var article = document.querySelector(".article");
  if (bar && article) {
    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // "Copy link to section" anchors on article headings
  if (article) {
    article.querySelectorAll("h2[id]").forEach(function (h) {
      var btn = document.createElement("button");
      btn.className = "anchor-btn";
      btn.type = "button";
      btn.textContent = "#";
      btn.setAttribute("aria-label", "Copy link to section: " + h.textContent);
      btn.addEventListener("click", function () {
        var url = location.origin + location.pathname + "#" + h.id;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            btn.textContent = "copied";
            setTimeout(function () { btn.textContent = "#"; }, 1200);
          });
        } else {
          location.hash = h.id;
        }
      });
      h.appendChild(btn);
    });
  }

  // Newsletter form: no delivery backend is wired up yet, so be honest about it.
  document.querySelectorAll(".subscribe-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      var endpoint = form.dataset.endpoint;
      if (!endpoint) {
        e.preventDefault();
        var note = form.parentElement.querySelector(".subscribe-note");
        if (note) {
          note.classList.add("error");
          note.innerHTML =
            'Email delivery isn’t live yet — subscribe by <a href="' +
            (form.dataset.feed || "feed.xml") +
            '">RSS</a> or follow <a href="https://x.com/illithicKeepKey" rel="noopener">@illithicKeepKey</a> in the meantime.';
        }
      } else {
        form.action = endpoint;
      }
    });
  });
})();
