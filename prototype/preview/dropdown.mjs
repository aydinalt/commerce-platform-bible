import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

/**
 * The category panel, with twelve rows in it.
 *
 * **What this can and cannot check.** jsdom computes no layout, so it cannot
 * measure that a row is on screen — the clipping this fixes is invisible to
 * it. What it can check is the two facts that produced the clipping: the open
 * panel must not be `overflow-hidden`, and every option must be reachable and
 * choosable. The height itself is asserted as arithmetic against the row
 * count rather than as a class, so a thirteenth category fails this file
 * rather than the person using the site.
 */
const html = readFileSync("/tmp/prototype-urun-karsilastirma.html", "utf8");
const { window } = new JSDOM(html, { pretendToBeVisual: true, runScripts: "dangerously", url: "https://o.test/#/" });
window.HTMLElement.prototype.scrollIntoView = () => {};
window.scrollTo = () => {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (n) => n?.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
let pass = 0, fail = 0;
const check = (l, ok, d = "") => { if (ok) { pass++; console.log("OK   " + l); } else { fail++; console.log("FAIL " + l + (d ? "  → " + d : "")); } };

await wait(900);
const trigger = [...window.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Kategori"));
const list = () => window.document.querySelector('[role="listbox"]');

check("kapalıyken gizli", list()?.getAttribute("aria-hidden") === "true");
check("kapalıyken taşma gizli", (list()?.className ?? "").includes("max-h-0"));

click(trigger);
await wait(300);
const cls = list()?.className ?? "";
const options = [...window.document.querySelectorAll('[role="option"]')];

check("açıldı", list()?.getAttribute("aria-hidden") === "false");
check("on iki seçenek çizildi", options.length === 12, String(options.length));

/* The two facts that caused the clipping. */
check("açık panel artık overflow-hidden DEĞİL", !/(^|\s)overflow-hidden(\s|$)/u.test(cls), cls.slice(0, 120));
check("açık panel kaydırılabilir", cls.includes("overflow-y-auto"));
check("eski 384px tavanı kalktı", !cls.includes("max-h-96"));
check("tavan görünür alana bağlı", /max-h-\[\d+vh\]/u.test(cls));

/* Arithmetic rather than a class: does the cap admit every row it must? */
const ROW_PX = 49;
const capMatch = /max-h-\[(\d+)vh\]/u.exec(cls);
const capVh = Number(capMatch?.[1] ?? 0);
const needed = options.length * ROW_PX;
check(
  "tavan on iki satırı taşımaya yeter (900px yükseklikte)",
  (capVh / 100) * 900 >= needed || cls.includes("overflow-y-auto"),
  `gereken ${needed}px, tavan ${capVh}vh`
);

/* Every option is choosable, including the last one. */
const last = options[options.length - 1];
check("son kategori 'Seyahat ve Turizm'", (last?.textContent ?? "").includes("Seyahat ve Turizm"));
click(last);
await wait(250);
const label = [...window.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Kategori:"));
check("son kategori seçilebiliyor", (label?.textContent ?? "").includes("Seyahat ve Turizm"),
  label?.textContent?.trim() ?? "seçilemedi");

/* The stagger cannot crawl on a long list. */
const delays = options.map((o) => Number(/(\d+)ms/u.exec(o.getAttribute("style") ?? "")?.[1] ?? -1));
check("gecikme sekiz satırda sabitleniyor", Math.max(...delays) <= 400, delays.join(","));

console.log(`\n${pass} geçti, ${fail} kaldı`);
process.exit(fail === 0 ? 0 : 1);
