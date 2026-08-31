/**
 * A clickable prototype, generated from the application's own stylesheet.
 *
 * **Nobody had looked at this product.** Fifty-two increments asserted markup
 * and asserted CSS; I51 served six routes and read their `<title>`, and that is
 * the whole of what anyone has seen. This produces a single self-contained page
 * showing eight screens, so the design can be judged by looking at it.
 *
 * **It is not a mockup.** `apps/web/src/app/globals.css` is inlined verbatim —
 * every colour, size and rule is the one the application ships — and the markup
 * mirrors the real components, class for class. What is invented is only the
 * *content*: Offerings, Businesses and Categories the platform has no seed data
 * for. Every Turkish string that is real copy is quoted from the copy modules.
 *
 * Regenerate with `node scripts/prototype.mjs`. If the stylesheet changes, the
 * prototype changes with it, which is the point of generating rather than
 * drawing.
 */

import { readFileSync, writeFileSync } from "node:fs";

const css = readFileSync("apps/web/src/app/globals.css", "utf8");
const refresh = readFileSync("docs/design/direction-refresh.css", "utf8");

/**
 * A placeholder visual, as a data URL.
 *
 * The platform has no seed content and no images, and the refreshed direction
 * is image-forward — so the prototype has to show *something* in the ratio box
 * or it would be arguing for a change it does not demonstrate. These are flat
 * geometric fills, deliberately not photographs: a stock photo would make the
 * design look better than it is.
 */
const visual = (a, b) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(%23g)"/><circle cx="300" cy="90" r="120" fill="#ffffff" opacity="0.10"/><circle cx="90" cy="240" r="90" fill="#000000" opacity="0.06"/></svg>`
  )}`;

/** The site shell (I33), around every screen. */
const shell = (id, title, scope, body) => `
<section class="screen" id="${id}" data-title="${title}">
  <div class="frame ${scope}">
    <header class="site-header">
      <div class="site-header-inner">
        <a class="brand" href="#home">İlanlar</a>
        <nav aria-label="Ana gezinme">
          <a href="#login">Giriş yap</a>
          <a href="#login">Kayıt ol</a>
        </nav>
      </div>
    </header>
    <div>${body}</div>
    <footer class="site-footer">
      <p>İlanlar — bir ilan ve karar platformu</p>
    </footer>
  </div>
</section>`;

const PALETTES = [
  ["#8fa6bd", "#5d7f9e"],
  ["#a9b6a2", "#7d9179"],
  ["#bdaa9a", "#9c8570"],
  ["#9fa8bd", "#77839e"],
  ["#b6a7ae", "#8f7d86"],
  ["#a2b3b6", "#78959a"]
];

let seq = 0;
const card = (t, c, b) => {
  const [x, y] = PALETTES[seq++ % PALETTES.length];
  return `
<li class="listing-card">
  <img alt="" class="listing-card-visual" src="${visual(x, y)}" />
  <h2><a href="#offering">${t}</a></h2>
  <p class="listing-card-facts">
    <span>${c}</span><span aria-hidden="true">·</span><span>${b}</span>
  </p>
</li>`;
};

const home = shell(
  "home",
  "Ana sayfa",
  "",
  `<main>
  <section class="entry">
    <form class="search-entry">
      <h1><label for="q">Bugün ne yapmak istiyorsunuz?</label></h1>
      <div class="search-entry-row">
        <input id="q" type="text" value="ikinci el elektrikli bisiklet" />
        <button type="button">Ara</button>
      </div>
    </form>
    <nav aria-labelledby="be" class="entry-nav">
      <h2 id="be">Ya da bir kategoriden başlayın</h2>
      <form><ul>
        <li><button type="button">Ulaşım</button></li>
        <li><button type="button">Emlak</button></li>
        <li><button type="button">Teknoloji</button></li>
      </ul></form>
    </nav>
  </section>
