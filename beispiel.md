# Beispieldokument

Dieses Dokument testet das Rendering von **tiny-md** – Umlaute (ä, ö, ü, ß) inklusive.

## Textauszeichnung

*Kursiv*, **fett**, `Inline-Code`, ~~durchgestrichen~~ und ein [Link](https://example.com).

> Ein Blockzitat mit einer zweiten Zeile,
> die weiterläuft.

## Liste & Aufgaben

1. Erster Punkt
2. Zweiter Punkt
   - Unterpunkt
   - Noch einer

- [x] Erledigt
- [ ] Offen

## Tabelle

| Browser | Öffnen | Direkt speichern |
| ------- | ------ | ---------------- |
| Firefox | ✔      | ✖ (Download)     |
| Edge    | ✔      | ✔                |

## SVG

Inline-SVG direkt im Markdown:

<svg width="180" height="60" viewBox="0 0 180 60" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Drei bunte Formen">
  <rect x="8" y="10" width="40" height="40" rx="8" fill="#4c78a8"/>
  <circle cx="90" cy="30" r="21" fill="#f58518"/>
  <polygon points="140,50 160,10 178,50" fill="#54a24b"/>
</svg>

Und als Data-URI-Bild: ![grüner Kreis](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjUiIGZpbGw9IiM1NGEyNGIiLz48L3N2Zz4=)

## Diagramm (Mermaid)

```mermaid
flowchart LR
    A[Markdown] --> B[marked]
    B --> C[DOMPurify]
    C --> D[Vorschau]
    D --> E{Mermaid-Block?}
    E -- ja --> F[SVG-Diagramm]
```

## Code

```js
function greet(name) {
  return `Hallo, ${name}!`;
}
```

Gefährliches HTML wie <script>alert("xss")</script> wird entfernt.

---

Ende.
