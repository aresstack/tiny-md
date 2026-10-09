#!/usr/bin/env node
/**
 * Baut aus src/template.html eine einzelne, offline-fähige HTML-Datei.
 *
 *   node build.js                 → dist/tiny-md.html          (leere App)
 *   node build.js --mermaid       → dist/tiny-md-mermaid.html  (leere App inkl. Mermaid)
 *   node build.js --swagger       → dist/tiny-md-swagger.html  (leere App inkl. SwaggerUI)
 *   node build.js pfad/notes.md   → dist/notes.html            (Markdown fest eingebettet)
 *   node build.js pfad/api.yaml   → dist/api.html              (OpenAPI-Spezifikation fest eingebettet)
 *
 * Enthält das eingebettete Markdown ```mermaid-Blöcke bzw. $…$/$$…$$-Mathe,
 * werden Mermaid bzw. KaTeX automatisch mit eingebaut (abschaltbar mit
 * --no-mermaid / --no-katex; erzwingbar mit --mermaid / --katex; beide
 * Flags zusammen ergeben bei leerer App tiny-md-full.html).
 * Eine eingebettete .yaml/.yml/.json-Datei mit openapi:/swagger:-Version
 * bringt automatisch SwaggerUI mit (--no-swagger / --swagger analog).
 *
 * --out=pfad/datei.html schreibt das Ergebnis an einen beliebigen Ort
 * (für Pipelines, die tiny-md nur als Werkzeug auschecken).
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

// OpenAPI-Spezifikation statt Markdown? (gleiche Erkennung wie isOpenApi() im Template)
const isSpecFile = /\.(ya?ml|json)$/i.test(embeddedName);
const isOpenApi = isSpecFile &&
  /(^|[{,]\s*)["']?(openapi|swagger)["']?\s*:\s*["']?\d/m.test(embeddedMd);

// Mermaid/KaTeX/SwaggerUI: per Flag erzwingen/unterdrücken, sonst automatisch anhand des Inhalts
const withMermaid = flags.has("--mermaid") ||
  (!flags.has("--no-mermaid") && !isSpecFile && /^\s*(`{3,}|~{3,})\s*mermaid\b/m.test(embeddedMd));
const withSwagger = flags.has("--swagger") || (!flags.has("--no-swagger") && isOpenApi);
const withKatex = flags.has("--katex") ||
  (!flags.has("--no-katex") && !isSpecFile &&
    (/\$\$[\s\S]+?\$\$/.test(embeddedMd) || /(^|[^\\$])\$\S[^$\n]*\$/m.test(embeddedMd)));

// KaTeX-CSS: pro @font-face nur den woff2-Eintrag behalten, Font als data:-URI einbetten
function katexCss() {
  const dist = path.join(ROOT, "node_modules", "katex", "dist");
  return read(path.join(dist, "katex.min.css")).replace(/src:[^;}]+/g, srcDecl => {
    const m = /url\((fonts\/[^)]+\.woff2)\)\s*format\(["']?woff2["']?\)/.exec(srcDecl);
    if (!m) return srcDecl;
    const data = fs.readFileSync(path.join(dist, m[1])).toString("base64");
    return `src:url(data:font/woff2;base64,${data}) format("woff2")`;
  });
}

// SwaggerUI-CSS: Source-Map-Verweis entfernen (würde in DevTools nachladen)
const swaggerDist = path.join(ROOT, "node_modules", "swagger-ui-dist");
const stripSourceMap = s => s.replace(/\/[*\/]# sourceMappingURL=[^\n*]*(\*\/)?/g, "");

// Das Bundle verweist für Lizenzen auf eine Begleitdatei – Lizenz, NOTICE und
// die Lizenz-Header der gebündelten Abhängigkeiten daher direkt mit einbetten
function swaggerJs() {
  const comment = s => "/*!\n" + s.replace(/\*\//g, "* /") + "\n*/\n";
  return comment(read(path.join(swaggerDist, "NOTICE")) + "\n" + read(path.join(swaggerDist, "LICENSE")))
    + read(path.join(swaggerDist, "swagger-ui-bundle.js.LICENSE.txt")) + "\n"
    + stripSourceMap(read(path.join(swaggerDist, "swagger-ui-bundle.js")));
}

const outArg = args.find(a => a.startsWith("--out="));
const outName = mdArg
  ? path.basename(mdArg, path.extname(mdArg)) + ".html"
  : (withMermaid && withKatex ? "tiny-md-full"
    : withMermaid ? "tiny-md-mermaid"
    : withKatex ? "tiny-md-katex"
    : "tiny-md") + (withSwagger ? "-swagger" : "") + ".html";

let html = read(path.join(ROOT, "src", "template.html"));
html = inject(html, "/*__MARKED_JS__*/", escapeScriptEnd(read(path.join(ROOT, "node_modules", "marked", "lib", "marked.umd.js"))));
html = inject(html, "/*__PURIFY_JS__*/", escapeScriptEnd(read(path.join(ROOT, "node_modules", "dompurify", "dist", "purify.min.js"))));
html = inject(html, "/*__MERMAID_JS__*/", withMermaid
  ? escapeScriptEnd(read(path.join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js")))
  : "");
html = inject(html, "/*__KATEX_JS__*/", withKatex
  ? escapeScriptEnd(read(path.join(ROOT, "node_modules", "katex", "dist", "katex.min.js")))
  : "");
html = inject(html, "/*__KATEX_CSS__*/", withKatex ? katexCss() : "");
html = inject(html, "/*__SWAGGER_JS__*/", withSwagger ? escapeScriptEnd(swaggerJs()) : "");
html = inject(html, "/*__SWAGGER_CSS__*/", withSwagger
  ? stripSourceMap(read(path.join(swaggerDist, "swagger-ui.css"))).replace(/<\/style/gi, "<\\/style")
  : "");
html = inject(html, "__EMBEDDED_FILENAME__", embeddedName.replace(/"/g, "&quot;"));
html = inject(html, "__EMBEDDED_MD__", escapeScriptEnd(embeddedMd));

const outPath = outArg ? path.resolve(outArg.slice("--out=".length)) : path.join(ROOT, "dist", outName);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);

const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`✔ ${path.relative(ROOT, outPath)} (${kb} kB)`
  + (embeddedName ? ` – eingebettet: ${embeddedName}` : "")
  + (withMermaid ? " + Mermaid" : "")
  + (withKatex ? " + KaTeX" : "")
  + (withSwagger ? " + SwaggerUI" : ""));
