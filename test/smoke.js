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
  check("beispiel: Dateiname angezeigt", w.document.title.includes("beispiel.md"));
  check("beispiel: Umlaute intakt", preview.innerHTML.includes("Umlaute (ä, ö, ü, ß)"));
  check("beispiel: startet im Lesemodus", w.document.body.classList.contains("mode-read"));
  check("beispiel: Mermaid-Block vorhanden (Diagramm oder Code-Fallback)",
    preview.querySelector(".mermaid-diagram, code.language-mermaid") !== null);
  check("beispiel: KaTeX-Formeln gerendert", preview.querySelectorAll(".katex").length >= 2);
  check("beispiel: LaTeX nicht von Markdown zerstört (\\, überlebt)", !preview.textContent.includes("G,x"));
  check("beispiel: Dollar-Beträge bleiben Text", preview.textContent.includes("$5"));
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
  check("leer: Speichern-Button zeigt ungespeicherte Änderungen", w.document.getElementById("btn-save").classList.contains("modified"));
  check("leer: keine obere Toolbar mehr", w.document.getElementById("toolbar") === null);
  const btnEdit = w.document.getElementById("btn-edit");
  btnEdit.click();
  check("leer: Bearbeiten-Toggle aktiviert Editor", w.document.body.classList.contains("mode-edit") && btnEdit.getAttribute("aria-pressed") === "true");
  btnEdit.click();
  check("leer: Bearbeiten-Toggle zurück zum Lesen", w.document.body.classList.contains("mode-read") && btnEdit.getAttribute("aria-pressed") === "false");
}

