(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.getElementById("a-header");
  var navToggle = document.getElementById("a-nav-toggle");

  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".a-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- sanftes Einblenden der Texte beim Scrollen -----------------------

  var revealTargets = document.querySelectorAll(".a-reveal");
  if ("IntersectionObserver" in window && revealTargets.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll(".a-reveal-stagger").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty("--i", i);
    });
  });

  // ---- Wegmarken: einmaliges, dezentes Einblenden am Abschnittsanfang ----

  var threads = document.querySelectorAll(".a-thread");
  if ("IntersectionObserver" in window && threads.length) {
    var threadObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            threadObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" }
    );
    threads.forEach(function (el) { threadObserver.observe(el); });
  } else {
    threads.forEach(function (el) { el.classList.add("is-drawn"); });
  }

  // ---- Lichtfaden: Aufbau direkt an die Scrollstrecke gekoppelt ---------
  // Bewusst kein CSS Scroll-Driven Animation (animation-timeline: view()),
  // da die Browser-Unterstützung dafür uneinheitlich ist. Stattdessen wird
  // der sichtbare Anteil bei jedem Scroll-Event neu aus der tatsächlichen
  // Position des jeweiligen Abschnitts berechnet — funktioniert dadurch in
  // jedem Browser gleich. Läuft rAF-gedrosselt (max. 1x pro Frame), damit
  // die Scrollperformance nicht leidet.

  var threadData = Array.prototype.map.call(threads, function (el) {
    var svg = el.querySelector("svg");
    var path = el.querySelector(".a-thread-path");
    var targetOpacity = path ? parseFloat(getComputedStyle(path).getPropertyValue("--path-opacity")) : 1;
    return { el: el, svg: svg, path: path, targetOpacity: isNaN(targetOpacity) ? 1 : targetOpacity };
  });

  if (reduceMotion) {
    threadData.forEach(function (t) {
      if (!t.svg || !t.path) { return; }
      t.svg.style.clipPath = "inset(0 0 0% 0)";
      t.path.style.opacity = String(t.targetOpacity);
    });
  } else if (threadData.length) {
    var updateThreads = function () {
      var vh = window.innerHeight;
      threadData.forEach(function (t) {
        if (!t.svg || !t.path) { return; }
        var rect = t.el.getBoundingClientRect();
        var total = rect.height + vh;
        var progress = total > 0 ? (vh - rect.top) / total : 0;
        if (progress < 0) { progress = 0; }
        if (progress > 1) { progress = 1; }
        t.svg.style.clipPath = "inset(0 0 " + ((1 - progress) * 100) + "% 0)";
        t.path.style.opacity = String(progress * t.targetOpacity);
      });
      ticking = false;
    };

    var ticking = false;
    var onThreadScroll = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateThreads);
      }
    };

    window.addEventListener("scroll", onThreadScroll, { passive: true });
    window.addEventListener("resize", onThreadScroll, { passive: true });
    updateThreads();
  }

  // ---- aktive Sprungmarke beim Scrollen ----------------------------------

  var navLinks = document.querySelectorAll(".a-nav a[href^='#']");
  var navSections = [];
  navLinks.forEach(function (link) {
    var section = document.querySelector(link.getAttribute("href"));
    if (section) { navSections.push({ link: link, section: section }); }
  });

  if ("IntersectionObserver" in window && navSections.length) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
      });
    };

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { setActive(entry.target.id); }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    navSections.forEach(function (item) { sectionObserver.observe(item.section); });
  }

  // ---- Kontaktformular ----------------------------------------------------

  var form = document.getElementById("a-contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var status = document.getElementById("a-form-status");
      var name = form.querySelector("#a-name").value.trim();
      var email = form.querySelector("#a-email").value.trim();

      if (!name || !email) {
        if (status) { status.textContent = "Bitte trage zumindest Deinen Namen und Deine E-Mail-Adresse ein."; }
        return;
      }

      var phone = form.querySelector("#a-phone").value.trim();
      var subject = form.querySelector("#a-subject").value.trim() || "Kontaktanfrage über die Website";
      var message = form.querySelector("#a-message").value.trim();

      var body = [
        "Name: " + name,
        "E-Mail: " + email,
        "Telefon: " + phone,
        "",
        message
      ].join("\n");

      var mailto =
        "mailto:katharina@amber-coaching.de" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) { status.textContent = "Dein E-Mail-Programm öffnet sich gleich mit Deiner Nachricht."; }
      window.location.href = mailto;
    });
  }
})();
