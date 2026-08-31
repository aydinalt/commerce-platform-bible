/**
 * The structured-data driver.
 *
 * **Structured data is the one part of a page nobody can see is wrong.** A
 * broken layout is reported within the hour; a `lowPrice` that disagrees with
 * the cheapest row, an `offerCount` counting something else, a review count
 * that is not the number of reviews on the page — these render as nothing at
 * all, and the first symptom is a manual action months later. So every field
 * below is checked against the catalogue it claims to describe, rather than
 * against a fixture that would drift with it.
 *
 * It bundles the real modules with esbuild and imports them; nothing here
 * re-implements a builder. Run: `node preview/seo.mjs`
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/*
 * The scratch directory sits inside `node_modules` rather than in `/tmp`, and
 * it has to. The route bundles leave `next` and `react` external — bundling
 * Next's server internals would be bundling the framework rather than testing
 * the route — so Node resolves those imports from wherever the file sits. From
 * `/tmp` it resolves nothing. `node_modules` is already ignored by git.
 */
const work = mkdtempSync(resolve(root, "node_modules/.seo-"));
const out = resolve(work, "seo.mjs");

await esbuild.build({
  bundle: true,
  charset: "utf8",
  entryPoints: [resolve(root, "src/lib/seo.ts")],
  format: "esm",
  outfile: out,
  platform: "node",
  tsconfig: resolve(root, "tsconfig.json")
});

const seo = await import(pathToFileURL(out).href);
const { PRODUCTS, CATEGORIES } = await (async () => {
  const catalogue = resolve(work, "products.mjs");
  await esbuild.build({
    bundle: true,
    charset: "utf8",
    entryPoints: [resolve(root, "src/lib/products.ts")],
    format: "esm",
    outfile: catalogue,
    platform: "node",
    tsconfig: resolve(root, "tsconfig.json")
  });
  return import(pathToFileURL(catalogue).href);
})();

let pass = 0;
let fail = 0;
const check = (label, ok, detail = "") => {
  if (ok) {
    pass++;
    return;
  }
  fail++;
  console.log(`FAIL ${label}${detail ? `  → ${detail}` : ""}`);
};
const group = (name) => console.log(`\n── ${name}`);

/* ------------------------------------------------------- 1. the Product node */

group("Product düğümü");

const titles = new Set();
const descriptions = new Set();

