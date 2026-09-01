/**
 * Builds the single-file prototype.
 *
 * Three steps, and none of them re-writes a screen:
 *
 * 1. **Tailwind** compiles the real CSS by scanning the real components, so the
 *    output carries exactly the classes the application uses and nothing else.
 * 2. **esbuild** bundles `entry.tsx`, which imports the real components, with
 *    React inside. `next/link` is aliased to a shim; nothing else is.
 * 3. Both are inlined into one `prototype.html` with no external request of any
 *    kind — no CDN, no font fetch, no image URL.
 *
 * Run: `npm run preview`
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const work = resolve(here, ".build");

rmSync(work, { force: true, recursive: true });
mkdirSync(work, { recursive: true });

/*
 * 1 — Tailwind, scanning the real source.
 *
 * **Resolved by path rather than through `npx`.** Once Tailwind was also
 * installed at the repository root for `apps/web` (I54), `npx @tailwindcss/cli`
 * run from here found the root copy's shim and failed — the prototype is not a
 * workspace, so the two installs do not share a `node_modules`. Naming the file
 * removes the ambiguity: this script builds *this* directory with *its* Tailwind.
 */
execFileSync(
  process.execPath,
  [
    resolve(root, "node_modules/@tailwindcss/cli/dist/index.mjs"),
    "--input",
    resolve(root, "src/app/globals.css"),
    "--output",
    resolve(work, "app.css"),
    "--minify"
  ],
  { cwd: root, stdio: "inherit" }
);

/* 2 — the real components, bundled. */
await esbuild.build({
  alias: { "next/link": resolve(here, "next-link.tsx") },
  bundle: true,
  /*
   * **UTF-8 rather than esbuild's default.** Its default escapes every
   * non-ASCII character, so `Bütçe` ships as `Bütçe` — which runs
   * correctly and makes the file bigger and unreadable, and makes a check for
   * the word `Bütçe` in the output fail while the word is on screen. That is
   * the shape of mistake this repository has made twelve times.
   */
  charset: "utf8",
  define: { "process.env.NODE_ENV": '"production"' },
  entryPoints: [resolve(here, "entry.tsx")],
  format: "iife",
  jsx: "automatic",
  minify: true,
  outfile: resolve(work, "app.js"),
  target: "es2022",
  tsconfig: resolve(root, "tsconfig.json")
});

/*
 * 3 — the fonts, inlined.
 *
 * The single file must make **no external request of any kind**: no CDN, no
 * Google Fonts, no image URL. So each `url("/fonts/…")` in the compiled CSS is
 * replaced by the file's own bytes as a data URI.
 *
 * Six faces — 400/600/700 across `latin` and `latin-ext` — for about 48 kB
 * before encoding. `latin-ext` is not optional: `ğ ş İ ı ö ü ç` live there, and
 * dropping it renders Turkish with fallback glyphs inside words.
 */
let css = readFileSync(resolve(work, "app.css"), "utf8");

const fontDirectory = resolve(root, "public/fonts");
const inlined = [];
/*
 * **Quotes optional, because the minifier removes them.** The source writes
 * `url("/fonts/…")` and Tailwind's minifier emits `url(/fonts/…)`; a pattern
 * that insisted on the quotes matched nothing and the guard below caught it.
 * That guard existing is why this was a build failure rather than a prototype
 * that silently asked the network for six fonts it could not reach.
 */
css = css.replace(/url\(["']?\/fonts\/([^"')]+)["']?\)/gu, (_match, file) => {
  const bytes = readFileSync(resolve(fontDirectory, file));
  inlined.push(file);
  return `url("data:font/woff2;base64,${bytes.toString("base64")}")`;
});

if (inlined.length !== 6)
  throw new Error(
    `Expected to inline six font faces, inlined ${inlined.length}. ` +
      "A face that is not inlined becomes a request the single file cannot make."
  );

const js = readFileSync(resolve(work, "app.js"), "utf8");

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Ürün karşılaştırma prototipi</title>
<style>${css}</style>
</head>
<body class="bg-slate-50 font-sans text-slate-900 antialiased">
<a class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white" href="#icerik">İçeriğe geç</a>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

const out = resolve(root, "..", "prototype-urun-karsilastirma.html");
writeFileSync(out, html);
rmSync(work, { force: true, recursive: true });

console.log(
  `prototype-urun-karsilastirma.html — ${Math.round(html.length / 1024)} kB ` +
    `(CSS ${Math.round(css.length / 1024)} kB, JS ${Math.round(js.length / 1024)} kB)`
);
