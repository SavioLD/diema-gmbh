/* =====================================================================
   DIEMA GmbH — Shared site engine
   Rendert Header + Footer aus EINER zentralen Konfiguration und steuert
   Navigation (Desktop-Dropdowns, Mobile-Menü) barrierefrei.
   Inhalte/Kontakt zentral pflegen → gilt automatisch auf allen Seiten.
   ===================================================================== */
(function () {
  "use strict";

  /* -------- Zentrale Stammdaten -------- */
  const SITE = {
    company: "DIEMA GmbH",
    brandSub: "SM-Stahl · Oberflächentechnik",
    person: "Herr Specker",
    email: "info@diemagmbh.de",
    phoneLabel: "+49 (0) 7467 91030-32",
    phoneHref: "+4974679103032",
    faxLabel: "+49 (0) 7467 91030-39",
    street: "Sandbühlstr. 8",
    city: "78606 Seitingen-Oberflacht",
    region: "Baden-Württemberg",
    notfallLabel: "0173 958 9146",
    notfallHref: "+491739589146",
  };

  /* -------- Navigationsstruktur -------- */
  const NAV = [
    { label: "Home", href: "index.html" },
    {
      label: "Oberflächenbearbeitung",
      children: [
        { label: "Schleifen", href: "schleifen.html", desc: "Automatisierte Schleifprozesse" },
        { label: "Polieren", href: "polieren.html", desc: "Hochglanz & Feinbearbeitung" },
        { label: "Entgraten & Gussputzen", href: "entgraten-gussputzen.html", desc: "Grat- & Gussputz-Automation" },
        { label: "Scotchen", href: "scotchen.html", desc: "Mattierte Edelstahl-Optik" },
        { label: "Handlingsysteme", href: "handlingsysteme.html", desc: "Be-, Entladen & Handhabung" },
      ],
    },
    {
      label: "Elektrotechnik",
      children: [
        { label: "Steuerungstechnik", href: "steuerungstechnik.html", desc: "SPS, Steuerungen & Software" },
        { label: "Schaltanlagenbau", href: "schaltanlagenbau.html", desc: "Schaltschränke & Schaltanlagen" },
      ],
    },
    { label: "Service & Vertrieb", href: "ansprechpartner.html" },
    {
      label: "Unternehmen",
      children: [
        { label: "Über DIEMA", href: "index.html#unternehmen", desc: "Zwei Kompetenzen, ein Partner" },
        { label: "Jobs & Karriere", href: "jobs.html", desc: "Arbeiten bei DIEMA" },
        { label: "Kontakt", href: "kontakt.html", desc: "Schreiben oder anrufen" },
        { label: "Anfahrt", href: "anfahrt.html", desc: "So finden Sie uns" },
      ],
    },
  ];

  const FOOTER_COLS = [
    {
      title: "Oberflächenbearbeitung",
      links: [
        { label: "Schleifen", href: "schleifen.html" },
        { label: "Polieren", href: "polieren.html" },
        { label: "Entgraten & Gussputzen", href: "entgraten-gussputzen.html" },
        { label: "Scotchen", href: "scotchen.html" },
        { label: "Handlingsysteme", href: "handlingsysteme.html" },
      ],
    },
    {
      title: "Elektrotechnik",
      links: [
        { label: "Steuerungstechnik", href: "steuerungstechnik.html" },
        { label: "Schaltanlagenbau", href: "schaltanlagenbau.html" },
        { label: "Automatisierungs-Rechner", href: "rechner.html" },
      ],
    },
    {
      title: "Unternehmen",
      links: [
        { label: "Ansprechpartner", href: "ansprechpartner.html" },
        { label: "Jobs & Karriere", href: "jobs.html" },
        { label: "Kontakt", href: "kontakt.html" },
        { label: "Anfahrt", href: "anfahrt.html" },
      ],
    },
  ];

  /* -------- Hilfen -------- */
  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase() || "index.html";

  const ICON = {
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  };

  function brandMark(cls) {
    const id = "bm" + Math.random().toString(36).slice(2, 7);
    return (
      '<svg class="' + cls + '" viewBox="0 0 48 48" role="img" aria-label="DIEMA Logo">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0" stop-color="#18B9D6"/><stop offset="0.55" stop-color="#0E94AE"/><stop offset="1" stop-color="#075E70"/>' +
        '</linearGradient></defs>' +
        '<rect width="48" height="48" rx="13" fill="url(#' + id + ')"/>' +
        '<rect x="12" y="17" width="24" height="3.2" rx="1.6" fill="#fff" opacity="0.95"/>' +
        '<rect x="12" y="23.4" width="17" height="3.2" rx="1.6" fill="#fff" opacity="0.8"/>' +
        '<rect x="12" y="29.8" width="21" height="3.2" rx="1.6" fill="#fff" opacity="0.9"/>' +
        '<circle cx="35.5" cy="14.5" r="3.1" fill="#BFF0FB"/>' +
      "</svg>"
    );
  }

  /* -------- Header rendern -------- */
  function buildHeader() {
    let items = "";
    NAV.forEach(function (node) {
      if (node.children) {
        const open = node.children.some(function (c) { return sameFile(c.href); });
        let sub = "";
        node.children.forEach(function (c) {
          sub +=
            '<li><a href="' + c.href + '"' + (sameFile(c.href) ? ' aria-current="page"' : "") + ">" +
              '<span class="sm-t">' + c.label + "</span>" +
              (c.desc ? '<span class="sm-d">' + c.desc + "</span>" : "") +
            "</a></li>";
        });
        items +=
          '<li class="nav-item has-menu' + (open ? " is-active" : "") + '">' +
            '<button type="button" class="nav-link"' + (open ? ' data-active="true"' : "") +
              ' aria-expanded="false" aria-haspopup="true">' + node.label + " " + ICON.chev + "</button>" +
            '<ul class="submenu">' + sub + "</ul>" +
          "</li>";
      } else {
        items +=
          '<li class="nav-item"><a class="nav-link" href="' + node.href + '"' +
          (sameFile(node.href) ? ' aria-current="page"' : "") + ">" + node.label + "</a></li>";
      }
    });

    return (
      '<header class="site-header" id="siteHeader">' +
        '<div class="shell header-inner">' +
          '<a class="brand" href="index.html" aria-label="' + SITE.company + ' – Startseite">' +
            brandMark("brand__mark") +
            "<span><span class=\"brand__name\">DIEMA</span>" +
            '<span class="brand__sub">' + SITE.brandSub + "</span></span>" +
          "</a>" +
          '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primaryNav" aria-label="Menü öffnen">' +
            '<svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' +
            '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>' +
          "</button>" +
          '<nav class="primary-nav" id="primaryNav" aria-label="Hauptnavigation">' +
            '<ul class="nav-list">' + items + "</ul>" +
            '<a class="btn btn--primary btn--block mobile-cta" href="rechner.html">Automatisierungs-Rechner ' + ICON.arrow + "</a>" +
          "</nav>" +
          '<a class="btn btn--primary header-cta" href="rechner.html">ROI-Rechner ' + ICON.arrow + "</a>" +
        "</div>" +
      "</header>"
    );
  }

  function sameFile(href) {
    const f = href.split("#")[0].split("/").pop().toLowerCase();
    return f === currentFile;
  }

  /* -------- Footer rendern -------- */
  function buildFooter() {
    let cols = "";
    FOOTER_COLS.forEach(function (col) {
      let links = "";
      col.links.forEach(function (l) {
        links += '<li><a href="' + l.href + '">' + l.label + "</a></li>";
      });
      cols += '<div><h4>' + col.title + "</h4><ul class=\"footer-nav\">" + links + "</ul></div>";
    });

    return (
      '<footer class="site-footer">' +
        '<div class="shell footer-top">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="index.html" style="color:#fff">' + brandMark("brand__mark") +
              '<span><span class="brand__name" style="color:#fff">DIEMA</span>' +
              '<span class="brand__sub" style="color:#9FBFC8">' + SITE.brandSub + "</span></span></a>" +
            '<p style="margin-top:1rem">Oberflächenbearbeitung von Metall &amp; innovative Steuerungs&shy;technik für automatische Anlagen — aus einer Hand. Über 60 Jahre Erfahrung.</p>' +
            '<ul class="footer-contact">' +
              '<li>' + ICON.pin + " " + SITE.street + ", " + SITE.city + "</li>" +
              '<li><a href="tel:' + SITE.phoneHref + '">' + ICON.phone + " " + SITE.phoneLabel + "</a></li>" +
              '<li><a href="mailto:' + SITE.email + '">' + ICON.mail + " " + SITE.email + "</a></li>" +
              '<li><a href="tel:' + SITE.notfallHref + '" style="color:#FF9A9E">' + ICON.phone + " 24-Std-Notfall: " + SITE.notfallLabel + "</a></li>" +
            "</ul>" +
          "</div>" +
          cols +
        "</div>" +
        '<div class="shell footer-bottom">' +
          "<span>© " + new Date().getFullYear() + " " + SITE.company + " · Seitingen-Oberflacht &amp; Neuhausen ob Eck · " + SITE.region + "</span>" +
          '<span class="footer-bottom__links">' +
            '<a href="impressum.html">Impressum</a>' +
            '<a href="datenschutz.html">Datenschutz</a>' +
            '<a href="kontakt.html">Kontakt</a>' +
          "</span>" +
        "</div>" +
      "</footer>"
    );
  }

  /* -------- Interaktionen -------- */
  function wire() {
    const body = document.body;
    const header = document.getElementById("siteHeader");
    const toggle = header.querySelector(".nav-toggle");
    const menuButtons = header.querySelectorAll(".nav-item.has-menu > .nav-link");
    const mq = window.matchMedia("(max-width: 960px)");

    // Mobile-Menü
    toggle.addEventListener("click", function () {
      const open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });

    // Dropdown-Disclosure (Klick = toggle; funktioniert Desktop + Mobile + Tastatur)
    menuButtons.forEach(function (btn) {
      const item = btn.parentElement;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        const isOpen = item.classList.contains("is-open");
        // andere schließen (nur Desktop sinnvoll, aber harmlos auf Mobile)
        header.querySelectorAll(".nav-item.is-open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("is-open");
            other.querySelector(".nav-link").setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("is-open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    // Klick außerhalb schließt Desktop-Dropdowns
    document.addEventListener("click", function (e) {
      if (mq.matches) return;
      if (!header.contains(e.target)) closeAllMenus();
    });

    // Escape schließt alles
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAllMenus();
        if (body.classList.contains("nav-open")) {
          body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      }
    });

    // Reset bei Wechsel auf Desktop
    mq.addEventListener("change", function (e) {
      if (!e.matches) {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        closeAllMenus();
      }
    });

    function closeAllMenus() {
      header.querySelectorAll(".nav-item.is-open").forEach(function (i) {
        i.classList.remove("is-open");
        i.querySelector(".nav-link").setAttribute("aria-expanded", "false");
      });
    }

    // Scroll-Schatten
    const onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------- Scroll-Reveal (respektiert reduced-motion) -------- */
  function setupReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* -------- Mount -------- */
  function mount() {
    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    if (h) h.outerHTML = buildHeader();
    if (f) f.outerHTML = buildFooter();
    wire();
    setupReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