for (const product of PRODUCTS) {
  const node = seo.productJsonLd(product);
  const label = product.slug;

  check(`${label}: @type Product`, node["@type"] === "Product");
  check(`${label}: adı katalogla aynı`, node.name === product.name);
  check(`${label}: sku slug`, node.sku === product.slug);
  check(`${label}: markası var`, node.brand?.name === product.brand);
  check(
    `${label}: url mutlak ve kendi sayfası`,
    node.url === `https://ilanlar.example/urun/${product.slug}`,
    String(node.url)
  );
  check(
    `${label}: çıkış yılı`,
    node.releaseDate === String(product.releaseYear)
  );

  /*
   * The rating and the reviews must describe the same list the page renders.
   * `reviewCount` is the length of that list rather than `product.reviewCount`,
   * which is a headline figure the seed file sets independently — marking up a
   * count larger than the reviews on the page is precisely what Google's
   * policy forbids.
   */
  if (product.reviews.length > 0) {
    check(
      `${label}: reviewCount ekrandaki yorum sayısı`,
      node.aggregateRating.reviewCount === product.reviews.length,
      `${node.aggregateRating.reviewCount} ≠ ${product.reviews.length}`
    );
    check(
      `${label}: ratingValue katalogla aynı`,
      node.aggregateRating.ratingValue === product.rating
    );
    check(
      `${label}: her yorum düğümü var`,
      node.review.length === product.reviews.length
    );
    check(
      `${label}: yorumların yazarı ve tarihi var`,
      node.review.every(
        (review) =>
          typeof review.author?.name === "string" &&
          review.author.name.length > 0 &&
          /^\d{4}-\d{2}-\d{2}/u.test(review.datePublished) &&
          typeof review.reviewBody === "string"
      )
    );
  }

  if (product.pricingKind === "FIXED") {
    const prices = product.offers.map((offer) => offer.price);
    check(`${label}: offers var`, node.offers !== undefined);
    check(
      `${label}: lowPrice gerçekten en düşük`,
      node.offers.lowPrice === Math.min(...prices),
      `${node.offers.lowPrice} ≠ ${Math.min(...prices)}`
    );
    check(
      `${label}: highPrice gerçekten en yüksek`,
      node.offers.highPrice === Math.max(...prices)
    );
    check(
      `${label}: offerCount satıcı sayısı`,
      node.offers.offerCount === product.offers.length
    );
    check(`${label}: para birimi TRY`, node.offers.priceCurrency === "TRY");
    check(
      `${label}: her satıcı bir Offer`,
      node.offers.offers.length === product.offers.length
    );
    check(
      `${label}: stok durumu satıcının söylediği`,
      node.offers.offers.every((offer, index) =>
        product.offers[index].stock === null
          ? offer.availability === "https://schema.org/OutOfStock"
          : offer.availability === "https://schema.org/InStock"
      )
    );
    check(
      `${label}: satıcı adları taşınıyor`,
      node.offers.offers.every(
        (offer, index) =>
          offer.seller.name === product.offers[index].merchant.name
      )
    );
  } else {
    /*
     * **The assertion this file exists for.** PRD-0001 v4.0 §5.10.5: an
     * Offering with no amount is not silently given one. A `0` here would be
     * a machine-readable claim that the thing is free, and a search engine
     * that believed it would print "₺0" beside a commercial property.
     */
    check(`${label}: fiyatsız ilan offers taşımıyor`, node.offers === undefined);
    check(
      `${label}: hiçbir yere sıfır fiyat yazılmamış`,
      !/"price":\s*0\b/u.test(JSON.stringify(node)),
      JSON.stringify(node).slice(0, 120)
    );
  }

  titles.add(product.name);
  descriptions.add(seo.clamp(product.description, 300));
}

/* ------------------------------------------------------ 2. the editorial node */

group("Editoryal inceleme düğümü");

for (const product of PRODUCTS.slice(0, 5)) {
  const node = seo.editorialJsonLd(product);
  check(`${product.slug}: @type Review`, node["@type"] === "Review");
  check(
    `${product.slug}: yayın tarihi`,
    node.datePublished === product.editorial.publishedAt
  );
  /*
   * The revision date, and it is the field that matters. A verdict about value
   * written two years ago and never re-checked is a stale claim; a page that
   * cannot say when it was last checked cannot be told apart from one that
   * never was.
   */
  check(
    `${product.slug}: güncelleme tarihi`,
    node.dateModified === product.editorial.updatedAt
  );
  check(
    `${product.slug}: 10 üzerinden puan`,
    node.reviewRating.bestRating === 10 &&
      node.reviewRating.ratingValue === product.editorial.score
  );
  check(
    `${product.slug}: incelenen ürüne bağlı`,
    node.itemReviewed.url.endsWith(`/urun/${product.slug}`)
  );
}

/* --------------------------------------------------------- 3. the categories */

group("Kategori düğümü ve metni");

check(
  "all indekslenmiyor",
  !seo.INDEXABLE_CATEGORIES.some((category) => category.id === "all")
);
/*
 * **The check above passed for the wrong reason until this one existed.**
 * Mutation testing removed the explicit `id !== "all"` guard and nothing
 * failed — because no product carries `all` as its category, so the "has
 * listings" condition excluded it anyway. The check was measuring a
 * coincidence.
 *
 * So the guard is exercised against a catalogue in which it is the only thing
 * doing the work: a fabricated product sitting in `all`. If somebody deletes
 * the guard, this fails; the real catalogue cannot say that.
 */
check(
  "all, ilanı olsaydı bile indekslenmezdi",
  !seo
    .indexableCategories(CATEGORIES, [
      ...PRODUCTS,
      { ...PRODUCTS[0], categoryId: "all", slug: "uydurma" }
    ])
    .some((category) => category.id === "all")
);
check(
  "ilanı olmayan kategori de indekslenmez",
  seo.indexableCategories(
    [...CATEGORIES, { commission: "—", id: "bos", intake: "FEED", name: "Boş" }],
    PRODUCTS
  ).length === seo.INDEXABLE_CATEGORIES.length
);
check(
  "boş kategori indekslenmiyor",
  seo.INDEXABLE_CATEGORIES.every((category) =>
    PRODUCTS.some((product) => product.categoryId === category.id)
  )
);