</main>`
);

const results = shell(
  "results",
  "Sonuçlar",
  "",
  `<main>
  <section>
    <h1 class="results-heading">“ikinci el elektrikli bisiklet” için sonuçlar</h1>
    <p class="category-path">Ulaşım › Bisiklet › Elektrikli bisiklet</p>
    <nav aria-labelledby="nb" class="entry-nav">
      <h2 id="nb">Aramayı bir kategoriye daraltın</h2>
      <form><ul>
        <li><button type="button">Elektrikli bisiklet</button></li>
        <li><button type="button">Katlanır bisiklet</button></li>
        <li><button type="button">Yol bisikleti</button></li>
      </ul></form>
    </nav>
    <ul class="listing-cards">
      ${card("Kentsel elektrikli bisiklet, 2023 model", "Elektrikli bisiklet", "Pedal Atölyesi")}
      ${card("Katlanır elektrikli bisiklet, 40 km menzil", "Elektrikli bisiklet", "Şehir Bisiklet")}
      ${card("Kargo elektrikli bisiklet, çift sepetli", "Elektrikli bisiklet", "Pedal Atölyesi")}
      ${card("Hafif elektrikli bisiklet, 17 kg", "Elektrikli bisiklet", "Vira Bisiklet")}
      ${card("Dağ tipi elektrikli bisiklet", "Elektrikli bisiklet", "Zirve Spor")}
      ${card("Elektrikli bisiklet, az kullanılmış", "Elektrikli bisiklet", "Şehir Bisiklet")}
    </ul>
  </section>
</main>`
);

const offering = shell(
  "offering",
  "İlan",
  "",
  `<main>
  <article>
    <h1>Kentsel elektrikli bisiklet, 2023 model</h1>
    <p class="category-path">Ulaşım › Bisiklet › Elektrikli bisiklet</p>
    <p>Şehir içi kullanım için hazırlanmış, bakımı yapılmış bir elektrikli
       bisiklet. Bataryası değiştirildi, fatura ve servis kaydı mevcut.</p>
    <dl class="attributes">
      <div><dt>Menzil</dt><dd>65 km</dd></div>
      <div><dt>Motor gücü</dt><dd>250 W</dd></div>
      <div><dt>Ağırlık</dt><dd>22 kg</dd></div>
      <div><dt>Vites</dt><dd>Var</dd></div>
      <div class="attribute-absent"><dt>Garanti</dt><dd>Belirtilmedi</dd></div>
    </dl>
    <h2>Pedal Atölyesi</h2>
    <p>2016'dan beri şehir içi bisiklet satışı ve servisi.</p>
    <h2>Nasıl devam etmek istersiniz?</h2>
    <ul class="decision-entries">
      <li><button type="button">Karara başla</button></li>
      <li><button type="button">Karşılaştırmaya ekle</button></li>
    </ul>
  </article>
</main>`
);

const compare = shell(
  "compare",
  "Karşılaştırma",
  "",
  `<main>
  <h1>Karşılaştırma</h1>
  <table class="comparison stacking">
    <thead><tr>
      <th></th>
      <th><a href="#offering">Kentsel elektrikli bisiklet</a>
        <div class="comparison-business">Pedal Atölyesi</div>
        <button type="button">Çıkar</button></th>
      <th><a href="#offering">Katlanır elektrikli bisiklet</a>
        <div class="comparison-business">Şehir Bisiklet</div>
        <button type="button">Çıkar</button></th>
    </tr></thead>
    <tbody>
      <tr><th>Menzil</th><td>65 km</td><td>40 km</td></tr>
      <tr><th>Motor gücü</th><td>250 W</td><td>250 W</td></tr>
      <tr><th>Ağırlık</th><td>22 kg</td><td>17 kg</td></tr>
      <tr><th>Vites</th><td>Var</td><td>Yok</td></tr>
      <tr><th>Garanti</th><td>Belirtilmedi</td><td>6 ay</td></tr>
    </tbody>
  </table>
