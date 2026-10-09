# tiny-md

[![Release](https://github.com/aresstack/tiny-md/actions/workflows/release.yml/badge.svg)](https://github.com/aresstack/tiny-md/actions/workflows/release.yml)

Ein Markdown-Viewer und -Editor als **einzelne, offline-fähige HTML-Datei** – gedacht als E-Mail-Anhang: per Doppelklick im Browser startbar, keine Installation, kein Server, kein Netzwerk.

## Download

Die fertige HTML muss nicht selbst gebaut werden – jeder Push auf `main` erzeugt automatisch ein [GitHub-Release](https://github.com/aresstack/tiny-md/releases/latest) mit allen Varianten:

| Datei | Inhalt |
| ----- | ------ |
| `tiny-md.html` | die leere App (~90 kB): öffnet, rendert, bearbeitet und speichert `.md`-Dateien |
| `tiny-md-mermaid.html` | wie oben, zusätzlich mit [Mermaid](https://mermaid.js.org/)-Diagramm-Rendering (~3,5 MB) |
| `tiny-md-full.html` | Mermaid **und** [KaTeX](https://katex.org/)-Formel-Rendering (~4,3 MB) |
| `beispiel.html` | App mit fest eingebettetem Beispieldokument inkl. Mermaid-Diagramm |
| `diagramme.html` | Mermaid-Schaufenster: Mindmap, Flowchart, Sequenz, Pie, Gantt, State, Timeline, Git-Graph |
| `tiny-md-swagger.html` ¹ | mit [SwaggerUI](https://swagger.io/tools/swagger-ui/): öffnet OpenAPI-/Swagger-Spezifikationen (`.yaml`/`.yml`/`.json`) und zeigt sie direkt an (~1,8 MB) |
| `tiny-md-full-swagger.html` ¹ | Mermaid, KaTeX **und** SwaggerUI (~6 MB) |
| `api-beispiel.html` ¹ | Swagger-Variante mit fest eingebetteter Beispiel-OpenAPI-Spezifikation |
| `LICENSE-Apache-2.0-SwaggerUI.txt`, `NOTICE-SwaggerUI.txt`, `LICENSE-MIT-tiny-md.txt` | Lizenztexte zum Beilegen bei Weitergabe |

¹ enthält SwaggerUI unter Apache-2.0, siehe [Lizenz](#lizenz).

Datei herunterladen, doppelklicken, fertig.

## Funktionen

- **Lesen:** eingebettetes Markdown wird beim Öffnen sofort sauber gerendert (GFM: Tabellen, Task-Listen, Codeblöcke), hell/dunkel, druckbar
- **Öffnen:** `.md`-Datei per Button (Strg+O) oder Drag & Drop
- **Bearbeiten:** Split-Ansicht Editor/Vorschau (Strg+E), Live-Rendering
- **Speichern** (Strg+S):
  - Edge/Chrome: direkt zurück in die Originaldatei (File System Access API)
  - Firefox: als Download
- Warnung beim Schließen mit ungespeicherten Änderungen
- **Bedienung über die Statusleiste unten:** Icon-Buttons für Öffnen, Speichern (Punkt = ungespeicherte Änderungen) und Bearbeiten/Lesen-Umschalter links, Hell/Dunkel mittig, Wort-/Zeichenzahl rechts – keine eigene Toolbar, der Dateiname steht im Fenstertitel
- Fremde Inhalte werden mit DOMPurify bereinigt (kein Script-Injection über geöffnete/eingebettete Dateien)
- **Mermaid-Diagramme** (optional): ` ```mermaid `-Codeblöcke werden als SVG gerendert (`securityLevel: strict`, Theme folgt hell/dunkel); ungültige Diagramme bleiben als Codeblock stehen
- **LaTeX-Formeln** (optional): `$…$` und `$$…$$` werden mit [KaTeX](https://katex.org/) gerendert (Schriften eingebettet, unbekannte Makros erscheinen als roter Fehlertext statt das Dokument zu brechen). Ein eigener Tokenizer schützt Formeln vor der Markdown-Escape-Verarbeitung — `\,`, `\{` & Co. bleiben auch **ohne** KaTeX-Variante unzerstört. Dollar-Beträge (`$5 und $10`) bleiben normaler Text; falls die Heuristik doch anspringt: `\$` schreiben oder `--no-katex` bauen
- **OpenAPI/Swagger** (optional, `tiny-md-swagger.html`): `.yaml`-, `.yml`- oder `.json`-Dateien mit `openapi:`/`swagger:`-Versionsangabe werden per Öffnen oder Drag & Drop mit [SwaggerUI](https://swagger.io/tools/swagger-ui/) angezeigt (OpenAPI 2.0/3.x). Im Bearbeiten-Modus aktualisiert sich die Ansicht live, Speichern schreibt die YAML/JSON-Datei zurück. Hell/Dunkel wird übernommen. In den übrigen Varianten erscheint eine Spezifikation als Codeblock mit Hinweis auf die Swagger-Variante. Hinweis: SwaggerUI rendert Beschreibungen selbst – der „nach Hause telefonieren"-Schutz unten gilt dort nicht; „Try it out" sowie externe `$ref`s (`https://…`) erzeugen bewusst Netzwerkzugriffe.
- **SVG-Grafiken:** funktionieren auf zwei Wegen direkt im Markdown –
  - inline: `<svg …>…</svg>` einfach ins Markdown schreiben (DOMPurify lässt SVG durch, entfernt aber Skripte und Event-Handler)
  - als Bild mit Data-URI: `![Alt-Text](data:image/svg+xml;base64,…)`

  Beides bleibt selbst-enthalten in der einen HTML-Datei. Klassische relative Bildpfade (`![x](bild.svg)`, auch PNG/JPG) funktionieren nur, solange die Bilddatei neben der HTML liegt – für den E-Mail-Anhang-Fall also Inline-SVG oder Data-URIs verwenden. Bekannte Einschränkung: `<style>`-Blöcke *innerhalb* von Inline-SVGs verträgt das Autolinking nicht zuverlässig – Farben dort besser direkt als Attribute setzen (`fill="…"`).
- **Kein „nach Hause telefonieren":** automatisch ladende Fernressourcen werden beim Rendern entfernt – Bilder/Video/Audio mit `http(s)`-URLs, `url()` und `@import` in Styles. Ein fremdes Dokument kann beim Öffnen also keine Lesebestätigung per Tracking-Pixel auslösen. Data-URIs und relative Pfade bleiben erlaubt, normale Links bleiben klickbar (öffnen in neuem Tab).

## Selbst bauen

```
npm install
npm run build                    # → dist/tiny-md.html           (leere App)
node build.js --mermaid          # → dist/tiny-md-mermaid.html   (leere App inkl. Mermaid)
node build.js --katex            # → dist/tiny-md-katex.html     (leere App inkl. KaTeX)
node build.js --mermaid --katex  # → dist/tiny-md-full.html      (beides)
node build.js --swagger          # → dist/tiny-md-swagger.html   (leere App inkl. SwaggerUI)
node build.js --mermaid --katex --swagger  # → dist/tiny-md-full-swagger.html
node build.js pfad/zu/datei.md   # → dist/datei.html             (Markdown fest eingebettet)
node build.js pfad/zu/api.yaml   # → dist/api.html               (OpenAPI-Spezifikation fest eingebettet)
```

Der Name der Ausgabedatei ergibt sich aus dem Namen der übergebenen `.md`-Datei. Enthält das eingebettete Markdown ` ```mermaid `-Blöcke bzw. `$…$`/`$$…$$`-Formeln, werden Mermaid bzw. KaTeX **automatisch** mit eingebaut; erzwingen bzw. unterdrücken lässt sich das mit `--mermaid`/`--no-mermaid` und `--katex`/`--no-katex`. Analog bringt eine eingebettete OpenAPI-Spezifikation (`.yaml`/`.yml`/`.json`) SwaggerUI automatisch mit (`--swagger`/`--no-swagger`); `--swagger` lässt sich mit den anderen Flags kombinieren (z. B. `--mermaid --swagger` → `tiny-md-mermaid-swagger.html`). `build.js` inlinet [marked](https://github.com/markedjs/marked) (Rendering) und [DOMPurify](https://github.com/cure53/DOMPurify) (Sanitizing) ins Template – die fertige Datei ist ~90 kB groß und komplett offline nutzbar.

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
api-beispiel.yaml         – Beispiel-OpenAPI-Spezifikation (→ api-beispiel.html)
.github/workflows/…       – CI: baut, testet und veröffentlicht das Release
```

## Testen

```
npm test
```

Baut beide Varianten und prüft sie in jsdom: Rendering (Überschriften, Tabellen, Code, Task-Listen, Umlaute), XSS-Bereinigung, Dateiname, Editor-Roundtrip.

## Lizenz

Der Code von tiny-md (Template, Build-Skript, Tests) steht unter der [MIT-Lizenz](LICENSE). **Die MIT-Lizenz gilt nicht für die eingebetteten Bibliotheken und Add-ons** – diese behalten ihre eigenen Lizenzen, und eine gebaute HTML-Datei ist ein Gesamtwerk aus tiny-md und diesen Bibliotheken:

| Add-on | Lizenz | in welchen Dateien |
| ------ | ------ | ------------------ |
| marked | MIT | allen |
| DOMPurify | Apache-2.0 (hier gewählt; alternativ MPL-2.0) | allen |
| Mermaid | MIT | `*-mermaid*`, `*-full*`, `beispiel.html`, `diagramme.html` |
| KaTeX (inkl. Schriften) | MIT | `*-katex*`, `*-full*`, `beispiel.html` |
| **SwaggerUI** | **Apache-2.0** | `*-swagger.html`, `api-beispiel.html` |

Alle diese Lizenzen sind mit MIT kombinierbar und erlauben auch kommerzielle Nutzung und Weitergabe. Wer eine Datei weitergibt, muss die Lizenzbedingungen der enthaltenen Bibliotheken einhalten – bei Apache-2.0 heißt das insbesondere: Lizenztext und NOTICE beilegen bzw. erhalten. Die Lizenz-Header der Bibliotheken bleiben in den gebauten HTML-Dateien erhalten; in die Swagger-Varianten werden zusätzlich der vollständige Apache-2.0-Lizenztext, die SwaggerUI-NOTICE und die Lizenz-Header der von SwaggerUI gebündelten Abhängigkeiten eingebettet, und das Release enthält sie zusätzlich als separate Dateien. Details in den [Third-Party-Notices](THIRD-PARTY-NOTICES.md).

---

<sub>© 2026 [AresStack](https://github.com/aresstack)</sub>