const categoryTitles = new Set();
for (const category of seo.INDEXABLE_CATEGORIES) {
  const node = seo.categoryJsonLd(category);
  const items = PRODUCTS.filter(
    (product) => product.categoryId === category.id
  );

  check(`${category.id}: @type ItemList`, node["@type"] === "ItemList");
  check(
    `${category.id}: numberOfItems ilan sayısı`,
    node.numberOfItems === items.length,
    `${node.numberOfItems} ≠ ${items.length}`
  );
  check(
    `${category.id}: pozisyonlar 1'den başlıyor ve atlamıyor`,
    node.itemListElement.every((entry, index) => entry.position === index + 1)
  );
  check(
    `${category.id}: sıralama ekranla aynı (ucuzdan pahalıya)`,
    node.itemListElement.every((entry, index) => {
      const sorted = [...items].sort((a, b) => a.lowestPrice - b.lowestPrice);
      return entry.url.endsWith(`/urun/${sorted[index].slug}`);
    })
  );

  const copy = seo.categoryCopy(category);
  check(
    `${category.id}: başlık kategori adını taşıyor`,
    copy.title.includes(category.name)
  );
  check(
    `${category.id}: açıklama ilan sayısını söylüyor`,
    copy.description.includes(String(items.length))
  );
  check(`${category.id}: açıklama 156 karakteri geçmiyor`, copy.description.length <= 156, String(copy.description.length));
  categoryTitles.add(copy.title);
}

/*
 * Two pages with the same title compete with each other for the same query and
 * one of them loses — the failure is called cannibalisation and it is invisible
 * from inside the site.
 */
check(
  "her kategorinin başlığı benzersiz",
  categoryTitles.size === seo.INDEXABLE_CATEGORIES.length,
  `${categoryTitles.size} / ${seo.INDEXABLE_CATEGORIES.length}`
);
check("her ürünün adı benzersiz", titles.size === PRODUCTS.length);
check(
  "her ürünün açıklaması benzersiz",
  descriptions.size === PRODUCTS.length,
  `${descriptions.size} / ${PRODUCTS.length}`
);

/* -------------------------------------------------------- 4. breadcrumb, site */

group("Kırıntı yolu ve site düğümü");

const trail = seo.breadcrumbJsonLd([
  { name: "Tüm ürünler", path: "/" },
  { name: "Sigorta Hizmetleri", path: "/kategori/insurance" },
  { name: "Bir ürün", path: "/urun/x" }
]);
check("@type BreadcrumbList", trail["@type"] === "BreadcrumbList");
check(
  "pozisyonlar sırayla",
  trail.itemListElement.map((entry) => entry.position).join() === "1,2,3"
);
check(
  "adresler mutlak",
  trail.itemListElement.every((entry) => entry.item.startsWith("https://"))
);

const site = seo.websiteJsonLd();
check("@type WebSite", site["@type"] === "WebSite");
check("dili tr-TR", site.inLanguage === "tr-TR");
check(
  "arama eylemi gerçek parametreyi gösteriyor",
  site.potentialAction.target.urlTemplate.includes("{arama}") &&
    site.potentialAction["query-input"] === "required name=arama"
);

/* ------------------------------------------------------------- 5. the helpers */

group("Yardımcılar");

check("clamp kısa metne dokunmuyor", seo.clamp("kısa") === "kısa");
const long = seo.clamp("a".repeat(40) + " " + "kelime ".repeat(40));
check("clamp 155 karakteri geçmiyor", long.length <= 155, String(long.length));
check("clamp kelimenin ortasından kesmiyor", /(?:\s\S*)?…$/u.test(long) && !/\s…$/u.test(long), long.slice(-30));
check(
  "clamp boşlukları tekilleştiriyor",
  seo.clamp("iki   boşluk\n\nvar") === "iki boşluk var"
);
check(
  "absoluteUrl köke göre çözüyor",
  seo.absoluteUrl("/urun/x") === "https://ilanlar.example/urun/x"
);
check(
  "categoryPath hem nesne hem kimlik alıyor",
  seo.categoryPath("insurance") === "/kategori/insurance" &&
    seo.categoryPath({ id: "home" }) === "/kategori/home"
);

