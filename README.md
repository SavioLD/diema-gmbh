# DIEMA GmbH · SM-Stahl — Website

Moderne, barrierefreie und mobiloptimierte Website für die **DIEMA GmbH**
(Marke *SM-Stahl*) — automatisierte Oberflächenbearbeitung & Steuerungstechnik.

**Flat-File-Website:** statisches HTML/CSS/JS, **kein Build-Schritt**, **alle
Dateien auf einer Ebene** (keine Unterordner). Einfach entpacken und die
Dateien hochladen.

Stil und Farben sind aus dem bisherigen Auftritt (sm-stahl.de) abgeleitet
(Teal/Cyan + Slate), jedoch vollständig neu, modern und WCAG-AA-orientiert.

---

## Schnellstart

Kein Build nötig. Lokal ansehen mit einem beliebigen statischen Server:

```bash
python3 -m http.server 8080      # oder:  npx serve .
```

Dann `http://localhost:8080` öffnen. Zum Live-Schalten alle Dateien auf das
Webhosting (oder GitHub Pages / Netlify / Cloudflare Pages) hochladen.

---

## Dateien (alle flach, eine Ebene)

```
index.html                  Startseite
schleifen.html              Verfahren: Schleifen
polieren.html               Verfahren: Polieren
entgraten-gussputzen.html   Verfahren: Entgraten & Gussputzen
scotchen.html               Verfahren: Scotchen
handlingsysteme.html        Verfahren: Handlingsysteme & Robotic
steuerungstechnik.html      Elektrotechnik: Steuerungstechnik
schaltanlagenbau.html       Elektrotechnik: Schaltanlagenbau
rechner.html                ⭐ Automatisierungs-ROI-Rechner (Lead-Tool)
ansprechpartner.html        Service & Vertrieb (inkl. 24-Std-Notfall-Hotline)
messen.html                 Messen & Termine
jobs.html                   Jobs & Karriere
kontakt.html                Kontaktformular (Web3Forms)
anfahrt.html                Anfahrt / Route
impressum.html              Rechtliches (Platzhalter ergänzen!)
datenschutz.html            Rechtliches (Platzhalter ergänzen!)

styles.css                  Design-System (alle Seiten)
rechner.css                 Stile nur für den Rechner
site.js                     Header/Footer + Navigation (zentral!)
rechner.js                  Rechner-Logik + PDF + Lead-Versand
favicon.svg
robots.txt
sitemap.xml
```

---

## Inhalte zentral pflegen

**Navigation, Kontaktdaten und Footer** werden aus **einer** Datei erzeugt:
`site.js` (oben die Objekte `SITE`, `NAV`, `FOOTER_COLS`). Eine neue Seite
verlinken? → Eintrag in `NAV` ergänzen, gilt automatisch auf allen Seiten.

Jede HTML-Seite enthält nur ihren eigentlichen Inhalt plus zwei Platzhalter:
`<div id="site-header"></div>` und `<div id="site-footer"></div>`.

---

## Der Automatisierungs-ROI-Rechner (`rechner.html`)

Interaktives Lead-Werkzeug für Einkäufer & Geschäftsführer. In drei Schritten
(Prozess/Ziel → Team & Kosten → Qualität & Personal) wird live berechnet:

- **Automatisierungs-Score** (0–100)
- **Einsparpotenzial pro Jahr** und **über 5 Jahre**
- **Amortisationszeit** der Investition
- **Wirtschaftlicher Schaden** bei Nicht-Automatisierung (3 Jahre)
- **Kapazitätsgewinn** und **Investitionsrahmen**

Am Ende erhält der Interessent gegen seine Kontaktdaten eine gebrandete
**PDF-Auswertung** (lokal im Browser via *jsPDF*), und der Lead wird per
**Web3Forms** an Ihr Postfach gesendet.

### Lead-Empfänger einstellen
Der Versand nutzt den vorhandenen Web3Forms-Key (`2df05c94-…`, in `rechner.js`
und im Inline-Skript von `kontakt.html`). Der Empfänger wird im
**Web3Forms-Dashboard** konfiguriert — dort ggf. `info@diemagmbh.de` als
Empfänger/CC eintragen oder einen eigenen Key hinterlegen.

### Rechenmodell
Branchenübliche Richtwerte, im UI und im PDF klar als unverbindliche Schätzung
gekennzeichnet. Anpassbar in `rechner.js` (Objekt `PROCESS`).

---

## Vor dem Livegang erledigen

- [ ] **Impressum** ergänzen: Geschäftsführer, Registergericht/HRB, USt-IdNr.
- [ ] **Datenschutzerklärung** juristisch prüfen; Hosting/Web3Forms eintragen.
- [ ] **Web3Forms-Empfänger** im Dashboard kontrollieren/anpassen.
- [ ] **Echte Fotos** ergänzen (Hero, Verfahren, Referenz-Videos). Aktuell
      hochwertige SVG-/Verlaufsgrafiken als Platzhalter.
- [ ] **Logo** ersetzen (Platzhalter-SVG in `site.js`, Funktion `brandMark`).
- [ ] Optional **Google Fonts lokal hosten** (Datenschutz) statt per CDN.
- [ ] Domain in `sitemap.xml`, `robots.txt` und `canonical`-Tags prüfen.

---

## Barrierefreiheit & Technik

- Semantisches HTML, Landmarks, Skip-Link, sichtbarer Tastatur-Fokus
- ARIA für Navigation/Dropdowns, `aria-current`, `aria-live` im Rechner
- Kontraste WCAG-AA-orientiert, Basisschrift 17 px, große Touch-Ziele
- `prefers-reduced-motion` respektiert · Mobile-First
- Externe Laufzeit-Abhängigkeiten nur: Google Fonts (CDN) und jsPDF (CDN, nur
  auf `rechner.html`) — beides bei Bedarf lokal hostbar.