/* ---------- Sanitisierung: bösartiges / „nach Hause telefonierendes" Markdown ---------- */
(async () => {
  const w = loadApp("tiny-md.html");
  const editor = w.document.getElementById("editor");
  editor.value = [
    '<svg onload="alert(1)" width="10" height="10"><script>alert(2)<' + '/script><rect width="5" height="5" onclick="alert(3)"/></svg>',
    "",
    "![tracker](https://example.com/track.png)",
    "",
    '<p style="color:red;background:url(https://example.com/x.png)">Absatz</p>',
    "",
    '<style>@import "https://example.com/evil.css"; b{background:url(https://example.com/y.png)}</style>',
    "",
    "![ok](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=)",
  ].join("\n");
  editor.dispatchEvent(new w.Event("input", { bubbles: true }));
  await new Promise(r => setTimeout(r, 300)); // Debounce der Vorschau abwarten

  const preview = w.document.getElementById("preview");
  const html = preview.innerHTML;
  check("sanitize: kein <script> im SVG", preview.querySelector("script") === null);
  check("sanitize: keine Event-Handler", preview.querySelector("[onload], [onclick]") === null);
  check("sanitize: SVG selbst bleibt erhalten", preview.querySelector("svg rect") !== null);
  check("sanitize: Fernbild entfernt", preview.querySelector('img[src*="//"]') === null);
  check("sanitize: keine Fern-URL im Ergebnis", !html.includes("example.com"));
  check("sanitize: data-URI-Bild bleibt", preview.querySelector('img[src^="data:image/svg+xml"]') !== null);

  /* ---------- Drag & Drop: Datei wird nach dem Ablegen geöffnet ---------- */
  {
    const wd = loadApp("tiny-md.html");
    const file = new wd.File(["# Abgelegt"], "drop.md", { type: "text/markdown" });
    // Wie im Browser: DataTransfer ist nur während des synchronen Dispatch lesbar
    const dt = {
      files: [file],
      items: [{ kind: "file", getAsFileSystemHandle: () => Promise.resolve({ kind: "file", name: "drop.md" }) }],
    };
    const ev = new wd.Event("drop", { bubbles: true, cancelable: true });
    ev.dataTransfer = dt;
    wd.document.dispatchEvent(ev);
    dt.files = []; dt.items = [];
    await new Promise(r => setTimeout(r, 100));
    check("drop: abgelegte Datei geöffnet", /<h1[^>]*>Abgelegt<\/h1>/.test(wd.document.getElementById("preview").innerHTML),
      wd.document.getElementById("preview").innerHTML.slice(0, 120));
    check("drop: Dateiname übernommen", wd.document.title.includes("drop.md"));
  }

  /* ---------- Markdown-Paket: Bilder aus ZIP und abgelegtem Ordner ---------- */
  {
    // Gespeichertes ZIP (ohne Kompression) wie das Markdown-Paket von Space Harvester
    const zipOf = files => {
      const parts = [], dir = [];
      let offset = 0;
      for (const [name, data] of files) {
        const n = Buffer.from(name, "utf8"), d = Buffer.from(data);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6);
        local.writeUInt32LE(d.length, 18); local.writeUInt32LE(d.length, 22); local.writeUInt16LE(n.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
        central.writeUInt16LE(0x800, 8); central.writeUInt32LE(d.length, 20); central.writeUInt32LE(d.length, 24);
        central.writeUInt16LE(n.length, 28); central.writeUInt32LE(offset, 42);
        parts.push(local, n, d); dir.push(central, n);
        offset += 30 + n.length + d.length;
      }
      const dirBuf = Buffer.concat(dir), end = Buffer.alloc(22);
      end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
      end.writeUInt32LE(dirBuf.length, 12); end.writeUInt32LE(offset, 16);
      return Buffer.concat([...parts, dirBuf, end]);
    };
    const md = "# Paket\n\n![Bild](assets/a%20b.png)\n\n[Bericht](attachments/1/bericht.pdf) [Web](https://example.org)\n\n![Fehlt](assets/fehlt.png)";
    const withBlobs = w => {
      let n = 0;
      w.URL.createObjectURL = () => "blob:null/" + (++n);
      w.URL.revokeObjectURL = () => {};
      if (!w.TextDecoder) w.TextDecoder = TextDecoder;
      return w;
    };
    const drop = (w, file, item) => {
      const ev = new w.Event("drop", { bubbles: true, cancelable: true });
      ev.dataTransfer = { files: [file], items: [item] };
      w.document.dispatchEvent(ev);
    };

    const wz = withBlobs(loadApp("tiny-md.html"));
    const zip = zipOf([["pages.md", md], ["assets/a b.png", "PNG"], ["attachments/1/bericht.pdf", "%PDF"]]);
    drop(wz, new wz.File([zip], "export-markdown.zip", { type: "application/zip" }), { kind: "file" });
    await new Promise(r => setTimeout(r, 300));
    const pz = wz.document.getElementById("preview");
    check("zip: pages.md geöffnet", /<h1[^>]*>Paket<\/h1>/.test(pz.innerHTML), pz.innerHTML.slice(0, 160));
    check("zip: Bild zeigt auf Datei im ZIP", (pz.querySelector('img[alt="Bild"]') || {}).src === "blob:null/1",
      pz.innerHTML.slice(0, 400));
    const link = pz.querySelector("a[download]");
    check("zip: Anhang verlinkt", link && link.getAttribute("href").startsWith("blob:") && link.download === "bericht.pdf");
    check("zip: fehlendes Bild bleibt relativ", pz.querySelector('img[alt="Fehlt"]').getAttribute("src") === "assets/fehlt.png");
    check("zip: Weblink bleibt", pz.querySelector('a[href="https://example.org"]') !== null);
    check("zip: Dateiname pages.md", wz.document.title.includes("pages.md"));

    // Entpackter Ordner, per Drag & Drop abgelegt
    const wo = withBlobs(loadApp("tiny-md.html"));
    const fileEntry = (name, data) => ({ isFile: true, isDirectory: false, name,
      file: ok => ok(new wo.File([data], name)) });
    const dirEntry = (name, children) => ({ isFile: false, isDirectory: true, name, createReader() {
      let done = false;
      return { readEntries: ok => { const batch = done ? [] : children; done = true; ok(batch); } };
    } });
    const folder = dirEntry("MoeVe", [fileEntry("pages.md", md),
      dirEntry("assets", [fileEntry("a b.png", "PNG")])]);
    drop(wo, new wo.File([""], "MoeVe"), { kind: "file", webkitGetAsEntry: () => folder });
    await new Promise(r => setTimeout(r, 300));
    const po = wo.document.getElementById("preview");
    check("ordner: pages.md geöffnet", /<h1[^>]*>Paket<\/h1>/.test(po.innerHTML), po.innerHTML.slice(0, 160));
    check("ordner: Bild zeigt auf Datei im Ordner", (po.querySelector('img[alt="Bild"]') || {}).src === "blob:null/1",
      po.innerHTML.slice(0, 400));

    // Danach eine einzelne .md: keine Dateien des Pakets mehr
    drop(wo, new wo.File([md], "einzeln.md"), { kind: "file" });
    await new Promise(r => setTimeout(r, 200));
    check("einzeln: relative Pfade bleiben, wie sie sind",
      wo.document.querySelector('#preview img[alt="Bild"]').getAttribute("src") === "assets/a%20b.png");
  }

  /* ---------- Mathe: Roundtrip über den Editor-Eingabepfad ---------- */
  {
    const wk = loadApp("tiny-md-katex.html");
    const ed = wk.document.getElementById("editor");
    ed.value = "$$G\\,x(t) = G\\,s(t) + G\\,n(t)$$ und inline $\\lambda\\,\\mathrm{m}$";
    ed.dispatchEvent(new wk.Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    const pk = wk.document.getElementById("preview");
    check("katex: Formeln gerendert", pk.querySelectorAll(".katex").length >= 2);
    check("katex: \\, wird nicht zu Komma zerstört", !pk.textContent.includes("G,x"));
  }
  {
    const ws = loadApp("tiny-md.html");
    const ed = ws.document.getElementById("editor");
    ed.value = "Formel $\\lambda\\,x$ Ende";
    ed.dispatchEvent(new ws.Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    const ps = ws.document.getElementById("preview");
    check("schlank: Mathe bleibt wörtlich samt Backslashes erhalten",
      ps.textContent.includes("$\\lambda\\,x$"));
  }
  /* ---------- OpenAPI / SwaggerUI ---------- */
  check("tiny-md.html enthält kein SwaggerUI", !fs.readFileSync(path.join(__dirname, "..", "dist", "tiny-md.html"), "utf8").includes(".swagger-ui "));
  check("tiny-md-swagger.html enthält SwaggerUI", distSize("tiny-md-swagger.html") > 1_000_000);
  for (const f of ["tiny-md-swagger.html", "tiny-md-full-apache.html", "api-beispiel.html"]) {
    const h = fs.readFileSync(path.join(__dirname, "..", "dist", f), "utf8");
    check(`${f}: Apache-2.0-Lizenztext + NOTICE eingebettet`,
      h.includes("Apache License") && h.includes("SmartBear Software"));
  }
  /* ---------- Lizenz-Bundles ---------- */
  {
    const mit = fs.readFileSync(path.join(__dirname, "..", "dist", "tiny-md-full-mit.html"), "utf8");
    check("full-mit: kein SwaggerUI (keine Apache-2.0-Plugins)", !mit.includes(".swagger-ui ") && !mit.includes("SmartBear Software"));
    check("full-mit: Mermaid + KaTeX enthalten", distSize("tiny-md-full-mit.html") > 4_000_000);
    check("full-apache: Mermaid + KaTeX + SwaggerUI enthalten", distSize("tiny-md-full-apache.html") > 5_000_000);
    const wm = loadApp("tiny-md-full-mit.html");
    check("full-mit: App startet", /<h1[^>]*>tiny-md<\/h1>/.test(wm.document.getElementById("preview").innerHTML));
  }
  {
    const wa = loadApp("api-beispiel.html");
    await new Promise(r => setTimeout(r, 1500)); // SwaggerUI parst/resolvt asynchron
    const sw = wa.document.getElementById("swagger");
    check("openapi: Swagger-Ansicht aktiv", wa.document.body.classList.contains("view-openapi"));
    const title = sw.querySelector(".info .title");
    check("openapi: Titel aus Spezifikation gerendert", title && title.textContent.includes("Notizen-API"),
      sw.textContent.slice(0, 200));
    check("openapi: alle 4 Operationen gerendert", sw.querySelectorAll(".opblock").length === 4,
      sw.querySelectorAll(".opblock").length);
    check("openapi: Dateiname angezeigt", wa.document.title.includes("api-beispiel.yaml"));

    // Live-Bearbeitung: Titel im Editor ändern → SwaggerUI aktualisiert sich
    const ed = wa.document.getElementById("editor");
    ed.value = ed.value.replace("Notizen-API (Beispiel)", "Geänderte API");
    ed.dispatchEvent(new wa.Event("input", { bubbles: true }));
    await new Promise(r => setTimeout(r, 1500));
    const t2 = sw.querySelector(".info .title");
    check("openapi: Live-Update nach Bearbeitung", t2 && t2.textContent.includes("Geänderte API"));
  }
  {
    // Ohne SwaggerUI: Spezifikation als Codeblock mit Hinweis statt kaputtem Markdown
    const wp = loadApp("api-ohne-swagger.html");
    const pp = wp.document.getElementById("preview");
    check("ohne swagger: YAML als Codeblock", pp.querySelector("pre code.language-yaml") !== null);
    check("ohne swagger: Hinweis auf Swagger-Variante", pp.textContent.includes("tiny-md-swagger.html"));
  }

  check("tiny-md-katex.html enthält KaTeX + Fonts", distSize("tiny-md-katex.html") > 500_000);
  check("tiny-md-full.html enthält Mermaid + KaTeX", distSize("tiny-md-full.html") > 4_000_000);

  console.log(failures ? `\n${failures} Fehler` : "\nAlle Prüfungen bestanden");
  process.exit(failures ? 1 : 0);
})();
