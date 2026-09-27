# tiny-md

[![Release](https://github.com/aresstack/tiny-md/actions/workflows/release.yml/badge.svg)](https://github.com/aresstack/tiny-md/actions/workflows/release.yml)

Ein Markdown-Viewer und -Editor als **einzelne, offline-fähige HTML-Datei** – gedacht als E-Mail-Anhang: per Doppelklick im Browser startbar, keine Installation, kein Server, kein Netzwerk.

## Download

Die fertige HTML muss nicht selbst gebaut werden – jeder Push auf `main` erzeugt automatisch ein [GitHub-Release](https://github.com/aresstack/tiny-md/releases/latest) mit:

| Datei | Inhalt |
| ----- | ------ |
| `tiny-md.html` | die leere App: öffnet, rendert, bearbeitet und speichert `.md`-Dateien |
| `beispiel.html` | dieselbe App mit fest eingebettetem Beispieldokument |

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

## Selbst bauen

```
npm install
npm run build                    # → dist/tiny-md.html   (leere App)
node build.js pfad/zu/datei.md   # → dist/datei.html     (Markdown fest eingebettet)
```

Der Name der Ausgabedatei ergibt sich aus dem Namen der übergebenen `.md`-Datei. `build.js` inlinet [marked](https://github.com/markedjs/marked) (Rendering) und [DOMPurify](https://github.com/cure53/DOMPurify) (Sanitizing) ins Template – die fertige Datei ist ~90 kB groß und komplett offline nutzbar.

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

---

<sub>© 2026 [AresStack](https://github.com/aresstack)</sub>
