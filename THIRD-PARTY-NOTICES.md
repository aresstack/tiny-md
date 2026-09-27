# Third-Party-Notices

tiny-md steht unter der [MIT-Lizenz](LICENSE). Die gebauten HTML-Dateien betten
folgende Bibliotheken unverändert ein (Bezug: npm-Registry, Versionen gemäß
`package-lock.json`); ihre Lizenz- und Copyright-Header bleiben im Build erhalten:

| Bibliothek | Lizenz | Quelle |
| ---------- | ------ | ------ |
| [marked](https://github.com/markedjs/marked) | MIT | © MarkedJS, Christopher Jeffrey |
| [DOMPurify](https://github.com/cure53/DOMPurify) | MPL-2.0 **oder** Apache-2.0 (dual); hier genutzt unter **Apache-2.0** | © Cure53 and other contributors |
| [Mermaid](https://github.com/mermaid-js/mermaid) | MIT | © Knut Sveidqvist + contributors (das Bundle enthält eigene Abhängigkeiten wie d3/dagre unter MIT/ISC, Header im Bundle) |

Nur zur Entwicklung (nicht im Auslieferungsartefakt enthalten):

| Bibliothek | Lizenz |
| ---------- | ------ |
| [jsdom](https://github.com/jsdom/jsdom) | MIT |
