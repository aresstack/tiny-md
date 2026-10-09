#!/usr/bin/env node
/**
 * Baut aus src/template.html eine einzelne, offline-fähige HTML-Datei.
 *
 *   node build.js                 → dist/tiny-md.html          (leere App)
 *   node build.js --mermaid       → dist/tiny-md-mermaid.html  (leere App inkl. Mermaid)
 *   node build.js --swagger       → dist/tiny-md-swagger.html  (leere App inkl. SwaggerUI)
 *   node build.js --highlight     → dist/tiny-md-highlight.html (leere App inkl. Syntax-Highlighting)
 *   node build.js --bundle=mit    → dist/tiny-md-full-mit.html    (alle MIT-lizenzierten Plugins)
 *   node build.js --bundle=apache → dist/tiny-md-full-apache.html (zusätzlich alle Apache-2.0-Plugins)
 *   node build.js pfad/notes.md   → dist/notes.html            (Markdown fest eingebettet)
 *   node build.js pfad/api.yaml   → dist/api.html              (OpenAPI-Spezifikation fest eingebettet)
 *
 * Enthält das eingebettete Markdown ```mermaid-Blöcke bzw. $…$/$$…$$-Mathe,
 * werden Mermaid bzw. KaTeX automatisch mit eingebaut (abschaltbar mit
 * --no-mermaid / --no-katex; erzwingbar mit --mermaid / --katex; beide
 * Flags zusammen ergeben bei leerer App tiny-md-full.html).
 * Eine eingebettete .yaml/.yml/.json-Datei mit openapi:/swagger:-Version
 * bringt automatisch SwaggerUI mit (--no-swagger / --swagger analog).
 * Codeblöcke mit Sprachangabe (```js …) bringen Prism fürs Syntax-Highlighting
 * mit (--highlight / --no-highlight).
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

// Plugins mit ihrer Lizenz. Neue Plugins hier eintragen: die Lizenz entscheidet,
// in welchem Bundle (--bundle=mit / --bundle=apache) sie automatisch landen.
const PLUGINS = {
  mermaid: { license: "MIT", auto: () => !isSpecFile && /^\s*(`{3,}|~{3,})\s*mermaid\b/m.test(embeddedMd) },
  katex: { license: "MIT", auto: () => !isSpecFile &&
    (/\$\$[\s\S]+?\$\$/.test(embeddedMd) || /(^|[^\\$])\$\S[^$\n]*\$/m.test(embeddedMd)) },
  swagger: { license: "Apache-2.0", auto: () => isOpenApi },
  // Syntax-Highlighting (Prism): sobald ein Codeblock eine Sprache angibt bzw.
  // YAML/JSON ohne SwaggerUI als Codeblock angezeigt wird (nach swagger auswerten)
  highlight: { license: "MIT", auto: () => isSpecFile ? !withSwagger
    : /^\s*(`{3,}|~{3,})[ \t]*(?!mermaid\b)[\w#+-]/m.test(embeddedMd) },
};

// Lizenz-Bundles: welche Plugin-Lizenzen sie enthalten (apache ⊃ mit)
const BUNDLES = {
  mit: ["MIT"],
  apache: ["MIT", "Apache-2.0"],
};
const bundleArg = args.find(a => a.startsWith("--bundle="));
const bundle = bundleArg && bundleArg.slice("--bundle=".length);
if (bundle && !BUNDLES[bundle]) {
  throw new Error(`Unbekanntes Bundle: ${bundle} (erlaubt: ${Object.keys(BUNDLES).join(", ")})`);
}

// Plugin aktiv: per Bundle oder Flag erzwungen, mit --no-<name> unterdrückt, sonst automatisch anhand des Inhalts
const enabled = name => {
  const p = PLUGINS[name];
  if (flags.has(`--no-${name}`)) return false;
  return flags.has(`--${name}`) || (bundle && BUNDLES[bundle].includes(p.license)) || p.auto();
};
const withMermaid = enabled("mermaid");
const withKatex = enabled("katex");
const withSwagger = enabled("swagger");
const withHighlight = enabled("highlight");

// Prism: Kern plus gängige Sprachen, Reihenfolge nach Prisms eigener Abhängigkeitsliste
const PRISM_LANGS = ["markup", "css", "clike", "javascript", "typescript", "jsx", "tsx", "json", "yaml",
  "toml", "ini", "properties", "bash", "powershell", "batch", "python", "java", "kotlin", "groovy", "scala",
  "c", "cpp", "csharp", "go", "rust", "php", "ruby", "perl", "lua", "r", "swift", "dart", "sql", "graphql",
  "diff", "markdown", "docker", "makefile", "nginx", "http", "regex"];
function prismJs() {
  const dir = path.join(ROOT, "node_modules", "prismjs");
  const ids = require(path.join(dir, "dependencies.js"))(require(path.join(dir, "components.json")), PRISM_LANGS).getIds();
  // Kopf mit Lizenzhinweis; manual: kein automatisches highlightAll beim Laden
  return "/*! Prism.js | MIT License | (c) Lea Verou and contributors | https://prismjs.com */\n"
    + "window.Prism = { manual: true };\n"
    + ["core", ...ids].map(id => read(path.join(dir, "components", `prism-${id}.min.js`))).join("\n");
}

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
  : bundle ? `tiny-md-full-${bundle}.html`
  : (withMermaid && withKatex ? "tiny-md-full"
    : withMermaid ? "tiny-md-mermaid"
    : withKatex ? "tiny-md-katex"
    : "tiny-md") + (withHighlight ? "-highlight" : "") + (withSwagger ? "-swagger" : "") + ".html";

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
html = inject(html, "/*__PRISM_JS__*/", withHighlight ? escapeScriptEnd(prismJs()) : "");
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
  + (withHighlight ? " + Prism" : "")
  + (withSwagger ? " + SwaggerUI" : ""));
