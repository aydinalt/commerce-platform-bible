import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

/**
 * The cross-sell card, driven on every category that has one.
 *
 * The failure modes this guards are all silent: a card that shows the wrong
 * pairing, a card that leads to an empty category, a card a person cannot
 * tell from the page's own content, and a button that lands on an unfiltered
 * catalogue. None of them throws; all of them cost trust.
 */
const html = readFileSync("/tmp/prototype-urun-karsilastirma.html", "utf8");
const open = (hash) => {
  const { window } = new JSDOM(html, { pretendToBeVisual: true, runScripts: "dangerously", url: `https://o.test/${hash}` });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  return window;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const flat = (window, root) => {
  const w = window.document.createTreeWalker(root ?? window.document.body, window.NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => /^(SCRIPT|STYLE|NOSCRIPT)$/u.test(n.parentElement?.tagName ?? "")
      ? window.NodeFilter.FILTER_REJECT : window.NodeFilter.FILTER_ACCEPT
  });
  let out = ""; while (w.nextNode()) out += w.currentNode.nodeValue + " ";
  return out.replace(/\s+/gu, " ");
};
let pass = 0, fail = 0;
const check = (l, ok, d = "") => { if (ok) { pass++; console.log("OK   " + l); } else { fail++; console.log("FAIL " + l + (d ? "  → " + d : "")); } };

/* One product per category, and what each must pair with. */
const CASES = [
  ["hostwell-baslangic-barindirma-1-yil", "Eğitim ve Çevrimiçi Gelişim", "Yazılım Becerilerinizi Geliştirin", "Eğitimleri İncele"],
  ["haftalik-arac-kiralama-b-segment",    "Sigorta Hizmetleri",          "Aracınızı Güvenceye Alın",         "Teklif İste"],
  ["deniz-manzarali-3-1-daire-145m2",     "Ev, Bahçe ve Akıllı Yaşam",   "Yeni Evinize Akıllı Çözümler",     "Fırsatları Gör"],
  ["shadowfall-requiem-pc-anahtar",       "Teknoloji ve Tüketici Elektroniği", "Donanımınızı Yükseltin",      "Donanımı Gör"],
  ["maxtool-mx8008-budama-testeresi",     "Sigorta Hizmetleri",          "Evinizi Güvenceye Alın",           "Teklif İste"],
  ["5-gece-her-sey-dahil-tatil-paketi",   "Sigorta Hizmetleri",          "Yolculuğunuzu Güvenceye Alın",     "Teklif İste"],
  ["web-gelistirme-kampi-68-saat",        "Yazılım, Yapay Zeka ve Dijital Araçlar", "Öğrendiğinizi Uygulayın", "Araçları İncele"],
  ["keyra-one-donanim-cuzdani",           "Eğitim ve Çevrimiçi Gelişim", "Kararlarınızı Bilgiyle Verin",     "Eğitimleri İncele"],
  ["tam-kasko-policesi-binek-yillik",     "Otomotiv ve Araç Kiralama",   "Bakımı da Planlayın",              "Hizmetleri Gör"],
  ["derme-gunluk-bakim-seti",             "Ev, Bahçe ve Akıllı Yaşam",   "Rutininizi Evde Tamamlayın",       "Fırsatları Gör"],
  ["nova-x7-pro-5g-256gb",                "Sigorta Hizmetleri",          "Cihazınızı Koruma Altına Alın",    "Teklif İste"]
];

const hrefs = new Set();
for (const [slug, target, title, cta] of CASES) {
  const window = open(`#/urun/${slug}`);
  await wait(800);
  const card = window.document.querySelector('aside[aria-label="İş birliği içeriği"]');
  if (card === null) { check("kart var: " + slug, false); continue; }
  const text = flat(window, card);
  check(`${slug} → ${target}`, text.includes(target), text.slice(0, 90));
  check("  başlık: " + title, text.includes(title));
  check("  düğme: " + cta, text.includes(cta));
  check("  reklam olduğu belirtiliyor", text.includes("İş birliği"));
  check("  hedef kategorinin ilan sayısı yazılı", /\d+ ilan karşılaştırılıyor/u.test(text));
  check("  ikon var", card.querySelector("svg path")?.getAttribute("d")?.length > 20);
  const href = card.querySelector("a")?.getAttribute("href") ?? "";
  hrefs.add(href);
  /*
   * The leading `#` is the preview shim's, not the component's: `next/link`
   * is aliased to an `<a>` that rewrites the route as a hash, because the
   * single-file build has no router. The application renders `/kategori/x`.
   */
  check("  bağlantı gerçek kategori rotasına gidiyor", /^#?\/kategori\/[a-z]+$/u.test(href), href);
  check("  sorgu dizesi değil, rota", !href.includes("?"), href);
  check("  dış siteye çıkmıyor", !/^https?:/u.test(href), href);
}

check("her kategori farklı bir hedefe gitmiyor değil (çeşitlilik var)", hrefs.size >= 4, [...hrefs].join(" "));

/*
 * The link must actually select the category, not merely land on the list.
 *
 * The address changed from `?kategori=insurance` to `/kategori/insurance`,
 * and the change is the point rather than a rename: the query-string form was
 * applied by an effect after mount, so the HTML a crawler received was the
 * unfiltered catalogue at eleven different addresses. The route form is part
 * of the first render.
 */
const w = open("#/kategori/insurance");
await wait(900);
const label = [...w.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Kategori:"));
check("bağlantı kategoriyi gerçekten seçiyor", (label?.textContent ?? "").includes("Sigorta Hizmetleri"),
  label?.textContent?.trim() ?? "seçilmedi");
const alt = w.document.querySelector('section[aria-labelledby="alternatives"]');
const rows = [...w.document.querySelectorAll("li.group")].filter((li) => alt === null || !alt.contains(li)).length;
check("yalnızca o kategori listeleniyor", rows === 2, String(rows));

/* An unknown category must be ignored rather than emptying the page. */
const w2 = open("#/kategori/uydurma");
await wait(900);
const label2 = [...w2.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Kategori"));
check("bilinmeyen kategori yok sayılıyor", !(label2?.textContent ?? "").includes("Kategori:"),
  label2?.textContent?.trim() ?? "");

console.log(`\n${pass} geçti, ${fail} kaldı`);
process.exit(fail === 0 ? 0 : 1);