/*
 * The escape the `JsonLd` component performs. A review body containing a
 * closing script tag would otherwise end the tag early — today that spills
 * JSON onto the screen, and on the day reviews come from people rather than
 * from a seed file it is a script injection.
 */
const escaped = JSON.stringify({ body: "</script><img onerror=x>" }).replace(
  /</gu,
  "\\u003c"
);
check("</script> kaçırılıyor", !escaped.includes("</script>") && !escaped.includes("<"));

/* ------------------------------------------------ 6. the routes, not the libs */

/**
 * **Everything above proves the builders are right; this proves the routes
 * use them.** A correct `productJsonLd` that no page calls is worth nothing,
 * and that gap is invisible from either side — the module's checks pass and
 * the page renders.
 *
 * `generateMetadata` is an ordinary async function, so it can be called here
 * without Next: the route module is bundled with `next/*` and React left
 * external, then imported and asked the same question the framework asks it.
 * `JsonLd` is rendered with `react-dom/server`, which is what the framework
 * does with it.
 */
group("Rotalar builder'ları gerçekten kullanıyor mu");

/*
 * `next/navigation` is stubbed rather than left external: its package exports
 * are not resolvable outside Next's own loader, and `notFound()` is not what
 * is under test here — `generateMetadata` is. The stub throws, so a route that
 * reached it during a metadata call would fail loudly rather than quietly
 * return something.
 */
writeFileSync(
  resolve(work, "navigation-stub.mjs"),
  'export function notFound() { throw new Error("NEXT_NOT_FOUND"); }\n'
);

const routeBundle = async (entry, name) => {
  const file = resolve(work, `${name}.mjs`);
  await esbuild.build({
    alias: {
      "next/link": resolve(here, "next-link.tsx"),
      "next/navigation": resolve(work, "navigation-stub.mjs")
    },
    bundle: true,
    charset: "utf8",
    entryPoints: [resolve(root, entry)],
    external: ["react", "react/*", "react-dom", "react-dom/*"],
    format: "esm",
    jsx: "automatic",
    outfile: file,
    platform: "node",
    tsconfig: resolve(root, "tsconfig.json")
  });
  return import(pathToFileURL(file).href);
};

const productRoute = await routeBundle("src/app/urun/[slug]/page.tsx", "urun");
const sample = PRODUCTS.find((product) => product.pricingKind === "FIXED");
const meta = await productRoute.generateMetadata({
  params: Promise.resolve({ slug: sample.slug })
});

check("ürün: başlık ürünün adı", meta.title === sample.name);
check(
  "ürün: kanonik adres kendi yolu",
  meta.alternates.canonical === `/urun/${sample.slug}`,
  String(meta.alternates?.canonical)
);
/*
 * The description is the sentence under the link in a result. It has to carry
 * the number, because the number is the only thing distinguishing this page
 * from the merchant's own.
 */
check(
  "ürün: açıklama en düşük fiyatı söylüyor",
  meta.description.includes(sample.lowestPrice.toLocaleString("tr-TR")),
  meta.description
);
check(
  "ürün: açıklama satıcı sayısını söylüyor",
  meta.description.includes(String(sample.offerCount))
);
check("ürün: açıklama 156 karakteri geçmiyor", meta.description.length <= 156, String(meta.description.length));
check("ürün: Open Graph var", meta.openGraph.title === sample.name);
check("ürün: Twitter kartı büyük görsel", meta.twitter.card === "summary_large_image");

const unpriced = PRODUCTS.find((product) => product.pricingKind === "ON_REQUEST");
const unpricedMeta = await productRoute.generateMetadata({
  params: Promise.resolve({ slug: unpriced.slug })
});
check(
  "fiyatsız ürün: açıklamada uydurma fiyat yok",
  unpricedMeta.description.includes("talebinize göre") &&
    !unpricedMeta.description.includes("0 ₺"),
  unpricedMeta.description
);

