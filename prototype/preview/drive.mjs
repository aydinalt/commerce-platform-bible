import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

/**
 * Drives the built prototype in a real DOM and presses every control the Owner
 * named.
 *
 * **`body.textContent` is not what is on screen.** It includes the bundled
 * `<script>`, so searching it for a button's label finds the label twice: once
 * where a person can read it and once inside the JavaScript that draws it. The
 * first version of this file counted two "En İyi Fiyata Git" for that reason
 * and reported a defect that did not exist. `visible()` walks the document and
 * skips `script` and `style`.
 */
const html = readFileSync("/tmp/prototype-urun-karsilastirma.html", "utf8");
const dom = new JSDOM(html, {
  pretendToBeVisual: true,
  runScripts: "dangerously",
  url: "https://ornek.test/#/urun/maxtool-mx8008-budama-testeresi"
});
const { window } = dom;
window.HTMLElement.prototype.scrollIntoView = () => {};
window.scrollTo = () => {};
const errors = [];
window.addEventListener("error", (e) => errors.push(String(e.error ?? e.message)));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function visible(root = window.document.body) {
  const walker = window.document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      /^(SCRIPT|STYLE|NOSCRIPT)$/u.test(node.parentElement?.tagName ?? "")
        ? window.NodeFilter.FILTER_REJECT
        : window.NodeFilter.FILTER_ACCEPT
  });
  let out = "";
  while (walker.nextNode()) out += walker.currentNode.nodeValue + " ";
  return out;
}

/*
 * Whitespace is normalised before matching. `visible()` joins adjacent text
 * nodes with a space, so `{product.name} özellikleri` — two nodes in one
 * heading — arrives with a double space in the middle and a literal search for
 * the heading fails against a heading that is on screen and correct. That is
 * the same shape of mistake as counting the bundled script: the measurement,
 * not the product.
 */
const flat = (root) => visible(root).replace(/\s+/gu, " ");
const count = (needle, root) => (flat(root).match(new RegExp(needle, "gu")) ?? []).length;
const has = (needle, root) => flat(root).includes(needle);
const findIn = (root, sel, needle) =>
  [...root.querySelectorAll(sel)].find((n) => (n.textContent ?? "").trim().includes(needle));
const find = (sel, needle) => findIn(window.document, sel, needle);
const click = (node) =>
  node?.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
const dialog = () => window.document.querySelector('[role="dialog"]');

let pass = 0;
let fail = 0;
const check = (label, ok, detail = "") => {
  if (ok) { pass++; console.log("OK   " + label); }
  else { fail++; console.log("FAIL " + label + (detail ? "  → " + detail : "")); }
};

const type = (sel, value) => {
  const el = window.document.querySelector(sel);
  if (el === null) throw new Error("ALAN_YOK: " + sel);
  const proto = el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement : window.HTMLInputElement;
  Object.getOwnPropertyDescriptor(proto.prototype, "value").set.call(el, value);
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
};

await wait(900);

/* --------------------------------------------------------- the page opens */
check("ürün sayfası açıldı", has("MaxTool MX8008"));
check("başlıkta Giriş yap ve Kayıt ol", has("Giriş yap") && has("Kayıt ol"));
check("başlıkta Favorilerim", has("Favorilerim"));

const tabs = [...window.document.querySelectorAll('[role="tab"]')];
check("dört sekme", tabs.length === 4, tabs.map((t) => t.textContent?.trim()).join(" | "));
check("Açıklama seçili açılıyor",
  tabs[0]?.textContent?.startsWith("Açıklama") && tabs[0]?.getAttribute("aria-selected") === "true");
check("Açıklama özellikleri taşıyor", has("MaxTool MX8008 Akülü Budama Testeresi özellikleri"));

/* ------------------------------------------------------- the price list */
check('"N satıcı içinde" cümlesi kaldırıldı', !has("satıcı içinde"));
check("En İyi Fiyata Git tam bir kez", count("En İyi Fiyata Git") === 1, String(count("En İyi Fiyata Git")));
check("Satıcı Sayfasına Git birden çok", count("Satıcı Sayfasına Git") >= 3);
check("eski 'Satıcıya git' yok", count("Satıcıya git") === 0);
check("karşılaştır düğmesi fiyat listesine bakıyor",
  find("a", "satıcıyı karşılaştır")?.getAttribute("href") === "#fiyatlar");
check("veri kaynağı rozetleri var", has("Ağ beslemesi") && has("Satıcı API'si"));

/* ------------------------------------------------------------- the tabs */
click(find('[role="tab"]', "Yorum"));
await wait(150);
check("Yorum sekmesi yorumları gösteriyor", has("Mehmet A.") && has("değerlendirme"));
check("yorum yazmak giriş istiyor", has("Yorum yazmak için hesabınıza giriş yapın"));

