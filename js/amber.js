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

  // ---- ruhige Bewegung des Lichtfadens -----------------------------------

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

  if (reduceMotion) {
    threads.forEach(function (el) { el.classList.add("is-drawn"); });
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
