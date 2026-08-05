// Client-side full-text search. Fetches the published essays (same origin,
// tiny archive) and searches their extracted text. No index server, no tracking.
(function () {
  "use strict";

  var input = document.getElementById("search-box");
  var status = document.getElementById("search-status");
  var results = document.getElementById("search-results");
  if (!input) return;

  var docs = null;
  var loading = null;

  function stripHtml(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var art = doc.querySelector(".article") || doc.body;
    // Exclude chrome that would pollute results
    art.querySelectorAll(".trust-ledger, .pager, .related, .article-foot, script").forEach(function (n) { n.remove(); });
    return (art.textContent || "").replace(/\s+/g, " ").trim();
  }

  function load() {
    if (loading) return loading;
    status.textContent = "loading archive…";
    loading = fetch("posts.json")
      .then(function (r) { return r.json(); })
      .then(function (manifest) {
        var published = manifest.editions.filter(function (e) { return e.status === "published"; });
        return Promise.all(
          published.map(function (e) {
            return fetch(e.url)
              .then(function (r) { return r.text(); })
              .then(function (html) {
                return { edition: e, text: stripHtml(html) };
              });
          })
        );
      })
      .then(function (loaded) { docs = loaded; return docs; });
    return loading;
  }

  function snippet(text, term) {
    var idx = text.toLowerCase().indexOf(term);
    var start = Math.max(0, idx - 70);
    var end = Math.min(text.length, idx + term.length + 130);
    var s = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    return s.replace(new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
  }

  function run() {
    var q = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (q.length < 2) {
      status.textContent = docs ? docs.length + " essays indexed" : "type to search the archive";
      return;
    }
    load().then(function (loaded) {
      var hits = loaded.filter(function (d) {
        return d.text.toLowerCase().indexOf(q) !== -1 ||
               d.edition.title.toLowerCase().indexOf(q) !== -1;
      });
      status.textContent = hits.length + " result" + (hits.length === 1 ? "" : "s") + " for “" + input.value.trim() + "”";
      hits.forEach(function (d) {
        var li = document.createElement("li");
        var inText = d.text.toLowerCase().indexOf(q) !== -1;
        li.innerHTML =
          '<a class="post-item search-result" href="' + d.edition.url + '">' +
          '<span class="meta-line"><span>Edition ' + d.edition.edition + '</span><span>' + d.edition.date + "</span></span>" +
          "<h3>" + d.edition.title + "</h3>" +
          "<p>" + (inText ? snippet(d.text, q) : d.edition.subtitle) + "</p>" +
          '<span class="read-more">Read →</span></a>';
        results.appendChild(li);
      });
    });
  }

  var t;
  input.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(run, 200);
  });
  input.addEventListener("focus", load, { once: true });

  // Support ?q= links
  var params = new URLSearchParams(location.search);
  if (params.get("q")) {
    input.value = params.get("q");
    run();
  }
})();
