# Mermaid-Schaufenster

Dieses Dokument zeigt, was **tiny-md** mit eingebautem [Mermaid](https://mermaid.js.org/) rendern kann — komplett offline, alles in einer HTML-Datei. Über **Bearbeiten** (Strg+E) kann man die Diagramm-Quelltexte live verändern.

## Mindmap

```mermaid
mindmap
  root((tiny-md))
    Lesen
      GFM-Tabellen
      Codeblöcke
      Task-Listen
    Bearbeiten
      Split-Ansicht
      Live-Vorschau
    Speichern
      Direkt in die Datei
      Download
    Diagramme
      Mindmaps
      Flowcharts
      Gantt
```

## Flowchart mit Styling

```mermaid
flowchart LR
    A([.md-Datei]) --> B[marked]
    B --> C[DOMPurify]
    C --> D{Mermaid-Block?}
    D -- nein --> E[HTML-Vorschau]
    D -- ja --> F[[SVG-Diagramm]]
    style A fill:#4c78a8,color:#fff
    style F fill:#f58518,color:#fff
    style E fill:#54a24b,color:#fff
```

## Sequenzdiagramm

```mermaid
sequenceDiagram
    participant N as Nutzer
    participant A as tiny-md
    participant D as Datei
    N->>A: Datei ablegen (Drag & Drop)
    A->>D: einlesen
    D-->>A: Markdown
    A-->>N: gerenderte Vorschau
    N->>A: Strg+S
    A->>D: zurückschreiben
```

## Kuchendiagramm

```mermaid
pie showData title Dateigröße nach Bestandteil
    "Mermaid" : 3489
    "marked" : 48
    "DOMPurify" : 32
    "App (HTML/CSS/JS)" : 10
```

## Gantt

```mermaid
gantt
    title Projektplan tiny-md
    dateFormat YYYY-MM-DD
    section Kern
        Grundgerüst          :done, a1, 2026-09-20, 2d
        Öffnen & Speichern   :done, a2, after a1, 2d
    section Ausbau
        Mermaid-Integration  :done, b1, 2026-09-26, 2d
        Schaufenster-Doku    :active, b2, after b1, 1d
```

## Zustandsdiagramm

```mermaid
stateDiagram-v2
    [*] --> Lesen
    Lesen --> Bearbeiten : Strg+E
    Bearbeiten --> Lesen : Strg+E
    Bearbeiten --> Geändert : Eingabe
    Geändert --> Gespeichert : Strg+S
    Gespeichert --> [*]
```

## Timeline

```mermaid
timeline
    title Entstehung
    2026-09-27 : Grundgerüst : Öffnen, Bearbeiten, Speichern
               : GitHub-Release-Workflow
               : Mermaid-Rendering
               : Dieses Schaufenster
```

## Git-Graph

```mermaid
gitGraph
    commit id: "Grundgerüst"
    branch mermaid
    commit id: "Mermaid-Integration"
    commit id: "Willkommens-Diagramm"
    checkout main
    merge mermaid
    commit id: "Release"
```

---

Alle Diagramme entstehen aus einfachen ` ```mermaid `-Codeblöcken im Markdown — die Quelltexte sind im Bearbeiten-Modus sichtbar.
