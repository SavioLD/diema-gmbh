/* =====================================================================
   DIEMA — Automatisierungs-ROI-Rechner
   Live-Modell + PDF-Erzeugung (jsPDF) + Lead-Versand (Web3Forms).
   Modellwerte sind branchenübliche Richtwerte, klar als Schätzung
   gekennzeichnet. Keine externe Berechnung — alles im Browser.
   ===================================================================== */
(function () {
  "use strict";

  /* -------- Web3Forms (Lead-Empfänger wird im Dashboard konfiguriert) -------- */
  var WEB3FORMS_KEY = "2df05c94-c19f-46ed-a4c2-ea64cf4aa302";

  /* -------- Prozess-Presets (Richtwerte) -------- */
  var PROCESS = {
    schleifen: { label: "Schleifen", laborReduction: 0.60, scrapFactor: 0.70, capacityGain: 0.35, invest: 185000 },
    polieren:  { label: "Polieren", laborReduction: 0.55, scrapFactor: 0.65, capacityGain: 0.30, invest: 195000 },
    entgraten: { label: "Entgraten & Gussputzen", laborReduction: 0.70, scrapFactor: 0.75, capacityGain: 0.40, invest: 210000 },
    scotchen:  { label: "Scotchen", laborReduction: 0.50, scrapFactor: 0.60, capacityGain: 0.28, invest: 165000 },
    gemischt:  { label: "Gemischt / mehrere Verfahren", laborReduction: 0.58, scrapFactor: 0.68, capacityGain: 0.34, invest: 225000 },
  };
  var ZIEL_LABEL = { kapazitaet: "Kapazität erhöhen", kosten: "Kosten senken", qualitaet: "Qualität sichern", entlastung: "Mitarbeiter entlasten" };
  var RECRUIT_LABEL = { 1: "sehr leicht", 2: "leicht", 3: "mittel", 4: "schwer", 5: "kaum möglich" };

  var HOURS_PER_DAY = 7.5;

  /* -------- Formatierung -------- */
  var EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  var NUM = new Intl.NumberFormat("de-DE");
  function eur(n) { return EUR.format(Math.round(n || 0)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function $(id) { return document.getElementById(id); }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lastResult = null, lastInputs = null, lastPdfDoc = null, lastPdfName = "DIEMA-Auswertung.pdf";

  /* -------- Eingaben lesen -------- */
  function readInputs() {
    var prozess = (document.querySelector('input[name="prozess"]:checked') || {}).value || "schleifen";
    var ziel = (document.querySelector('input[name="ziel"]:checked') || {}).value || "kapazitaet";
    var schichten = parseInt((document.querySelector('input[name="schichten"]:checked') || {}).value || "2", 10);
    return {
      prozess: prozess,
      ziel: ziel,
      mitarbeiter: clamp(parseInt($("mitarbeiter").value, 10) || 1, 1, 200),
      stundenlohn: clamp(parseFloat($("stundenlohn").value) || 45, 15, 200),
      arbeitstage: clamp(parseInt($("arbeitstage").value, 10) || 220, 100, 330),
      schichten: schichten,
      ausschuss: clamp(parseInt($("ausschuss").value, 10) || 0, 0, 30),
      recruiting: clamp(parseInt($("recruiting").value, 10) || 1, 1, 5),
    };
  }

  /* -------- Modell -------- */
  function compute(i) {
    var p = PROCESS[i.prozess] || PROCESS.schleifen;

    var laborCostYear = i.mitarbeiter * i.stundenlohn * HOURS_PER_DAY * i.arbeitstage;
    var savedLabor = laborCostYear * p.laborReduction;
    var reworkCostYear = laborCostYear * (i.ausschuss / 100) * 1.4;
    var savedScrap = reworkCostYear * p.scrapFactor;

    var cells = Math.max(1, Math.round(i.mitarbeiter / 6));
    var investTotal = p.invest * cells;

    var shiftFactor = 1 + (i.schichten - 1) * 0.30;
    // Schichtbetrieb hebt v. a. die vermiedene Ausschuss-/Nacharbeitsmenge (mehr Output je Zelle).
    // Personal-Einsparung bleibt auf die tatsächlich freigesetzte Lohnsumme begrenzt → bleibt belastbar.
    var grossAnnual = savedLabor + savedScrap * shiftFactor;
    var opex = investTotal * 0.09;
    var annualSavings = Math.max(0, grossAnnual - opex);

    var paybackMonths = annualSavings > 0 ? investTotal / (annualSavings / 12) : Infinity;
    var fiveYearNet = annualSavings * 5 - investTotal;
    var schaden3 = annualSavings * 3;
    var capacityGainPct = Math.min(0.6, p.capacityGain * shiftFactor);

    // Score
    var m = clamp(i.mitarbeiter / 12, 0, 1);
    var a = clamp(i.ausschuss / 15, 0, 1);
    var r = (i.recruiting - 1) / 4;
    var s = (i.schichten - 1) / 2;
    var w = clamp((i.stundenlohn - 30) / 40, 0, 1);
    var pb = isFinite(paybackMonths) ? clamp((30 - paybackMonths) / 30, 0, 1) : 0;
    var zielBoost = i.ziel === "kapazitaet" ? s * 0.05 : i.ziel === "kosten" ? w * 0.05 : i.ziel === "qualitaet" ? a * 0.05 : r * 0.05;
    var raw = 0.22 * m + 0.18 * a + 0.16 * r + 0.10 * s + 0.10 * w + 0.20 * pb + zielBoost;
    var score = clamp(Math.round(raw * 100), 12, 99);

    return {
      laborCostYear: laborCostYear, reworkCostYear: reworkCostYear,
      savedLabor: savedLabor, savedScrap: savedScrap, opex: opex,
      investTotal: investTotal, cells: cells,
      annualSavings: annualSavings, paybackMonths: paybackMonths,
      fiveYearNet: fiveYearNet, schaden3: schaden3,
      capacityGainPct: capacityGainPct, score: score, processLabel: p.label,
    };
  }

  function paybackText(m) {
    if (!isFinite(m)) return "—";
    if (m > 60) return ">60";
    return String(Math.round(m));
  }

  function headline(score) {
    if (score >= 70) return "Sehr hohes Automatisierungspotenzial";
    if (score >= 50) return "Hohes Automatisierungspotenzial";
    if (score >= 32) return "Solides Automatisierungspotenzial";
    return "Punktuelles Automatisierungspotenzial";
  }

  /* -------- Gauge -------- */
  function setGauge(arcId, valId, score) {
    var arc = $(arcId), val = $(valId);
    if (!arc) return;
    // getTotalLength() kann bei display:none 0 liefern → Fallback auf dasharray-Attribut
    var len = 0;
    try { len = arc.getTotalLength(); } catch (e) { len = 0; }
    if (!len) len = parseFloat(arc.getAttribute("stroke-dasharray")) || 295;
    arc.style.strokeDasharray = len;
    if (!reduceMotion) arc.style.transition = "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)";
    arc.style.strokeDashoffset = len * (1 - score / 100);
    if (val) val.textContent = score;
  }

  /* -------- UI aktualisieren -------- */
  function update() {
    var i = readInputs();
    var r = compute(i);
    lastInputs = i; lastResult = r;

    // Live-Panel
    setGauge("gaugeArcLive", "gaugeValLive", r.score);
    $("kpiSaveLive").textContent = eur(r.annualSavings);
    $("kpiPaybackLive").textContent = paybackText(r.paybackMonths) + " Mon.";
    $("kpiSchadenLive").textContent = eur(r.schaden3);

    // Volle Ergebnisse
    setGauge("gaugeArcBig", "gaugeValBig", r.score);
    $("resultHeadline").textContent = headline(r.score);
    $("resultSummary").textContent =
      "Bei " + i.mitarbeiter + " Mitarbeiter" + (i.mitarbeiter === 1 ? "" : "n") +
      " und " + i.ausschuss + " % Ausschuss verschenken Sie rund " + eur(r.annualSavings) +
      " pro Jahr. Die Investition amortisiert sich in ca. " + paybackText(r.paybackMonths) + " Monaten.";

    $("tSave").textContent = eur(r.annualSavings);
    $("tPayback").innerHTML = paybackText(r.paybackMonths) + ' <small>Monate</small>';
    $("tFive").textContent = eur(Math.max(0, r.fiveYearNet));
    $("tSchaden").textContent = eur(r.schaden3);
    $("tCapacity").textContent = "+" + Math.round(r.capacityGainPct * 100) + " %";
    $("tInvest").textContent = "ab " + eur(r.investTotal);

    $("bLabor").textContent = eur(r.laborCostYear);
    $("bRework").textContent = eur(r.reworkCostYear);
    $("bSaveLabor").textContent = "+ " + eur(r.savedLabor);
    $("bSaveScrap").textContent = "+ " + eur(r.savedScrap);
    $("bOpex").textContent = "– " + eur(r.opex);
    $("bNet").textContent = eur(r.annualSavings);
  }

  /* -------- Wizard -------- */
  var current = 1, TOTAL = 3;
  function showStep(n, focusHeading) {
    current = clamp(n, 1, TOTAL);
    document.querySelectorAll(".step").forEach(function (s) {
      s.classList.toggle("is-active", parseInt(s.dataset.step, 10) === current);
    });
    document.querySelectorAll("#progress li").forEach(function (li) {
      var st = parseInt(li.dataset.step, 10);
      li.classList.toggle("done", st < current);
      if (st === current) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });
    $("btnPrev").hidden = current === 1;
    $("btnNext").hidden = current === TOTAL;
    $("btnResult").hidden = current !== TOTAL;
    // Fokus nur bei aktiver Navigation (nicht beim Initial-Render)
    if (focusHeading) {
      var active = document.querySelector(".step.is-active h2");
      if (active) { active.setAttribute("tabindex", "-1"); active.focus({ preventScroll: true }); }
    }
  }

  function revealResults() {
    var res = $("results");
    res.classList.add("is-revealed");
    update();
    $("ergebnis").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  /* -------- Lead-Text + PDF -------- */
  function inputLines(i, r) {
    return [
      ["Prozess", r.processLabel],
      ["Ziel", ZIEL_LABEL[i.ziel] || i.ziel],
      ["Mitarbeiter (Oberfläche)", String(i.mitarbeiter)],
      ["Vollkosten / Stunde", eur(i.stundenlohn)],
      ["Arbeitstage / Jahr", String(i.arbeitstage)],
      ["Schichtbetrieb", i.schichten + "-schichtig"],
      ["Ausschuss / Nacharbeit", i.ausschuss + " %"],
      ["Personalverfügbarkeit", RECRUIT_LABEL[i.recruiting]],
    ];
  }

  function buildPDF(i, r, contact) {
    if (!(window.jspdf && window.jspdf.jsPDF)) return null;
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    var W = 210, M = 16, y = 0;
    var teal = [14, 148, 174], dark = [14, 27, 34], muted = [106, 122, 132], danger = [216, 58, 63], good = [24, 147, 95];

    // Kopfband
    doc.setFillColor(10, 42, 51); doc.rect(0, 0, W, 30, "F");
    doc.setFillColor(teal[0], teal[1], teal[2]); doc.rect(0, 30, W, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(17); doc.text("DIEMA GmbH", M, 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(180, 220, 230);
    doc.text("SM-Stahl · Automatisierungs-Auswertung", M, 21);
    doc.setFontSize(9); doc.text(new Date().toLocaleDateString("de-DE"), W - M, 14, { align: "right" });
    doc.text("info@diemagmbh.de · 07467 91030-32", W - M, 21, { align: "right" });

    y = 44;
    doc.setTextColor(dark[0], dark[1], dark[2]); doc.setFont("helvetica", "bold"); doc.setFontSize(13);
    doc.text("Auswertung für " + (contact.firma || (contact.vorname + " " + contact.nachname)), M, y);
    y += 6; doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text((contact.vorname + " " + contact.nachname) + (contact.position ? " · " + contact.position : ""), M, y);

    // Score-Box
    y += 8;
    doc.setFillColor(236, 247, 250); doc.roundedRect(M, y, W - 2 * M, 26, 3, 3, "F");
    doc.setTextColor(teal[0], teal[1], teal[2]); doc.setFont("helvetica", "bold"); doc.setFontSize(30);
    doc.text(String(r.score), M + 10, y + 18);
    doc.setFontSize(9); doc.setTextColor(muted[0], muted[1], muted[2]); doc.setFont("helvetica", "normal");
    doc.text("/ 100", M + 10 + doc.getTextWidth(String(r.score)) + 2, y + 18);
    doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(headline(r.score), M + 34, y + 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text("Automatisierungs-Score für " + r.processLabel, M + 34, y + 19);

    // KPI-Kacheln
    y += 34;
    var kpis = [
      ["Einsparpotenzial / Jahr", eur(r.annualSavings), good],
      ["Amortisationszeit", paybackText(r.paybackMonths) + " Monate", dark],
      ["Netto-Einsparung / 5 Jahre", eur(Math.max(0, r.fiveYearNet)), good],
      ["Schaden bei Nicht-Automatisierung (3 J.)", eur(r.schaden3), danger],
      ["Kapazitätsgewinn", "+" + Math.round(r.capacityGainPct * 100) + " %", dark],
      ["Investitionsrahmen (Richtwert)", "ab " + eur(r.investTotal), dark],
    ];
    var colW = (W - 2 * M - 8) / 2, rowH = 20, kx = M, ky = y;
    kpis.forEach(function (k, idx) {
      var col = idx % 2, row = Math.floor(idx / 2);
      var x = M + col * (colW + 8), yy = ky + row * (rowH + 5);
      doc.setDrawColor(220, 230, 234); doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, yy, colW, rowH, 2.5, 2.5, "FD");
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(muted[0], muted[1], muted[2]);
      doc.text(k[0], x + 5, yy + 7, { maxWidth: colW - 10 });
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(k[2][0], k[2][1], k[2][2]);
      doc.text(k[1], x + 5, yy + 16);
    });

    // Aufschlüsselung
    y = ky + 3 * (rowH + 5) + 6;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text("So entsteht Ihr Einsparpotenzial", M, y); y += 6;
    var rows = [
      ["Personalkosten Handarbeit (heute)", eur(r.laborCostYear)],
      ["Ausschuss & Nacharbeit (heute)", eur(r.reworkCostYear)],
      ["Einsparung Personal durch Automation", "+ " + eur(r.savedLabor)],
      ["Einsparung Ausschuss / Nacharbeit", "+ " + eur(r.savedScrap)],
      ["Betriebskosten Automation (Wartung, Energie)", "– " + eur(r.opex)],
      ["= Netto-Einsparung pro Jahr", eur(r.annualSavings)],
    ];
    doc.setFontSize(9.5);
    rows.forEach(function (rw, idx) {
      var last = idx === rows.length - 1;
      doc.setFont("helvetica", last ? "bold" : "normal");
      doc.setTextColor(last ? dark[0] : muted[0], last ? dark[1] : muted[1], last ? dark[2] : muted[2]);
      doc.text(rw[0], M, y);
      doc.text(rw[1], W - M, y, { align: "right" });
      doc.setDrawColor(232, 240, 243); doc.line(M, y + 1.8, W - M, y + 1.8);
      y += 7;
    });

    // Eingaben
    y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text("Ihre Angaben", M, y); y += 6;
    doc.setFontSize(9);
    var lines = inputLines(i, r), half = Math.ceil(lines.length / 2);
    lines.forEach(function (ln, idx) {
      var col = idx < half ? 0 : 1;
      var x = M + col * ((W - 2 * M) / 2);
      var yy = y + (idx % half) * 6;
      doc.setFont("helvetica", "normal"); doc.setTextColor(muted[0], muted[1], muted[2]);
      doc.text(ln[0] + ":", x, yy);
      doc.setFont("helvetica", "bold"); doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(String(ln[1]), x + 48, yy);
    });
    y += half * 6 + 4;

    // Fußnote
    doc.setDrawColor(220, 230, 234); doc.line(M, y, W - M, y); y += 5;
    doc.setFont("helvetica", "italic"); doc.setFontSize(7.8); doc.setTextColor(muted[0], muted[1], muted[2]);
    var note = "Unverbindliche Modellrechnung auf Basis branchenüblicher Richtwerte. Ersetzt keine individuelle Detailanalyse. " +
      "Der Investitionsrahmen hängt von Bauteil, Taktzeit und Automatisierungsgrad ab. DIEMA GmbH, Sandbühlstr. 8, 78606 Seitingen-Oberflacht.";
    doc.text(doc.splitTextToSize(note, W - 2 * M), M, y);

    return doc;
  }

  function pdfFilename(contact) {
    var f = (contact.firma || contact.nachname || "Auswertung").replace(/[^a-z0-9äöüß ]/gi, "").trim().replace(/\s+/g, "-");
    return "DIEMA-Automatisierung-" + (f || "Auswertung") + ".pdf";
  }

  /* -------- Web3Forms -------- */
  function sendLead(i, r, contact) {
    var msg = [
      "Neuer Lead aus dem Automatisierungs-ROI-Rechner (DIEMA / SM-Stahl)",
      "Zeit: " + new Date().toLocaleString("de-DE"),
      "",
      "--- KONTAKT ---",
      "Name: " + contact.vorname + " " + contact.nachname,
      "Firma: " + contact.firma,
      "E-Mail: " + contact.email,
      "Telefon: " + (contact.telefon || "—"),
      "Rolle: " + (contact.position || "—"),
      "",
      "--- ERGEBNIS ---",
      "Automatisierungs-Score: " + r.score + "/100 (" + headline(r.score) + ")",
      "Einsparpotenzial / Jahr: " + eur(r.annualSavings),
      "Amortisation: " + paybackText(r.paybackMonths) + " Monate",
      "Netto-Einsparung / 5 Jahre: " + eur(Math.max(0, r.fiveYearNet)),
      "Schaden bei Nicht-Automatisierung (3 J.): " + eur(r.schaden3),
      "Kapazitätsgewinn: +" + Math.round(r.capacityGainPct * 100) + " %",
      "Investitionsrahmen: ab " + eur(r.investTotal),
      "",
      "--- EINGABEN ---",
    ].concat(inputLines(i, r).map(function (l) { return l[0] + ": " + l[1]; })).join("\n");

    var fd = new FormData();
    fd.append("access_key", WEB3FORMS_KEY);
    fd.append("subject", "[Automatisierungs-Rechner] " + (contact.firma || contact.nachname) + " — " + eur(r.annualSavings) + "/Jahr");
    fd.append("from_name", "DIEMA · Automatisierungs-Rechner");
    fd.append("source", "diema/rechner.html");
    fd.append("name", contact.vorname + " " + contact.nachname);
    fd.append("email", contact.email);
    fd.append("telefon", contact.telefon || "");
    fd.append("firma", contact.firma);
    fd.append("position", contact.position || "");
    fd.append("score", String(r.score));
    fd.append("einsparung_jahr", String(Math.round(r.annualSavings)));
    fd.append("message", msg);

    return fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { Accept: "application/json" }, body: fd,
    }).then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (j) { return !(j && j.success === false); })
      .catch(function () { return false; });
  }

  /* -------- Lead-Submit -------- */
  function handleSubmit(e) {
    e.preventDefault();
    var status = $("formStatus");
    status.className = "form-status"; status.textContent = "";

    // Honeypot
    var honey = document.querySelector('input[name="botcheck"]');
    if (honey && honey.value) { return; }

    var contact = {
      vorname: $("lf-vorname").value.trim(),
      nachname: $("lf-nachname").value.trim(),
      firma: $("lf-firma").value.trim(),
      email: $("lf-email").value.trim(),
      telefon: $("lf-telefon").value.trim(),
      position: $("lf-position").value,
    };
    if (!contact.vorname || !contact.nachname || !contact.firma || !/.+@.+\..+/.test(contact.email) || !$("lf-consent").checked) {
      status.className = "form-status err";
      status.textContent = "Bitte füllen Sie Vorname, Nachname, Firma, eine gültige E-Mail aus und bestätigen Sie die Einwilligung.";
      return;
    }

    var btn = $("lf-submit");
    btn.disabled = true; btn.style.opacity = ".7";
    status.className = "form-status"; status.textContent = "Auswertung wird erstellt …";

    var i = lastInputs || readInputs();
    var r = lastResult || compute(i);

    // PDF erzeugen + herunterladen
    var doc = buildPDF(i, r, contact);
    lastPdfDoc = doc;
    var fname = pdfFilename(contact);
    lastPdfName = fname;
    if (doc) {
      try { doc.save(fname); } catch (err) { /* ignore */ }
    }

    // Lead versenden (Erfolg auch ohne Versandbestätigung anzeigen — PDF ist da)
    sendLead(i, r, contact).then(function () {
      finishSuccess(doc, fname);
    }).catch(function () {
      finishSuccess(doc, fname);
    });
  }

  function finishSuccess(doc, fname) {
    $("leadFormWrap").style.display = "none";
    $("leadSuccess").classList.add("show");
    if (!doc) {
      // jsPDF nicht verfügbar → Druckdialog als Fallback
      var s = $("leadSuccess").querySelector("p");
      if (s) s.textContent = "Ihre Auswertung wurde übermittelt. Über den Button können Sie sie als PDF/Ausdruck speichern.";
      var again = $("pdfAgain");
      if (again) again.textContent = "Auswertung drucken / als PDF speichern";
    }
  }

  /* -------- Init -------- */
  function init() {
    var form = $("wizard");
    if (!form) return;

    // Range-Ausgaben
    var aus = $("ausschuss"), ausOut = $("ausschuss-out");
    var rec = $("recruiting"), recOut = $("recruiting-out");
    function syncRanges() {
      ausOut.textContent = aus.value + " %";
      recOut.textContent = RECRUIT_LABEL[rec.value];
    }
    aus.addEventListener("input", syncRanges);
    rec.addEventListener("input", syncRanges);
    syncRanges();

    // Num-Stepper
    document.querySelectorAll("[data-step-btn]").forEach(function (b) {
      b.addEventListener("click", function () {
        var input = $(b.dataset.stepBtn);
        var dir = parseInt(b.dataset.dir, 10);
        var min = parseInt(input.min, 10), max = parseInt(input.max, 10);
        input.value = clamp((parseInt(input.value, 10) || 0) + dir, min, max);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });

    // Live-Update bei jeder Änderung
    form.addEventListener("input", update);
    form.addEventListener("change", update);

    // Wizard-Navigation
    $("btnNext").addEventListener("click", function () { showStep(current + 1, true); });
    $("btnPrev").addEventListener("click", function () { showStep(current - 1, true); });
    $("btnResult").addEventListener("click", revealResults);
    $("panelCta").addEventListener("click", function (e) { e.preventDefault(); revealResults(); });
    document.querySelectorAll("#progress li").forEach(function (li) {
      li.addEventListener("click", function () { showStep(parseInt(li.dataset.step, 10), true); });
    });

    // Lead-Form
    $("leadForm").addEventListener("submit", handleSubmit);
    $("pdfAgain").addEventListener("click", function () {
      if (lastPdfDoc) { lastPdfDoc.save(lastPdfName); }
      else window.print();
    });

    showStep(1);
    update();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