</main>`
);

const decision = shell(
  "decision",
  "Karar",
  "",
  `<main class="flow">
  <h1>Karar</h1>
  <section>
    <h2>Karşılaştırdıklarınız</h2>
    <ul class="listing-cards">
      ${card("Kentsel elektrikli bisiklet, 2023 model", "Elektrikli bisiklet", "Pedal Atölyesi")}
      ${card("Katlanır elektrikli bisiklet, 40 km menzil", "Elektrikli bisiklet", "Şehir Bisiklet")}
    </ul>
  </section>
  <section>
    <h2>Karar Sohbeti</h2>
    <p>Günde kaç kilometre yol yapmayı düşünüyorsunuz? Menzil ile ağırlık
       arasındaki tercih büyük ölçüde buna bağlı.</p>
    <form>
      <p><label for="msg">Mesajınız</label>
      <textarea id="msg" rows="2">Günde yaklaşık 15 km, ama merdiven çıkarmam gerekiyor.</textarea></p>
      <button type="button">Gönder</button>
    </form>
  </section>
  <section>
    <h2>Seçiminiz</h2>
    <p>Devam etmeden önce bir ilan seçin.</p>
    <ul class="decision-entries">
      <li><button type="button">Bu ilanı seçin</button></li>
      <li><button type="button">Bu ilanı seçin</button></li>
    </ul>
  </section>
  <section>
    <h2>Nasıl devam etmek istersiniz?</h2>
    <ul class="decision-entries">
      <li><button type="button">İşletmenin sitesine gidin</button></li>
      <li><button type="button">İşletmeyle doğrudan iletişime geçin</button></li>
    </ul>
  </section>
  <section role="alert">
    <h2>Devam edilemiyor</h2>
    <p>Bu ilan artık herkese açık değil, bu yüzden karar buradan sürdürülemez.
       Kaydettikleriniz bundan etkilenmedi.</p>
    <ul>
      <li><a href="#results">Sonuçlara dön</a></li>
      <li><a href="#home">Yeni bir arama yapın</a></li>
    </ul>
  </section>
</main>`
);

const dashboard = shell(
  "dashboard",
  "İşletme panosu",
  "workspace",
  `<main>
  <header>
    <h1>Pedal Atölyesi</h1>
    <p><span class="badge badge-notice">Kısıtlı</span></p>
    <p>Bazı yönetim eylemleri şu anda kullanılamıyor. İlanlarınız ve
       işletme bilgileriniz sizde kalmaya devam ediyor.</p>
  </header>
  <p><a href="#information">İşletme bilgilerini yönetin</a></p>
  <section>
    <h2>Taslak</h2>
    <ul>
      <li><h4>Şehir bisikleti, 2021</h4>
        <p class="listing-card-facts">Görünürlüğü henüz belirlenmedi</p>
        <p><a href="#">Düzenle</a></p></li>
    </ul>
  </section>
  <section>
    <h2>Yayında</h2>
    <ul>
      <li><h4>Kentsel elektrikli bisiklet, 2023 model</h4>
        <p class="listing-card-facts">Herkese açık</p>
        <p><a href="#">Düzenle</a> · <a href="#">Yönlendirme adresi</a></p></li>
      <li><h4>Kargo elektrikli bisiklet, çift sepetli</h4>
        <p class="listing-card-facts">Herkese kapalı</p>
        <p><a href="#">Düzenle</a></p></li>
    </ul>
  </section>
  <section>
    <h2>Arşivlenmiş</h2>
    <ul>
      <li><h4>Katlanır bisiklet, 2019</h4>
        <p class="listing-card-facts">Görünümden çıkarıldı</p>
        <p><a href="#">Görüntüle</a></p></li>
    </ul>
  </section>
