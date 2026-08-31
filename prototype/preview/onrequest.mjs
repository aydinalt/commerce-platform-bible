import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

/**
 * The On Request case, driven end to end.
 *
 * Insurance and commercial property are the two categories the Owner added
 * that genuinely have no stated amount, and PRD-0001 v4.0 §5.10.1 says that
 * is a **different answer** from "the platform does not know". These checks
 * exist because the failure mode is silent: a `0 ₺`, an empty price slot or a
 * seller list with no rows all look like a site that broke rather than a
 * listing that is priced on request.
 */
const html = readFileSync("/tmp/prototype-urun-karsilastirma.html", "utf8");
const make = (hash) => {
  const { window } = new JSDOM(html, {
    pretendToBeVisual: true, runScripts: "dangerously", url: `https://o.test/${hash}`
  });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.scrollTo = () => {};
  return window;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const seen = (window, root) => {
  const w = window.document.createTreeWalker(root ?? window.document.body, window.NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => /^(SCRIPT|STYLE|NOSCRIPT)$/u.test(n.parentElement?.tagName ?? "")
      ? window.NodeFilter.FILTER_REJECT : window.NodeFilter.FILTER_ACCEPT
  });
  let out = ""; while (w.nextNode()) out += w.currentNode.nodeValue + " ";
  return out.replace(/\s+/gu, " ");
};
let pass = 0, fail = 0;
const check = (l, ok, d = "") => { if (ok) { pass++; console.log("OK   " + l); } else { fail++; console.log("FAIL " + l + (d ? "  → " + d : "")); } };

/* ------------------------------------------ an On Request product page */
const w1 = make("#/urun/isyeri-paket-sigortasi-kurumsal");
await wait(900);
const t1 = seen(w1);
check("fiyatsız ilan açıldı", t1.includes("İşyeri Paket Sigortası"));
check("fiyat 'Sorulduğunda belirlenir' diyor", t1.includes("Sorulduğunda belirlenir"));
check("sıfır lira YAZMIYOR", !/\b0(,00)?\s*₺/u.test(t1), t1.match(/\S*0\s*₺\S*/u)?.[0] ?? "");
check("satıcı listesi yerine teklif bloğu", t1.includes("Bu ilanın sabit bir fiyatı yok"));
check("bunun bir kusur olmadığı yazılı", t1.includes("fiyatın bilinmediği anlamına gelmez"));
check("Teklif İste düğmesi", t1.includes("Teklif İste"));
check("'N satıcıyı karşılaştır' YOK", !/satıcıyı karşılaştır/u.test(t1));
check("alternatif ürünler bloğu çizilmiyor",
  w1.document.querySelector('section[aria-labelledby="alternatives"]') === null);
check("fiyat aralığı satırı yok", !t1.includes("Fiyat aralığı"));

/* ------------------------------------------ a Fixed product still works */
const w2 = make("#/urun/tam-kasko-policesi-binek-yillik");
await wait(900);
const t2 = seen(w2);
check("fiyatlı sigorta ilanı fiyat gösteriyor", /₺/u.test(t2) && !t2.includes("Sorulduğunda belirlenir"));
check("fiyatlı ilanda satıcı listesi var", t2.includes("En İyi Fiyata Git"));

/* -------------------------------------------- the list, and the set-aside */
const w3 = make("#/");
await wait(900);
const rows = () => {
  const alt = w3.document.querySelector('section[aria-labelledby="alternatives"]');
  return [...w3.document.querySelectorAll("li.group")].filter((li) => alt === null || !alt.contains(li)).length;
};
check("liste fiyatsız ilanı taşıyor", seen(w3).includes("Fiyat sorulduğunda belirlenir"));
check("bütçe sınırsızken uyarı yok", !seen(w3).includes("listelenmiyor"));
const range = w3.document.querySelector('input[type="range"]');
const set = (el, v) => {
  Object.getOwnPropertyDescriptor(w3.HTMLInputElement.prototype, "value").set.call(el, String(v));
  el.dispatchEvent(new w3.Event("input", { bubbles: true }));
};
const before = rows();
set(range, 20000);
await wait(200);
check("bütçe daraldığında kaç ilan ayrıldığı yazıyor", seen(w3).includes("sorulduğunda belirlenen 2 ilan"),
  seen(w3).slice(0, 0) || "");
check("ayrılanlar listeden çıktı", !seen(w3).includes("Fiyat sorulduğunda belirlenir"));
check("sınırı kaldırma yolu sunuluyor", seen(w3).includes("Bütçe sınırını kaldır"));
const undo = [...w3.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Bütçe sınırını kaldır"));
undo?.dispatchEvent(new w3.MouseEvent("click", { bubbles: true }));
await wait(200);
check("kaldırınca geri geliyor", seen(w3).includes("Fiyat sorulduğunda belirlenir") && rows() === before);

/* ------------------------------------------------------ eleven categories */
const NAMES = [
  "Yazılım, Yapay Zeka ve Dijital Araçlar", "Finans, Kripto ve Yatırım",
  "Sigorta Hizmetleri", "Gayrimenkul ve Emlak", "Teknoloji ve Tüketici Elektroniği",
  "Eğitim ve Çevrimiçi Gelişim", "Sağlık, Kozmetik ve Kişisel Bakım",
  "Oyun, E-Spor ve Dijital Eğlence", "Ev, Bahçe ve Akıllı Yaşam",
  "Otomotiv ve Araç Kiralama", "Seyahat ve Turizm"
];
const opener = [...w3.document.querySelectorAll("button")].find((b) => (b.textContent ?? "").includes("Tüm kategoriler"));
opener?.dispatchEvent(new w3.MouseEvent("click", { bubbles: true }));
await wait(250);
const options = [...w3.document.querySelectorAll('[role="option"]')].map((o) => (o.textContent ?? "").replace(/\d+$/u, "").trim());
check("on iki seçenek (Tümü + 11)", options.length === 12, String(options.length));
for (const name of NAMES) check("kategori: " + name, options.includes(name));
const counts = [...w3.document.querySelectorAll('[role="option"]')].map((o) => Number((o.textContent ?? "").match(/(\d+)$/u)?.[1] ?? 0));
check("hiçbir kategori boş değil", counts.slice(1).every((c) => c > 0), counts.join(","));

console.log(`\n${pass} geçti, ${fail} kaldı`);
process.exit(fail === 0 ? 0 : 1);
