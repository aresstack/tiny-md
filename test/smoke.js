/**
 * Smoke-Test: lädt die gebauten HTML-Dateien in jsdom und prüft,
 * dass die App startet und Markdown korrekt (und sicher) rendert.
 *
 *   node build.js && node build.js beispiel.md && node test/smoke.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? "✔" : "✘"} ${name}` + (ok ? "" : ` – ${detail}`));
  if (!ok) failures++;
}

function loadApp(file) {
  const html = fs.readFileSync(path.join(__dirname, "..", "dist", file), "utf8");
  const dom = new JSDOM(html, {
    url: "file:///" + file,
    runScripts: "outside-only",
    pretendToBeVisual: true,
  });
  // jsdom kennt matchMedia nicht – minimaler Polyfill vor App-Start
  dom.window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  // Skripte der Seite in Dokumentreihenfolge ausführen. Einzeln abgesichert:
  // das Mermaid-Bundle braucht Browser-APIs, die jsdom teils fehlen – die App
  // selbst muss auch dann noch starten (hasMermaid-Fallback).
  for (const s of dom.window.document.querySelectorAll("script:not([type])")) {
    try { dom.window.eval(s.textContent); } catch (_) {}
  }
  return dom.window;
}

function distSize(file) {
  return fs.statSync(path.join(__dirname, "..", "dist", file)).size;
}

/* ---------- dist/beispiel.html (eingebettetes Dokument) ---------- */
{
  const w = loadApp("beispiel.html");
  const preview = w.document.getElementById("preview");
  check("beispiel: H1 gerendert", /<h1[^>]*>Beispieldokument<\/h1>/.test(preview.innerHTML), preview.innerHTML.slice(0, 200));
  check("beispiel: Tabelle gerendert", preview.querySelector("table td") !== null);
  check("beispiel: Codeblock gerendert", preview.querySelector("pre code") !== null);
  check("beispiel: Task-Checkbox gerendert", preview.querySelector('input[type="checkbox"]') !== null);
  check("beispiel: XSS-Skript entfernt", preview.querySelector("script") === null && !preview.innerHTML.includes("alert("));
  check("beispiel: Dateiname angezeigt", w.document.getElementById("file-label").textContent.includes("beispiel.md"));
  check("beispiel: Umlaute intakt", preview.innerHTML.includes("Umlaute (ä, ö, ü, ß)"));
  check("beispiel: startet im Lesemodus", w.document.body.classList.contains("mode-read"));
  check("beispiel: Mermaid-Block vorhanden (Diagramm oder Code-Fallback)",
    preview.querySelector(".mermaid-diagram, code.language-mermaid") !== null);
  check("beispiel: Inline-SVG gerendert", preview.querySelector("svg rect") !== null);
  check("beispiel: Data-URI-SVG-Bild gerendert",
    preview.querySelector('img[src^="data:image/svg+xml"]') !== null);
  check("beispiel: Mermaid automatisch eingebettet (Dateigröße)", distSize("beispiel.html") > 2_000_000);
}

/* ---------- dist/diagramme.html (Mermaid-Schaufenster) ---------- */
{
  const w = loadApp("diagramme.html");
  const preview = w.document.getElementById("preview");
  check("diagramme: H1 gerendert", /Mermaid-Schaufenster/.test(preview.innerHTML));
  // In jsdom bleiben die Blöcke als Code-Fallback stehen; im Browser werden sie zu SVG
  check("diagramme: alle 8 Mermaid-Blöcke vorhanden",
    preview.querySelectorAll(".mermaid-diagram, code.language-mermaid").length === 8);
  check("diagramme: Mermaid eingebettet (Dateigröße)", distSize("diagramme.html") > 2_000_000);
}

/* ---------- Build-Varianten: Mermaid nur wo bestellt ---------- */
check("tiny-md.html bleibt schlank (ohne Mermaid)", distSize("tiny-md.html") < 500_000);
check("tiny-md-mermaid.html enthält Mermaid", distSize("tiny-md-mermaid.html") > 2_000_000);
{
  const w = loadApp("tiny-md-mermaid.html");
  const preview = w.document.getElementById("preview");
  check("mermaid-variante: App startet", /<h1[^>]*>tiny-md<\/h1>/.test(preview.innerHTML));
}

/* ---------- dist/tiny-md.html (leere App) ---------- */
{
  const w = loadApp("tiny-md.html");
  const preview = w.document.getElementById("preview");
  check("leer: Willkommenstext gerendert", /<h1[^>]*>tiny-md<\/h1>/.test(preview.innerHTML), preview.innerHTML.slice(0, 200));
  check("leer: kein Platzhalter sichtbar", !w.document.documentElement.outerHTML.includes("__EMBEDDED_MD__"));

  // Editor-Roundtrip: Eingabe → State → (sofortiges) Rendering
  const editor = w.document.getElementById("editor");
  editor.value = "## Neu getippt";
  editor.dispatchEvent(new w.Event("input", { bubbles: true }));
  check("leer: Eingabe markiert Dokument als geändert", w.document.title.startsWith("●"));
}

console.log(failures ? `\n${failures} Fehler` : "\nAlle Prüfungen bestanden");
process.exit(failures ? 1 : 0);