</main>`
);

const information = shell(
  "information",
  "İşletme bilgileri",
  "workspace",
  `<main>
  <h1>İşletme bilgileri</h1>
  <form>
    <fieldset>
      <legend>Herkese açık kimlik</legend>
      <p>İlanlarınızın göründüğü her yerde herkese açık olarak gösterilir.</p>
      <p><label for="n">Görünen ad (zorunlu)</label>
        <input id="n" type="text" value="Pedal Atölyesi" /></p>
      <p><label for="d">Kısa açıklama</label>
        <input id="d" type="text" value="Şehir içi bisiklet satışı ve servisi." /></p>
      <p><label for="l">Logo adresi</label><input id="l" type="text" value="" /></p>
    </fieldset>
    <fieldset>
      <legend>Doğrudan iletişim</legend>
      <p>Yalnızca giriş yapmış ve sizinle iletişime geçmek isteyen kişiye
         gösterilir; herkese açık sayfalarda asla görünmez.</p>
      <p><label for="e">E-posta adresi</label>
        <input aria-invalid="true" id="e" type="text" value="pedal@" />
        <span role="alert">Geçerli bir e-posta adresi girin.</span></p>
      <p><label for="t">Telefon</label><input id="t" type="text" value="" /></p>
    </fieldset>
    <button type="button">Kaydet</button>
  </form>
</main>`
);

const login = shell(
  "login",
  "Giriş",
  "auth",
  `<main>
  <h1>Giriş yapın</h1>
  <form>
    <p><label for="le">E-posta adresi</label><input id="le" type="text" value="" /></p>
    <p><label for="lp">Parola</label><input id="lp" type="password" value="" /></p>
    <button type="button">Giriş yap</button>
    <p role="alert">E-posta adresi ya da parola doğru değil.</p>
  </form>
  <p><a href="#">Parolanızı mı unuttunuz?</a></p>
</main>`
);

const admin = shell(
  "admin",
  "Yönetici paneli",
  "workspace",
  `<main>
  <h1>Yönetici paneli</h1>
  <section>
    <h2>Sizi bekleyenler</h2>
    <table class="stacking">
      <thead><tr><th>İş</th><th>Adet</th></tr></thead>
      <tbody>
        <tr><td>Açık moderasyon vakası</td><td>7</td></tr>
        <tr><td>Denetim bekleyen yönlendirme adresi</td><td>3</td></tr>
        <tr><td>Yeniden inceleme bekleyen vaka</td><td>2</td></tr>
      </tbody>
    </table>
  </section>
  <section>
    <h2>Moderasyon vakaları</h2>
    <ul>
      <li><h3><a href="#">İlan</a></h3>
        <p>Açıldı: 2026-08-27</p>
        <p role="status">Sahibi yanıt verdi, yeniden inceleme bekliyor.</p>
        <p>2 karar kaydedildi</p></li>
      <li><h3><a href="#">İşletme</a></h3>
        <p>Açıldı: 2026-08-25</p>
        <p>Henüz bir şey kaydedilmedi</p></li>
    </ul>
  </section>
