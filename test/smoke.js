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
  // Skripte der Seite in Dokumentreihenfolge ausführen
  for (const s of dom.window.document.querySelectorAll("script:not([type])")) {
    dom.window.eval(s.textContent);
  }
  return dom.window;
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
