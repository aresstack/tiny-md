# tiny-md

[![Release](https://github.com/aresstack/tiny-md/actions/workflows/release.yml/badge.svg)](https://github.com/aresstack/tiny-md/actions/workflows/release.yml)

Ein Markdown-Viewer und -Editor als **einzelne, offline-fähige HTML-Datei** – gedacht als E-Mail-Anhang: per Doppelklick im Browser startbar, keine Installation, kein Server, kein Netzwerk.

## Download

Die fertige HTML muss nicht selbst gebaut werden – jeder Push auf `main` erzeugt automatisch ein [GitHub-Release](https://github.com/aresstack/tiny-md/releases/latest) mit:

| Datei | Inhalt |
| ----- | ------ |
| `tiny-md.html` | die leere App (~90 kB): öffnet, rendert, bearbeitet und speichert `.md`-Dateien |
| `tiny-md-mermaid.html` | wie oben, zusätzlich mit [Mermaid](https://mermaid.js.org/)-Diagramm-Rendering (~3,5 MB) |
| `beispiel.html` | App mit fest eingebettetem Beispieldokument inkl. Mermaid-Diagramm |
| `diagramme.html` | Mermaid-Schaufenster: Mindmap, Flowchart, Sequenz, Pie, Gantt, State, Timeline, Git-Graph |

Datei herunterladen, doppelklicken, fertig.

## Funktionen

- **Lesen:** eingebettetes Markdown wird beim Öffnen sofort sauber gerendert (GFM: Tabellen, Task-Listen, Codeblöcke), hell/dunkel, druckbar
- **Öffnen:** `.md`-Datei per Button (Strg+O) oder Drag & Drop
- **Bearbeiten:** Split-Ansicht Editor/Vorschau (Strg+E), Live-Rendering
- **Speichern** (Strg+S):
  - Edge/Chrome: direkt zurück in die Originaldatei (File System Access API)
  - Firefox: als Download
- Warnung beim Schließen mit ungespeicherten Änderungen
- Fremde Inhalte werden mit DOMPurify bereinigt (kein Script-Injection über geöffnete/eingebettete Dateien)
- **Mermaid-Diagramme** (optional): ` ```mermaid `-Codeblöcke werden als SVG gerendert (`securityLevel: strict`, Theme folgt hell/dunkel); ungültige Diagramme bleiben als Codeblock stehen
- **SVG-Grafiken:** funktionieren auf zwei Wegen direkt im Markdown –
  - inline: `<svg …>…</svg>` einfach ins Markdown schreiben (DOMPurify lässt SVG durch, entfernt aber Skripte und Event-Handler)
  - als Bild mit Data-URI: `![Alt-Text](data:image/svg+xml;base64,…)`

  Beides bleibt selbst-enthalten in der einen HTML-Datei. Klassische relative Bildpfade (`![x](bild.svg)`, auch PNG/JPG) rendern zwar, funktionieren aber nur, solange die Bilddatei neben der HTML liegt – für den E-Mail-Anhang-Fall also Inline-SVG oder Data-URIs verwenden.

## Selbst bauen

```
npm install
npm run build                    # → dist/tiny-md.html           (leere App)
node build.js --mermaid          # → dist/tiny-md-mermaid.html   (leere App inkl. Mermaid)
node build.js pfad/zu/datei.md   # → dist/datei.html             (Markdown fest eingebettet)
```

Der Name der Ausgabedatei ergibt sich aus dem Namen der übergebenen `.md`-Datei. Enthält das eingebettete Markdown ` ```mermaid `-Blöcke, wird Mermaid **automatisch** mit eingebaut; erzwingen bzw. unterdrücken lässt sich das mit `--mermaid` / `--no-mermaid`. `build.js` inlinet [marked](https://github.com/markedjs/marked) (Rendering) und [DOMPurify](https://github.com/cure53/DOMPurify) (Sanitizing) ins Template – die fertige Datei ist ~90 kB groß und komplett offline nutzbar.

### Eigenes Dokument als Anhang verschicken

```
node build.js bericht.md
```

→ `dist/bericht.html` enthält App **und** Dokument und kann direkt als E-Mail-Anhang verschickt werden. Die Empfängerseite braucht nur einen Browser.

## In einer Pipeline verwenden (Dokumente statt PDF ausliefern)

Der typische Ablauf „Markdown schreiben → am Ende PDF erzeugen" lässt sich ersetzen durch: **Markdown in tiny-md einbetten und die HTML ausliefern**. Der Empfänger braucht nur einen Browser, bekommt aber ein durchsuchbares, druckbares Dokument mit Hell/Dunkel-Modus und ggf. Mermaid-Diagrammen — und kann es bei Bedarf sogar weiterbearbeiten. (PDF geht zur Not immer noch: Drucken → „Als PDF speichern", die Toolbar wird dabei automatisch ausgeblendet.)

tiny-md wird dazu einfach als Werkzeug mit ausgecheckt; `--out=` legt das Ergebnis an einen beliebigen Ort:

```yaml
# .github/workflows/docs.yml im eigenen Dokumentations-Repo
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with:
          repository: aresstack/tiny-md
          path: .tiny-md
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci --prefix .tiny-md
      - run: node .tiny-md/build.js docs/handbuch.md --out=out/handbuch.html
      - uses: actions/upload-artifact@v4
        with:
          name: handbuch
          path: out/handbuch.html
```

Statt des Artifacts kann der letzte Schritt die HTML natürlich auch an ein Release hängen (`gh release upload`), auf GitHub Pages veröffentlichen oder per Mail verschicken. Mehrere Dokumente: einfach `build.js` pro `.md`-Datei aufrufen — enthält ein Dokument Mermaid-Blöcke, wird die Diagramm-Library automatisch mit eingebettet, sonst bleibt die Datei bei ~90 kB.

## Projektstruktur

```
src/template.html         – die komplette App (HTML + CSS + JS) mit Platzhaltern
build.js                  – inlinet die Libraries und optional ein Markdown-Dokument
test/smoke.js             – lädt die gebauten Dateien in jsdom und prüft das Rendering
beispiel.md               – Testdokument
.github/workflows/…       – CI: baut, testet und veröffentlicht das Release
```

## Testen

```
npm test
```

Baut beide Varianten und prüft sie in jsdom: Rendering (Überschriften, Tabellen, Code, Task-Listen, Umlaute), XSS-Bereinigung, Dateiname, Editor-Roundtrip.

## Lizenz

[MIT](LICENSE). Die eingebetteten Bibliotheken (marked: MIT, DOMPurify: Apache-2.0/MPL-2.0 dual, Mermaid: MIT) sind MIT-kompatibel; Details in den [Third-Party-Notices](THIRD-PARTY-NOTICES.md). Die Lizenz-Header der Bibliotheken bleiben in den gebauten HTML-Dateien erhalten.

---

<sub>© 2026 [AresStack](https://github.com/aresstack)</sub>
