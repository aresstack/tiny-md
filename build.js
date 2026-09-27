#!/usr/bin/env node
/**
 * Baut aus src/template.html eine einzelne, offline-fähige HTML-Datei.
 *
 *   node build.js                 → dist/tiny-md.html          (leere App)
 *   node build.js --mermaid       → dist/tiny-md-mermaid.html  (leere App inkl. Mermaid)
 *   node build.js pfad/notes.md   → dist/notes.html            (Markdown fest eingebettet)
 *
 * Enthält das eingebettete Markdown ```mermaid-Blöcke, wird Mermaid
 * automatisch mit eingebaut (abschaltbar mit --no-mermaid).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const read = p => fs.readFileSync(p, "utf8");

// "</script" darf innerhalb von <script>-Blöcken nie wörtlich auftauchen.
// In JS-Code ist "<\/script" bedeutungsgleich; im Markdown-Block macht die
// App das Escaping beim Laden wieder rückgängig.
const escapeScriptEnd = s => s.replace(/<\/script/gi, "<\\/script");

// String.replace interpretiert "$&" & Co. im Ersatztext – Funktion umgeht das.
const inject = (html, marker, content) => {
  if (!html.includes(marker)) throw new Error(`Platzhalter fehlt im Template: ${marker}`);
  return html.replace(marker, () => content);
};

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--")));
const mdArg = args.find(a => !a.startsWith("--"));

let embeddedMd = "";
let embeddedName = "";

if (mdArg) {
  const mdPath = path.resolve(mdArg);
  embeddedMd = read(mdPath);
  embeddedName = path.basename(mdPath);
}

// Mermaid: per Flag erzwingen/unterdrücken, sonst automatisch anhand des Inhalts
const withMermaid = flags.has("--mermaid") ||
  (!flags.has("--no-mermaid") && /^\s*(`{3,}|~{3,})\s*mermaid\b/m.test(embeddedMd));

const outName = mdArg
  ? path.basename(mdArg, path.extname(mdArg)) + ".html"
  : (withMermaid ? "tiny-md-mermaid.html" : "tiny-md.html");

let html = read(path.join(ROOT, "src", "template.html"));
html = inject(html, "/*__MARKED_JS__*/", escapeScriptEnd(read(path.join(ROOT, "node_modules", "marked", "lib", "marked.umd.js"))));
html = inject(html, "/*__PURIFY_JS__*/", escapeScriptEnd(read(path.join(ROOT, "node_modules", "dompurify", "dist", "purify.min.js"))));
html = inject(html, "/*__MERMAID_JS__*/", withMermaid
  ? escapeScriptEnd(read(path.join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js")))
  : "");
html = inject(html, "__EMBEDDED_FILENAME__", embeddedName.replace(/"/g, "&quot;"));
html = inject(html, "__EMBEDDED_MD__", escapeScriptEnd(embeddedMd));

const outDir = path.join(ROOT, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, outName);
fs.writeFileSync(outPath, html);

const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`✔ ${path.relative(ROOT, outPath)} (${kb} kB)`
  + (embeddedName ? ` – eingebettet: ${embeddedName}` : "")
  + (withMermaid ? " + Mermaid" : ""));
