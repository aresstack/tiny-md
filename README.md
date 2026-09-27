# tiny-md

Ein Markdown-Viewer und -Editor als **einzelne, offline-fähige HTML-Datei** – gedacht als E-Mail-Anhang: per Doppelklick im Browser startbar, keine Installation, kein Server, kein Netzwerk.

## Bauen

```
npm install
npm run build                    # → dist/tiny-md.html   (leere App)
node build.js pfad/zu/datei.md   # → dist/datei.html     (Markdown fest eingebettet)
```

Die gebaute HTML enthält [marked](https://github.com/markedjs/marked) (Rendering) und [DOMPurify](https://github.com/cure53/DOMPurify) (Sanitizing) inline – zusammen ~90 kB.

## Funktionen

- **Lesen:** eingebettetes Markdown wird beim Öffnen sofort sauber gerendert (GFM: Tabellen, Task-Listen, Codeblöcke), hell/dunkel, druckbar
- **Öffnen:** `.md`-Datei per Button (Strg+O) oder Drag & Drop
- **Bearbeiten:** Split-Ansicht Editor/Vorschau (Strg+E), Live-Rendering
- **Speichern** (Strg+S):
  - Edge/Chrome: direkt zurück in die Originaldatei (File System Access API)
  - Firefox: als Download
- Warnung beim Schließen mit ungespeicherten Änderungen

## Projektstruktur

```
src/template.html   – die komplette App (HTML + CSS + JS) mit Platzhaltern
build.js            – inlinet die Libraries und optional ein Markdown-Dokument
test/smoke.js       – lädt die gebauten Dateien in jsdom und prüft das Rendering
beispiel.md         – Testdokument
```

## Testen

```
npm test
```
