# DIEMA GmbH · SM-Stahl — Website

Moderne, barrierefreie und mobiloptimierte Website für die **DIEMA GmbH**
(Marke *SM-Stahl*) — automatisierte Oberflächenbearbeitung & Steuerungstechnik.
Reine **Flat-File-Website** (statisches HTML/CSS/JS, **kein Build-Schritt**,
keine Abhängigkeiten beim Deploy). Einfach hochladen und ausliefern.

Stil und Farben sind aus dem bisherigen Auftritt (sm-stahl.de) abgeleitet
(Teal/Cyan + Slate), jedoch vollständig neu, modern und WCAG-AA-orientiert.

---

## Schnellstart

Es ist **kein Build nötig**. Zum Ansehen genügt ein beliebiger statischer Server:

```bash
# Variante 1
python3 -m http.server 8080
# Variante 2
npx serve .
```

Danach `http://localhost:8080` öffnen. Zum Live-Schalten den Ordnerinhalt auf
das Webhosting (oder GitHub Pages / Netlify / Cloudflare Pages) hochladen.

---

## Projektstruktur

```
diema-gmbh/
├─ index.html                  Startseite
├─ schleifen.html              Verfahren: Schleifen
├─ polieren.html               Verfahren: Polieren
├─ entgraten-gussputzen.html   Verfahren: Entgraten & Gussputzen
├─ scotchen.html               Verfahren: Scotchen
├─ handlingsysteme.html        Verfahren: Handlingsysteme
├─ steuerungstechnik.html      Elektrotechnik: Steuerungstechnik
├─ schaltanlagenbau.html       Elektrotechnik: Schaltanlagenbau
├─ rechner.html                ⭐ Automatisierungs-ROI-Rechner (Lead-Tool)
├─ ansprechpartner.html        Service & Vertrieb
├─ messen.html                 Messen & Termine
├─ jobs.html                   Jobs & Karriere
├─ kontakt.html                Kontaktformular (Web3Forms)
├─ anfahrt.html                Anfahrt / Route
├─ impressum.html              Rechtliches (Platzhalter ergänzen!)
├─ datenschutz.html            Rechtliches (Platzhalter ergänzen!)
├─ css/
│  ├─ styles.css               Design-System (alle Seiten)
│  └─ rechner.css              Stile nur für den Rechner
├─ js/
│  ├─ site.js                  Header/Footer + Navigation (zentral!)
│  └─ rechner.js               Rechner-Logik + PDF + Lead-Versand
├─ favicon.svg
├─ robots.txt
└─ sitemap.xml
```

---

## Inhalte zentral pflegen

**Navigation, Kontaktdaten und Footer** werden aus **einer** Datei erzeugt:
`js/site.js` (oben die Objekte `SITE`, `NAV`, `FOOTER_COLS`).
Eine neue Seite verlinken? → Eintrag in `NAV` ergänzen, fertig auf allen Seiten.

Jede HTML-Seite enthält nur ihren eigentlichen Inhalt plus zwei Platzhalter:
`<div id="site-header"></div>` und `<div id="site-footer"></div>`.

---

## Der Automatisierungs-ROI-Rechner (`rechner.html`)

Ein interaktives Lead-Werkzeug für Einkäufer & Geschäftsführer: In drei
kurzen Schritten (Prozess/Ziel → Team & Kosten → Qualität & Personal)
berechnet es live:

- **Automatisierungs-Score** (0–100)
- **Einsparpotenzial pro Jahr** und **über 5 Jahre**
- **Amortisationszeit** der Investition
- **Wirtschaftlichen Schaden** bei Nicht-Automatisierung (3 Jahre)
- **Kapazitätsgewinn** und **Investitionsrahmen**

Am Ende erhält der Interessent gegen seine Kontaktdaten eine **gebrandete
PDF-Auswertung** (erzeugt lokal im Browser mit *jsPDF*), und der Lead wird
per **Web3Forms** an Ihr Postfach gesendet.

### Wichtig: Lead-Empfänger einstellen
Der Versand nutzt den vorhandenen Web3Forms-Key
(`2df05c94-…`, siehe `js/rechner.js` und das Inline-Skript in `kontakt.html`).
Der Empfänger wird im **Web3Forms-Dashboard** konfiguriert. Soll DIEMA die
Leads direkt erhalten, dort `info@diemagmbh.de` als Empfänger/CC eintragen
oder einen eigenen Web3Forms-Key hinterlegen.

### Rechenmodell
Die Werte sind **branchenübliche Richtwerte** und im UI sowie im PDF klar als
unverbindliche Schätzung gekennzeichnet. Anpassbar in `js/rechner.js`
(Objekt `PROCESS`: Personal-Einsparung, Ausschuss-Faktor, Kapazität,
Investitionsrahmen je Verfahren).

---

## Vor dem Livegang erledigen (Checkliste)

- [ ] **Impressum** ergänzen: Geschäftsführer, Registergericht/HRB, USt-IdNr.
- [ ] **Datenschutzerklärung** juristisch prüfen lassen; Hosting-Anbieter
      und ggf. Auftragsverarbeitung (Web3Forms) eintragen.
- [ ] **Web3Forms-Empfänger** im Dashboard kontrollieren/anpassen.
- [ ] **Echte Fotos** ergänzen (Hero, Verfahren, Referenz-Videos). Aktuell
      sind hochwertige SVG-/Verlaufsgrafiken als Platzhalter gesetzt.
- [ ] **Logo**: aktuell sauberer SVG-Platzhalter. Original-Logo kann in
      `js/site.js` (Funktion `brandMark`) bzw. als Datei ersetzt werden.
- [ ] Optional **Google Fonts lokal hosten** (Datenschutz) statt per CDN.
- [ ] Domain in `sitemap.xml`, `robots.txt` und den `canonical`-Tags prüfen.

---

## Barrierefreiheit & Technik

- Semantisches HTML, Landmarks, Skip-Link, sichtbarer Tastatur-Fokus
- ARIA für Navigation/Dropdowns, `aria-current`, `aria-live` im Rechner
- Kontraste WCAG-AA-orientiert, Basisschrift 17 px, große Touch-Ziele
- `prefers-reduced-motion` wird respektiert
- Mobile-First, responsive bis Desktop
- Externe Laufzeit-Abhängigkeiten nur: Google Fonts (CDN) und jsPDF (CDN,
  nur auf `rechner.html`). Beides bei Bedarf lokal hostbar.
