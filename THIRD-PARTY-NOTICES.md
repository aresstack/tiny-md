# Third-Party-Notices

tiny-md steht unter der [MIT-Lizenz](LICENSE). Die gebauten HTML-Dateien betten
folgende Bibliotheken unverändert ein (Bezug: npm-Registry, Versionen gemäß
`package-lock.json`); ihre Lizenz- und Copyright-Header bleiben im Build erhalten:

| Bibliothek | Lizenz | Quelle |
| ---------- | ------ | ------ |
| [marked](https://github.com/markedjs/marked) | MIT | © MarkedJS, Christopher Jeffrey |
| [DOMPurify](https://github.com/cure53/DOMPurify) | MPL-2.0 **oder** Apache-2.0 (dual); hier genutzt unter **Apache-2.0** | © Cure53 and other contributors |
| [Mermaid](https://github.com/mermaid-js/mermaid) | MIT | © Knut Sveidqvist + contributors (das Bundle enthält eigene Abhängigkeiten wie d3/dagre unter MIT/ISC, Header im Bundle) |
| [KaTeX](https://github.com/KaTeX/KaTeX) | MIT | © Khan Academy + contributors (inkl. der KaTeX-Schriften, ebenfalls MIT) |
| [Swagger UI](https://github.com/swagger-api/swagger-ui) (`swagger-ui-dist`, nur Swagger-Variante) | Apache-2.0 | © SmartBear Software Inc. (das Bundle enthält eigene Abhängigkeiten wie React/js-yaml unter MIT u. a., Lizenz, NOTICE und Lizenz-Header der Abhängigkeiten werden mit eingebettet) |

Nur zur Entwicklung (nicht im Auslieferungsartefakt enthalten):

| Bibliothek | Lizenz |
| ---------- | ------ |
| [jsdom](https://github.com/jsdom/jsdom) | MIT |
