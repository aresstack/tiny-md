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
