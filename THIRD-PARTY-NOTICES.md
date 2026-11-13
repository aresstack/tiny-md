# Third-Party-Notices

tiny-md steht unter der [MIT-Lizenz](LICENSE). **Diese gilt nur für den Code von
tiny-md selbst, nicht für die eingebetteten Bibliotheken/Add-ons.** Die gebauten
HTML-Dateien betten folgende Bibliotheken unverändert ein; jede behält ihre eigene
Lizenz, die bei Weitergabe einzuhalten ist (Bezug: npm-Registry, Versionen gemäß
`package-lock.json`); ihre Lizenz- und Copyright-Header bleiben im Build erhalten:

| Bibliothek | Lizenz | Quelle |
| ---------- | ------ | ------ |
| [marked](https://github.com/markedjs/marked) | MIT | © MarkedJS, Christopher Jeffrey |
| [DOMPurify](https://github.com/cure53/DOMPurify) | MPL-2.0 **oder** Apache-2.0 (dual); hier genutzt unter **Apache-2.0** | © Cure53 and other contributors |
| [Mermaid](https://github.com/mermaid-js/mermaid) | MIT | © Knut Sveidqvist + contributors (das Bundle enthält eigene Abhängigkeiten wie d3/dagre unter MIT/ISC, Header im Bundle) |
| [KaTeX](https://github.com/KaTeX/KaTeX) | MIT | © Khan Academy + contributors (inkl. der KaTeX-Schriften, ebenfalls MIT) |
| [Swagger UI](https://github.com/swagger-api/swagger-ui) (`swagger-ui-dist`, nur Swagger-Variante) | Apache-2.0 | © SmartBear Software Inc. (das Bundle enthält eigene Abhängigkeiten wie React/js-yaml unter MIT u. a., Lizenz, NOTICE und Lizenz-Header der Abhängigkeiten werden mit eingebettet) |
| [draw.io-Viewer](https://github.com/jgraph/drawio) (`viewer-static.min.js`, nur draw.io-Variante und Apache-Bundle; nicht auf npm, Bezug: GitHub-Release, Version und SHA-256 in `build.js` gepinnt) | Apache-2.0 | © JGraph Ltd (Lizenztext wird mit eingebettet; Formen- und Iconbibliotheken unterliegen laut draw.io-README zusätzlich einer Nutzungsbeschränkung für Atlassian-Produkte, die tiny-md nicht berührt) |

### Swagger UI (Apache-2.0)

Swagger UI ist nur in den Swagger-Varianten enthalten (`tiny-md-swagger.html`,
`tiny-md-full-apache.html`, `api-beispiel.html`). Swagger UI steht unter der
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); NOTICE:

```
swagger-ui
Copyright 2020-2021 SmartBear Software Inc.
```

Bei Weitergabe dieser Dateien müssen der Apache-2.0-Lizenztext und die NOTICE
mitgegeben werden. Beides ist in die HTML-Dateien eingebettet und liegt dem
Release zusätzlich als `LICENSE-Apache-2.0-SwaggerUI.txt` und
`NOTICE-SwaggerUI.txt` bei.

### draw.io-Viewer (Apache-2.0)

Der draw.io-Viewer ist nur in `tiny-md-drawio.html` und `tiny-md-full-apache.html`
enthalten. Er steht unter der [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
(© JGraph Ltd); draw.io liefert keine NOTICE-Datei. Der Lizenztext ist in die
HTML-Dateien eingebettet und liegt dem Release als `LICENSE-Apache-2.0-drawio.txt` bei.

Nur zur Entwicklung (nicht im Auslieferungsartefakt enthalten):

| Bibliothek | Lizenz |
| ---------- | ------ |
| [jsdom](https://github.com/jsdom/jsdom) | MIT |