</main>`
);

const screens = [
  home,
  results,
  offering,
  compare,
  decision,
  dashboard,
  information,
  login,
  admin
];

const tabs = [
  ["home", "Ana sayfa"],
  ["results", "Sonuçlar"],
  ["offering", "İlan"],
  ["compare", "Karşılaştırma"],
  ["decision", "Karar"],
  ["dashboard", "İşletme panosu"],
  ["information", "İşletme bilgileri"],
  ["login", "Giriş"],
  ["admin", "Yönetici"]
];

const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>İlanlar — prototip</title>
<style>
${css}

/* ===== The refreshed direction (candidate). Scoped under .refresh, so
   removing one class returns the page to what the application ships. ===== */
${refresh}

/* --- Prototype chrome. Not part of the application. --- */
.proto-bar {
  background: #16202e;
  color: #fafafa;
  padding: var(--space-3) var(--space-4);
  position: sticky;
  top: 0;
  z-index: 10;
}
.proto-bar h1 { border: 0; color: #fafafa; font-size: 1rem; margin: 0 0 var(--space-2); }
.proto-bar p { color: #b8c0cc; font-size: var(--text-small); margin: 0 0 var(--space-3); }
.proto-tabs { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.proto-tabs button {
  background: transparent;
  border: 1px solid #3c4759;
  color: #e3e5e9;
  font-size: var(--text-small);
  min-height: 2rem;
  padding: var(--space-1) var(--space-3);
}
.proto-tabs button[aria-current="true"] { background: #fafafa; border-color: #fafafa; color: #16202e; }
.proto-tabs button:hover:not([aria-current="true"]) { background: #22303f; color: #fff; }
.proto-widths { align-items: center; display: flex; flex-wrap: wrap; gap: var(--space-2); margin-top: var(--space-3); }
.proto-sep { background: #3c4759; height: 1.25rem; width: 1px; }
.screen { display: none; }
.screen.is-active { display: block; }
.frame { margin: 0 auto; }
body.w-mobile .frame { max-width: 375px; }
body.w-tablet .frame { max-width: 768px; }
.frame { border-left: 1px solid var(--border); border-right: 1px solid var(--border); min-height: 60vh; }
.proto-note {
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: var(--text-small);
  margin: var(--space-8) auto 0;
  max-width: var(--measure);
  padding: var(--space-4);
}
</style>
</head>
<body>
<div class="proto-bar">
  <h1>İlanlar — prototip</h1>
  <p>Sağdaki iki düğme onaylı yön ile tazelenmiş yön arasında geçiş yapar. Her ikisi de uygulamanın kendi CSS dosyasından üretildi; içerik temsilî.</p>
  <div class="proto-tabs" role="tablist">
    ${tabs.map(([id, label], i) => `<button data-screen="${id}"${i === 0 ? ' aria-current="true"' : ""} type="button">${label}</button>`).join("\n    ")}
  </div>
  <div class="proto-widths proto-tabs">
    <button data-width="" aria-current="true" type="button">Masaüstü</button>
    <button data-width="w-tablet" type="button">Tablet 768</button>
    <button data-width="w-mobile" type="button">Telefon 375</button>
    <span class="proto-sep"></span>
    <button data-dir="refresh" aria-current="true" type="button">Tazelenmiş yön</button>
    <button data-dir="" type="button">Mevcut yön</button>
  </div>
</div>

${screens.join("\n")}

<p class="proto-note">
  Bu bir prototiptir. Renk, tipografi, aralık ve her bileşen kuralı uygulamanın
  yayınladığı stil dosyasından geliyor; ilanlar, işletmeler ve kategoriler
  temsilîdir çünkü platformda henüz veri yok. Türkçe metinler copy modüllerinden
  alındı.
</p>

<script>
const show = (id) => {
  for (const s of document.querySelectorAll(".screen"))
    s.classList.toggle("is-active", s.id === id);
  for (const b of document.querySelectorAll("[data-screen]"))
    b.setAttribute("aria-current", String(b.dataset.screen === id));
  window.scrollTo(0, 0);
};
for (const b of document.querySelectorAll("[data-screen]"))
  b.addEventListener("click", () => show(b.dataset.screen));
for (const a of document.querySelectorAll('a[href^="#"]'))
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    if (document.getElementById(id)) { e.preventDefault(); show(id); }
  });
let width = "";
let direction = "refresh";
const apply = () => {
  document.body.className = [width, direction].filter(Boolean).join(" ");
};
for (const b of document.querySelectorAll("[data-width]"))
  b.addEventListener("click", () => {
    width = b.dataset.width;
    apply();
    for (const o of document.querySelectorAll("[data-width]"))
      o.setAttribute("aria-current", String(o === b));
  });
for (const b of document.querySelectorAll("[data-dir]"))
  b.addEventListener("click", () => {
    direction = b.dataset.dir;
    apply();
    for (const o of document.querySelectorAll("[data-dir]"))
      o.setAttribute("aria-current", String(o === b));
  });
apply();
show("home");
</script>
</body>
</html>
`;

writeFileSync("prototype.html", html);
console.log(`prototype.html written — ${html.length} bytes, ${screens.length} screens`);