click(find('[role="tab"]', "Karşılaştırma"));
await wait(150);
const select = window.document.querySelector("#karsilastir-secim");
check("karşılaştırma seçici var", select !== null);
check("karşılaştırma tablosu çizildi", has("satırda fark var"));
check("yalnızca aynı kategoriden ürün",
  [...(select?.options ?? [])].every((o) => !(o.textContent ?? "").includes("Nova X7")),
  [...(select?.options ?? [])].map((o) => o.textContent).join(" | "));

click(find('[role="tab"]', "Detaylı İnceleme"));
await wait(150);
check("editoryal inceleme açıldı", has("Editör görüşü"));
check("eklenme tarihi var", has("Yayımlanma:"));
check("güncelleme tarihi var", has("Son güncelleme:"));
check("artı ve eksi listesi", has("Beğendiklerimiz") && has("Eksileri"));

/* --------------------------------------------------- the stars open Yorum */
click(find('[role="tab"]', "Açıklama"));
await wait(120);
const starRow = [...window.document.querySelectorAll("button")].find(
  (b) => (b.textContent ?? "").includes("yorum") && (b.textContent ?? "").includes("★")
);
check("yıldız satırı bir düğme", starRow !== undefined);
click(starRow);
await wait(200);
check("yıldıza basınca Yorum açılıyor",
  find('[role="tab"]', "Yorum")?.getAttribute("aria-selected") === "true");

/* --------------------------------------------------------------- sharing */
click(find('[role="tab"]', "Açıklama"));
await wait(120);
click(find("button", "Paylaş"));
await wait(120);
const menu = window.document.querySelector('[role="menu"]');
const channels = [...(menu?.querySelectorAll('[role="menuitem"]') ?? [])].map((n) => n.textContent ?? "");
check("beş paylaşım kanalı", channels.length === 5, channels.join(" | "));
for (const name of ["WhatsApp", "Facebook", "X", "E-posta", "Instagram"])
  check("paylaşım: " + name, channels.some((c) => c.includes(name)));
click(window.document.body);
await wait(100);

/* ----------------------------------------------- the heart asks to sign in */
const heart = window.document.querySelector('[aria-label="Favorilere ekle"]');
check("kalp düğmesi var", heart !== null);
click(heart);
await wait(200);
check("misafirin kalbi girişi açıyor", dialog() !== null);

/* -------------------------------------------- signing in, scoped to the box */
type("#auth-eposta", "deneme@ornek.test");
type("#auth-parola", "12345678");
click(findIn(dialog(), "button", "Giriş yap"));
await wait(200);
check("yanlış parola reddedildi", has("E-posta adresi veya parola hatalı"));
check("red hangi yarısı olduğunu söylemiyor",
  !/hesap bulunamadı|kayıtlı değil|parolanız yanlış/iu.test(flat()));

type("#auth-parola", "dogruparola1");
click(findIn(dialog(), "button", "Giriş yap"));
await wait(250);
check("giriş yapıldı", has("Çıkış") && dialog() === null);

/* ------------------------------------------------------------- favourites */
const heart2 = window.document.querySelector('[aria-label="Favorilere ekle"]');
click(heart2);
await wait(200);
check("favoriye eklendi", window.document.querySelector('[aria-label="Favorilerden çıkar"]') !== null);
check("başlıktaki sayaç 1", /Favorilerim 1/u.test(flat()));

/* ------------------------------------------------------- writing a review */
click(find('[role="tab"]', "Yorum"));
await wait(180);
type("#yorum-baslik", "Kendi denemem");
type("#yorum-metin", "Bu yorumu prototipi denemek için yazdım ve yeterince uzun.");
click(find("button", "Yorumu gönder"));
await wait(200);
check("yorum listeye eklendi", has("Kendi denemem"));

/* --------------------------------------------------------- the catalogue */
window.location.hash = "#/";
await wait(600);
check("liste sayfası açıldı", has("Tüm kategoriler"));
check("bütçe çubuğu var", window.document.querySelector('input[type="range"]') !== null);
const options = [...window.document.querySelectorAll('[role="option"], [role="listbox"] *')]
  .map((n) => (n.textContent ?? "").trim())
  .filter((s) => s.length > 0);
check("on bir kategori de menüde",
  [
    "Yazılım, Yapay Zeka ve Dijital Araçlar",
    "Sigorta Hizmetleri",
    "Gayrimenkul ve Emlak",
    "Eğitim ve Çevrimiçi Gelişim",
    "Otomotiv ve Araç Kiralama",
    "Seyahat ve Turizm"
  ]
    .every((name) => flat().includes(name) || options.some((o) => o.includes(name))));

console.log("\nkonsol hataları: " + (errors.length === 0 ? "yok" : errors.join(" | ")));
console.log(`\n${pass} geçti, ${fail} kaldı`);
process.exit(fail === 0 && errors.length === 0 ? 0 : 1);
