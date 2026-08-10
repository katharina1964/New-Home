(function () {
  "use strict";

  var acts = document.querySelectorAll(".act");
  if (!acts.length) return;

  // Opening fade-in from black, like a film start.
  var veil = document.getElementById("introVeil");
  if (veil) {
    window.requestAnimationFrame(function () {
      setTimeout(function () {
        veil.classList.add("is-hidden");
      }, 150);
    });
  }

  // Scroll progress bar, like a video seek bar.
  var progress = document.getElementById("scrollProgress");
  var header = document.getElementById("siteHeader");

  function onScroll() {
    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progress.style.width = pct + "%";
    }

    if (header) {
      var probeY = header.offsetHeight + 12;
      var probeX = window.innerWidth / 2;
      var el = document.elementFromPoint(probeX, probeY);
      var onAct = !!(el && el.closest(".act"));
      header.classList.toggle("on-dark", onAct);
    }
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  // Ken-Burns / caption reveal per act.
  if ("IntersectionObserver" in window) {
    var actObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            actObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    acts.forEach(function (act) {
      actObserver.observe(act);
    });
  } else {
    acts.forEach(function (act) {
      act.classList.add("is-visible");
    });
  }

  // Chapter dot navigation: highlight the chapter currently in view.
  var chapterLinks = document.querySelectorAll(".chapter-nav a");
  if (chapterLinks.length && "IntersectionObserver" in window) {
    var targets = [];
    chapterLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) targets.push({ link: link, target: target });
    });

    var chapterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = targets.find(function (t) {
            return t.target === entry.target;
          });
          if (match) {
            match.link.classList.toggle("is-active", entry.isIntersecting);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );

    targets.forEach(function (t) {
      chapterObserver.observe(t.target);
    });
  }
})();