const missing = await productRoute.generateMetadata({
  params: Promise.resolve({ slug: "yok-boyle-bir-sey" })
});
check("olmayan ürün: başlık bulunamadı diyor", missing.title === "Ürün bulunamadı");

const categoryRoute = await routeBundle(
  "src/app/kategori/[slug]/page.tsx",
  "kategori"
);
const params = categoryRoute.generateStaticParams();
check(
  "kategori: on bir rota önceden üretiliyor",
  params.length === seo.INDEXABLE_CATEGORIES.length,
  String(params.length)
);
check(
  "kategori: 'all' önceden üretilmiyor",
  !params.some((entry) => entry.slug === "all")
);
const catMeta = await categoryRoute.generateMetadata({
  params: Promise.resolve({ slug: "insurance" })
});
check(
  "kategori: kanonik adres rota biçiminde",
  catMeta.alternates.canonical === "/kategori/insurance",
  String(catMeta.alternates?.canonical)
);
check(
  "kategori: başlık kategori adını taşıyor",
  catMeta.title.includes("Sigorta Hizmetleri")
);
check(
  "kategori: 'all' için metadata üretilmiyor",
  Object.keys(
    await categoryRoute.generateMetadata({ params: Promise.resolve({ slug: "all" }) })
  ).length === 0
);

/* The sitemap and robots, as the framework will read them. */
const sitemapModule = await routeBundle("src/app/sitemap.ts", "sitemap");
const map = sitemapModule.default();
check(
  "sitemap: ana sayfa + kategoriler + ürünler",
  map.length === 1 + seo.INDEXABLE_CATEGORIES.length + PRODUCTS.length,
  String(map.length)
);
check(
  "sitemap: her adres mutlak",
  map.every((entry) => entry.url.startsWith("https://"))
);
check(
  "sitemap: hiçbir adres sorgu dizesi taşımıyor",
  map.every((entry) => !entry.url.includes("?")),
  map.find((entry) => entry.url.includes("?"))?.url ?? ""
);
check(
  "sitemap: adresler benzersiz",
  new Set(map.map((entry) => entry.url)).size === map.length
);
/*
 * A sitemap where every page changed today teaches a crawler that the date
 * means nothing, and it then ignores the date on the pages that really did
 * change.
 */
check(
  "sitemap: tarihler 'bugün' değil, içerikten geliyor",
  map.filter((entry) => Date.now() - entry.lastModified.getTime() < 60_000)
    .length === 1
);

const robotsModule = await routeBundle("src/app/robots.ts", "robots");
const robots = robotsModule.default();
check("robots: sitemap gösteriliyor", robots.sitemap.endsWith("/sitemap.xml"));
check(
  "robots: filtre sorguları taranmıyor",
  robots.rules[0].disallow.includes("/?kategori=")
);
check(
  "robots: kategori rotaları engellenmiyor",
  !robots.rules[0].disallow.some((rule) => rule.startsWith("/kategori/"))
);

/* The component that puts a node on the page. */
const { renderToStaticMarkup } = await import("react-dom/server");
const jsx = await routeBundle("src/components/site/JsonLd.tsx", "jsonld");
const markup = renderToStaticMarkup(
  jsx.JsonLd({
    nodes: [{ body: "</script><img onerror=x>", "@type": "Test" }]
  })
);
check(
  "JsonLd: ld+json türüyle basılıyor",
  markup.includes('type="application/ld+json"'),
  markup.slice(0, 80)
);
check(
  "JsonLd: kapanış etiketi kaçırılıyor",
  !markup.includes("</script><img"),
  markup.slice(0, 160)
);
check("JsonLd: içerik geçerli JSON", (() => {
  const inner = markup.replace(/^[\s\S]*?>|<\/script>[\s\S]*$/gu, "");
  try {
    return JSON.parse(inner.replace(/\\u003c/gu, "<"))["@type"] === "Test";
  } catch {
    return false;
  }
})());

rmSync(work, { force: true, recursive: true });

console.log(`\n${pass} geçti, ${fail} kaldı`);
process.exit(fail === 0 ? 0 : 1);
