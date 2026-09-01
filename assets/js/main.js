/* ==========================================================================
   MS Consultoria — Saúde e Segurança do Trabalho
   Website institucional premium · JavaScript principal
   Efeitos implementados em vanilla JS (adaptados de referências da Biblioteca):
   - Preloader / loader
   - Header transparente → sólido no scroll
   - Smooth scroll (rAF + ease)  [inspirado no Lenis]
   - Reveal on scroll (IntersectionObserver)  [inspirado em GSAP ScrollTrigger]
   - Counter animado  [KPIs]
   - Sticky storytelling "Desafio" (MOMENTO 1)
   - Linha de progresso do Fluxo SST (MOMENTO 2)
   - Hover spotlight nos cards de serviço
   - Menu mobile
   - Ano do rodapé
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  function initPreloader() {
    var preloader = document.getElementById("preloader");
    var bar = preloader ? preloader.querySelector(".preloader__bar span") : null;
    if (!preloader) return;

    function markLoaded() {
      if (document.body) document.body.classList.add("is-loaded");
    }

    var progress = 0;
    var timer = setInterval(function () {
      progress += Math.random() * 22;
      if (progress >= 100) progress = 100;
      if (bar) bar.style.width = progress + "%";
      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          preloader.classList.add("is-hidden");
          markLoaded();
          setTimeout(function () { if (preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 800);
        }, 220);
      }
    }, 120);

    // Fallback: nunca deixar o preloader travar
    setTimeout(function () {
      preloader.classList.add("is-hidden");
      markLoaded();
    }, 3200);
  }

  /* ---------- Header scroll ---------- */
  function initHeader() {
    var header = document.getElementById("site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Smooth scroll (rAF + ease, inspirado no Lenis) ---------- */
  function initSmoothScroll() {
    if (prefersReduced) return;
    var links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (href.length < 2) return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var headerH = document.getElementById("site-header").offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 2;
        var startY = window.pageYOffset;
        var diff = top - startY;
        var duration = Math.min(1200, Math.max(500, Math.abs(diff) * 0.4));
        var startTime = null;

        function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
        function step(ts) {
          if (!startTime) startTime = ts;
          var p = Math.min(1, (ts - startTime) / duration);
          window.scrollTo(0, startY + diff * ease(p));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);

        // Fechar menu mobile
        var nav = document.getElementById("site-nav");
        var toggle = document.getElementById("nav-toggle");
        if (nav && toggle) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Abrir menu");
        }
      });
    });
  }

  /* ---------- Reveal on scroll (bidirecional) ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: [0.06, 0.2, 0.4], rootMargin: "0px 0px -4% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Counters ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) { el.textContent = target; return; }
    var duration = 1600;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min(1, (ts - startTime) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Só anima quando entra na viewport; remove a trava ao sair (bidirecional)
          if (!entry.target.getAttribute("data-done")) {
            animateCounter(entry.target);
            entry.target.setAttribute("data-done", "1");
          }
        } else {
          entry.target.removeAttribute("data-done");
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Sticky "Desafio" (MOMENTO 1) ---------- */
  function initDesafio() {
    var sticky = document.getElementById("desafio-sticky");
    if (!sticky) return;
    var panels = sticky.querySelectorAll(".desafio__panel");
    var bar = document.getElementById("desafio-progress");
    if (!panels.length) return;

    var total = panels.length;

    function update() {
      var rect = sticky.getBoundingClientRect();
      var vh = window.innerHeight;
      // Progresso relativo à passagem da seção pela viewport
      var start = rect.top;
      var height = rect.height;
      var p = Math.min(1, Math.max(0, (-start) / (height - vh + 80)));
      var idx = Math.min(total - 1, Math.floor(p * total));
      panels.forEach(function (panel, i) {
        panel.classList.toggle("desafio__panel--active", i === idx);
      });
      if (bar) bar.style.width = Math.round(p * 100) + "%";
    }

    var enabled = window.innerWidth > 920;

    function onResize() {
      var shouldEnable = window.innerWidth > 920;
      if (shouldEnable === enabled) return;
      enabled = shouldEnable;
      if (enabled) {
        window.addEventListener("scroll", update, { passive: true });
        update();
      } else {
        window.removeEventListener("scroll", update);
        // Volta o primeiro painel visível e zera a barra
        panels.forEach(function (panel, i) {
          panel.classList.toggle("desafio__panel--active", i === 0);
        });
        if (bar) bar.style.width = "0%";
      }
    }

    if (enabled) window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    update();
  }

  /* ---------- Linha do Fluxo SST (MOMENTO 2) ---------- */
  function initFluxo() {
    var track = document.querySelector(".fluxo__track");
    var fill = document.getElementById("fluxo-line-fill");
    var steps = document.querySelectorAll(".fluxo__step");
    if (!track || !steps.length) return;

    function update() {
      var rect = track.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = rect.top - vh * 0.7;
      var end = rect.bottom - vh * 0.35;
      var p = Math.min(1, Math.max(0, (vh - start) / (end - start)));
      // No desktop com linha, preenche; sempre marca passos
      if (fill) fill.style.width = Math.round(p * 100) + "%";
      steps.forEach(function (step, i) {
        var stepP = i / steps.length;
        step.classList.toggle("is-done", p >= stepP + 0.02);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Sequência de entrada do Portal (MOMENTO 3, bidirecional) ---------- */
  function initPortalSequence() {
    var section = document.getElementById("portal");
    var head = section ? section.querySelector(".portal__head") : null;
    var mockup = document.getElementById("portal-mockup");
    var indicators = document.getElementById("portal-indicators");
    var note = section ? section.querySelector(".portal__note") : null;
    if (!section || !mockup || !indicators) return;

    function setStage(stage) {
      if (head) head.setAttribute("data-staged", stage);
      mockup.setAttribute("data-staged", stage);
      indicators.setAttribute("data-staged", stage);
      if (note) note.setAttribute("data-staged", stage);
    }

    function update() {
      var vh = window.innerHeight;
      var rect = section.getBoundingClientRect();
      var top = rect.top;
      var h = rect.height;

      // Progressão ao descer; regride naturalmente ao subir
      var stage = "idle";
      if (top < vh * 0.98) stage = "text";
      if (top < vh * 0.70) stage = "mockup";
      if (top < vh * 0.40) stage = "indicators";
      if (top < vh * 0.14) stage = "depth";

      // Fora da viewport (abaixo ou acima) → reinicia
      if (top > vh || top + h < 0) stage = "idle";

      setStage(stage);
    }

    if (prefersReduced) { setStage("depth"); return; }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- Hover spotlight nos cards de serviço ---------- */
  function initSpotlight() {
    var cards = document.querySelectorAll(".servico-card");
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
        card.style.setProperty("--my", (e.clientY - rect.top) + "px");
      });
    });
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
  }

  /* ---------- Ano do rodapé ---------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  function init() {
    initPreloader();
    initHeader();
    initSmoothScroll();
    initReveal();
    initCounters();
    initDesafio();
    initFluxo();
    initPortalSequence();
    initSpotlight();
    initMobileMenu();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
