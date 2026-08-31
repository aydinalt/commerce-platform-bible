import type {
  Category,
  Editorial,
  Merchant,
  OfferSource,
  PriceOffer,
  Product,
  Review,
  Spec
} from "./types";

/**
 * The prototype's content.
 *
 * **Invented, and it has to be.** The platform has no seed catalogue, no
 * prices, no merchants and no images — `SURFACE_INVENTORY.md` §7 records all
 * four as absent so that nobody designs a field the datamodel cannot fill.
 * This file is that field being designed anyway, on purpose, so the shape can
 * be judged before it is built.
 *
 * The specification depth is modelled on an Epey product page: twelve groups
 * and sixty rows for a phone, values as chips rather than sentences, because
 * that is what makes a specification comparable rather than merely readable.
 *
 * Prices are plausible for the Turkish market in 2026 and are not quotations.
 * Brands are invented. Nothing here is a claim about a real product.
 */

/**
 * The categories, rebuilt from the Owner's affiliate analysis.
 *
 * The five that were here were a shop's categories — phone, laptop, audio,
 * cosmetics, garden — and they described *what is being sold*. **The analysis
 * separates the market by how a price can be obtained at all**, and that is a
 * different cut: games and hosting arrive as clean network datafeeds with
 * deep-links and identifiers included, general e-commerce needs a merchant API
 * per marketplace, and the rest is a scraping problem carrying the legal and
 * anti-bot exposure the analysis sets out at length.
 *
 * So each category records its intake model and its commission band. That is
 * not decoration: it is the build order. A category reached by a feed can be
 * filled this month; one that needs scraping cannot, and pretending otherwise
 * is how a catalogue ends up half empty with nobody able to say why.
 *
 * The commission bands are the analysis's own figures and are a market
 * observation rather than a quotation.
 */
export const CATEGORIES: Category[] = [
  {
    commission: "—",
    id: "all",
    intake: "FEED",
    name: "Tüm kategoriler"
  },
  {
    commission: "%15 – %40 (yinelenen)",
    id: "software",
    intake: "FEED",
    name: "Yazılım, Yapay Zeka ve Dijital Araçlar"
  },
  {
    commission: "%40 – %60 komisyon iadesi",
    id: "finance",
    intake: "API",
    name: "Finans, Kripto ve Yatırım"
  },
  {
    commission: "Poliçe başı sabit ücret",
    id: "insurance",
    intake: "API",
    name: "Sigorta Hizmetleri"
  },
  {
    commission: "İlan başı / anlaşmalı",
    id: "realestate",
    intake: "SCRAPE",
    name: "Gayrimenkul ve Emlak"
  },
  {
    commission: "%2 – %10",
    id: "electronics",
    intake: "API",
    name: "Teknoloji ve Tüketici Elektroniği"
  },
  {
    commission: "%20 – %50",
    id: "education",
    intake: "FEED",
    name: "Eğitim ve Çevrimiçi Gelişim"
  },
  {
    commission: "%4 – %12",
    id: "beauty",
    intake: "SCRAPE",
    name: "Sağlık, Kozmetik ve Kişisel Bakım"
  },
  {
    commission: "%2,5 – %7,5",
    id: "gaming",
    intake: "FEED",
    name: "Oyun, E-Spor ve Dijital Eğlence"
  },
  {
    commission: "%4 – %10",
    id: "home",
    intake: "API",
    name: "Ev, Bahçe ve Akıllı Yaşam"
  },
  {
    commission: "Kiralama başı sabit / %3 – %8",
    id: "automotive",
    intake: "API",
    name: "Otomotiv ve Araç Kiralama"
  },
  {
    commission: "%3 – %6 (rezervasyon)",
    id: "travel",
    intake: "FEED",
    name: "Seyahat ve Turizm"
  }
];

/* ------------------------------------------------------------- merchants */

const M = (
  id: string,
  name: string,
  rating: number,
  authorised: boolean
): Merchant => ({ authorised, id, name, rating });

const SHOPS = [
  M("m1", "Teknoloji Deposu", 4.7, true),
  M("m2", "Vitrin Elektronik", 4.4, false),
  M("m3", "Anadolu Bilişim", 4.8, true),
  M("m4", "Mega Market", 4.1, false),
  M("m5", "Ege Teknoloji", 4.6, false),
  M("m6", "Pratik Alışveriş", 3.9, false),
  M("m7", "Nokta Hırdavat", 4.5, true),
  M("m8", "Yapı Dünyası", 4.2, false)
];

/**
 * Which intake produced each row.
 *
 * Deliberately mixed within one Product. A real comparison page is fed from
 * several places at once — an authorised dealer through a merchant API beside
 * a marketplace seller pulled from a network file — and a page that showed one
 * source for all eight rows would hide the thing the analysis is about.
 */
const SOURCES: OfferSource[] = [
  "API",
  "FEED",
  "API",
  "FEED",
  "SCRAPE",
  "FEED",
  "API",
  "SCRAPE"
];

const PROMOTIONS = [
  "Kredi kartına 6 taksit fırsatı",
  null,
  "2.500 TL üzeri siparişlerde 200 TL indirim",
  null,
  "Hafta sonuna özel kampanya",
  null
];

const DISPATCH = [
  "Aynı gün kargoda",
  "Yarın kargoda",
  "Aynı gün kargoda",
  "2–3 iş gününde",
  "Yarın kargoda",
  "3–5 iş gününde",
  "Yarın kargoda",
  "2–3 iş gününde"
];

/**
 * Builds a spread of offers around a base price.
 *
 * **The cheapest is not always first in this array**, and that is deliberate:
 * `sortedOffers` has to earn its result rather than receive it pre-sorted, and
 * a bug in it would otherwise be invisible.
 */
function offersAround(
  base: number,
  count: number,
  seed: number,
  title: string,
  /**
   * A digital licence has no shipping and no stock count, and pretending
   * otherwise breaks the one thing this list is for. `149 ₺ kargo` on a 149 ₺
   * game key would put the delivery charge at the same order as the product
   * and make the ordering nonsense.
   */
  digital = false
): PriceOffer[] {
  const spread = [0, 0.035, 0.062, 0.098, 0.15, 0.22, 0.29, 0.38];
  const variants = [
    title,
    `${title} - Türkiye Garantili`,
    title.toLocaleUpperCase("tr"),
    `${title} (Kutusu Açık)`,
    title,
    `${title} - Hızlı Teslimat`,
    title,
    title
  ];
  return SHOPS.slice(0, count).map((merchant, index) => {
    const outOfStock = !digital && (index + seed) % 5 === 4;
    const step = base < 1000 ? 1 : 10;
    return {
      dispatch: digital
        ? "Anında teslim"
        : (DISPATCH[(index + seed) % DISPATCH.length] ?? "Yarın kargoda"),
      listingTitle: variants[index] ?? title,
      merchant,
      price: Math.round((base * (1 + (spread[index] ?? 0.42))) / step) * step,
      promotion: PROMOTIONS[(index + seed) % PROMOTIONS.length] ?? null,
      seenAt: `2026-08-${String(26 + ((index + seed) % 5)).padStart(2, "0")}T${String(9 + ((index * 3 + seed) % 12)).padStart(2, "0")}:${String((index * 17 + seed * 7) % 60).padStart(2, "0")}:00`,
      shipping: digital || index % 3 === 0 ? 0 : 149,
      source: SOURCES[index] ?? "FEED",
      stock: outOfStock ? null : ([25, 3, 10, 7, 12, 2, 40, 5][index] ?? 5)
    };
  });
}

/* --------------------------------------------------------------- reviews */

/**
 * The review corpus.
 *
 * Written rather than generated from adjectives, because the point of showing
 * reviews in a prototype is to see whether the **shape** holds real prose: a
 * long complaint next to a two-line compliment, a three-star that is neither,
 * a verified badge that is absent more often than present. A page that looks
 * right filled with `Lorem ipsum` is a page nobody has actually reviewed.
 *
 * Each entry is a template because twenty products need reviews and the
 * differences that matter here are structural, not lexical.
 */
const REVIEW_POOL: {
  author: string;
  rating: number;
  title: string;
  body: (name: string) => string;
  verified: boolean;
  helpful: number;
  daysAgo: number;
}[] = [
  {
    author: "Mehmet A.",
    body: (name) =>
      `İki aydır kullanıyorum. Beklediğimden iyi çıktı, özellikle fiyatına göre. ${name} için buradaki karşılaştırmaya bakarak aldım, en ucuz satıcıda kargo dâhil 400 lira daha uygundu. Tek eksiği kutu içeriğinin sitede yazandan biraz farklı gelmesi — yedek parça çıkmadı.`,
    daysAgo: 6,
    helpful: 34,
    rating: 5,
    title: "Fiyatına göre fazlasıyla iyi",
    verified: true
  },
  {
    author: "Zeynep K.",
    body: (name) =>
      `Ürün fena değil ama abartıldığı kadar da değil. Günlük kullanımda sorun yok, yoğun kullanınca ısınıyor ve performansı biraz düşüyor. ${name} yerine bir üst modeli almak isteyenler aradaki farkı hesaplasın derim; bende fark 3.000 lira civarıydı ve şimdi düşünüyorum.`,
    daysAgo: 13,
    helpful: 21,
    rating: 3,
    title: "İyi ama beklentiyi biraz yüksek tutmayın",
    verified: true
  },
  {
    author: "Burak Ş.",
    body: () =>
      `Kargo hızlıydı, ürün orijinal ve faturalı geldi. Satıcı da ilgiliydi. Buradan yönlendiği için yazıyorum: listedeki en ucuz satıcı stokta yoktu, ikinci sıradakinden aldım ve aradaki fark 150 liraydı. Stok bilgisinin güncel olması gerçekten işe yarıyor.`,
    daysAgo: 21,
    helpful: 47,
    rating: 5,
    title: "Sorunsuz teslimat",
    verified: true
  },
  {
    author: "Elif D.",
    body: (name) =>
      `${name} aldım ama bende bir hafta sonra sorun çıktı, değişim yaptılar. Yeni gelen gayet iyi çalışıyor. Değişim süreci uzun sürdü, o yüzden dört yıldız. Ürünün kendisiyle bir sıkıntım yok.`,
    daysAgo: 29,
    helpful: 12,
    rating: 4,
    title: "İkinci üründe sorun kalmadı",
    verified: false
  },
  {
    author: "Onur T.",
    body: () =>
      `Fiyat/performans açısından bu segmentte alınabilecek en makul seçeneklerden. Karşılaştırma sekmesinden rakibiyle yan yana baktım, aradaki tek anlamlı fark garanti süresiydi. Uzun süre kullanacaksanız o farkı önemseyin.`,
    daysAgo: 38,
    helpful: 29,
    rating: 4,
    title: "Rakibiyle karşılaştırıp aldım",
    verified: true
  },
  {
    author: "Ayşe N.",
    body: (name) =>
      `Beklentimi karşılamadı. ${name} için yazılan özellikler doğru ama günlük kullanımda hissettirdiği kalite fiyatının altında. İade ettim. Yıldızım ürüne, satıcıya değil — satıcı süreçte gayet iyiydi.`,
    daysAgo: 44,
    helpful: 18,
    rating: 2,
    title: "Bana göre değildi, iade ettim",
    verified: true
  },
  {
    author: "Kerem Y.",
    body: () =>
      `Üç aydır kullanıyorum, hâlâ ilk günkü gibi. Bu tip ürünlerde asıl mesele ilk hafta değil üçüncü ay; o yüzden yorumu bekleyip yazdım. Fiyatı da o günden bu yana 600 lira düşmüş, alacaklar biraz daha bekleyebilir.`,
    daysAgo: 52,
    helpful: 63,
    rating: 5,
    title: "Üç ay sonra yazıyorum",
    verified: false
  },
  {
    author: "Selin B.",
    body: () =>
      `Ortalama. Ne çok iyi ne çok kötü. Alternatif ürünler bölümündeki ikinci seçenekle arasında ciddi fark yok, hangisi ucuzsa onu alın.`,
    daysAgo: 67,
    helpful: 9,
    rating: 3,
    title: "Ortalama bir ürün",
    verified: false
  }
];

const iso = (daysAgo: number) =>
  new Date(Date.UTC(2026, 7, 31) - daysAgo * 86_400_000)
    .toISOString()
    .slice(0, 10);

/**
 * The reviews shown for one Product.
 *
 * How many are shown is derived from `reviewCount` rather than fixed at eight,
 * so a Product with 12 reviews does not display the same wall as one with 214.
 * A prototype where every product has identical social proof teaches nothing
 * about the case where a new listing has almost none.
 */
function reviewsFor(seed: Seed): Review[] {
  const shown = Math.max(2, Math.min(REVIEW_POOL.length, Math.round(seed.reviewCount / 12)));
  return REVIEW_POOL.slice(0, shown).map((entry, index) => ({
    author: entry.author,
    body: entry.body(seed.name),
    date: iso(entry.daysAgo + index),
    helpful: entry.helpful,
    id: `${seed.id}-r${index}`,
    rating: entry.rating,
    title: entry.title,
    verified: entry.verified
  }));
}

/* ------------------------------------------------------------- editorial */

/**
 * The deep review.
 *
 * Structured rather than one prose blob because that structure is what a
 * search engine reads: a verdict, headed sections, an explicit pros and cons
 * list, and — the part most comparison sites omit — **the date it was last
 * revised**. A three-year-old review with no revision date is worse than no
 * review, because it looks current.
 */
function editorialFor(seed: Seed): Editorial {
  const first = seed.specs.find((spec) => spec.key);
  const second = seed.specs.filter((spec) => spec.key)[1];
  return {
    author: "Editör ekibi",
    cons: [
      "Kutu içeriği satıcıdan satıcıya değişiyor; sipariş öncesi listeyi karşılaştırın",
      "Fiyat bandının üst ucundaki satıcılarla en ucuz arasında kayda değer fark var",
      "Garanti süresi rakiplerinin bir kısmının gerisinde"
    ],
    pros: [
      first ? `${first.label}: ${first.chips.join(", ")}` : "Sınıfına göre dengeli donanım",
      second ? `${second.label}: ${second.chips.join(", ")}` : "Günlük kullanımda beklenen performans",
      "Aynı fiyat bandındaki alternatiflere göre daha geniş satıcı ağı"
    ],
    publishedAt: seed.listedAt,
    score: Math.round((seed.popularity / 10) * 10) / 10,
    sections: [
      {
        body: `${seed.name}, ${seed.brand} tarafından bu fiyat bandında konumlandırılan bir seçenek. Bu incelemede ürünü kâğıt üzerindeki özellikleriyle değil, aynı bantta yer alan alternatiflerle yan yana koyarak değerlendiriyoruz — çünkü tek başına bir özellik listesi hiçbir satın alma kararını vermez. Karşılaştırma sekmesinden aynı kategorideki başka bir ürünü seçip aradaki farkı satır satır görebilirsiniz.`,
        heading: "Kısaca ne sunuyor?"
      },
      {
        body: `Günlük kullanımda ürünün en belirgin tarafı ${first ? first.label.toLocaleLowerCase("tr") : "temel donanımı"}. Bu, ilk haftada değil üçüncü ayda fark edilen türden bir özellik: kullanıcı yorumlarında da en çok bu başlık öne çıkıyor. Kısa süreli testlerde ayırt edilemeyen farklar burada belirginleşiyor.`,
        heading: "Günlük kullanımda nasıl?"
      },
      {
        body: `${seed.name} fiyatı satıcıya göre kayda değer biçimde değişiyor ve fark yalnızca etikette değil kargo bedelinde de. Aşağıdaki satıcı listesi kargo dâhil toplam tutara göre sıralanır; en üstteki satır, o an gerçekten en az ödeyeceğiniz seçenektir. Fiyatların ne zaman okunduğu her satırın yanında yazar, çünkü tarihi olmayan bir fiyat bilgi değildir.`,
        heading: "Fiyat tarafı: nereye bakmalı?"
      },
      {
        body: `Bu ürünü, aynı kategoride benzer bütçedeki alternatiflerle karşılaştırmadan almayın. Bütçe çubuğunu daraltıp listenin nasıl değiştiğine bakmak, çoğu zaman tek bir ürün sayfasında geçirilen yarım saatten daha yararlıdır. Karar veremediğiniz noktada karşılaştırma sekmesi iki ürünü tek tabloda gösterir.`,
        heading: "Kimin için doğru seçim?"
      }
    ],
    updatedAt: iso(seed.updatedDaysAgo ?? 3),
    verdict:
      seed.verdict ??
      `${seed.name}, kendi fiyat bandında dengeli bir seçenek; kararı satıcılar arasındaki fark belirliyor.`,
    video:
      seed.reviewCount > 60
        ? { duration: "8:24", title: `${seed.name} detaylı video inceleme` }
        : null
  };
}

/* ----------------------------------------------------------------- specs */

const s = (group: string, label: string, value: string | string[], key = false): Spec => ({
  chips: Array.isArray(value) ? value : [value],
  group,
  key,
  label
});

/** Epey-grade: twelve groups, sixty rows. */
function phoneSpecs(v: {
  screen: string;
  panel: string;
  resolution: string;
  ppi: string;
  refresh: string;
  ratio: string;
  glass: string;
  battery: string;
  charge: string;
  chipset: string;
  cpu: string;
  gpu: string;
  nm: string;
  ram: string;
  ramType: string;
  storage: string;
  storageType: string;
  camera: string;
  aperture: string;
  ultra: string;
  front: string;
  weight: string;
  height: string;
  width: string;
  thickness: string;
  os: string;
  ui: string;
  wifi: string;
  bt: string;
  ip: string;
  year: string;
  colours: string[];
}): Spec[] {
  return [
    s("EKRAN", "Ekran boyutu", v.screen, true),
    s("EKRAN", "Ekran teknolojisi", v.panel, true),
    s("EKRAN", "Ekran çözünürlüğü", v.resolution),
    s("EKRAN", "Piksel yoğunluğu", v.ppi),
    s("EKRAN", "Ekran yenileme hızı", v.refresh, true),
    s("EKRAN", "Ekran oranı", v.ratio),
    s("EKRAN", "Ekran dayanıklılığı", v.glass),
    s("EKRAN", "Ekran özellikleri", ["Çizilmeye dirençli cam", "Multi touch", "HDR10+"]),

    s("BATARYA", "Batarya kapasitesi", v.battery, true),
    s("BATARYA", "Hızlı şarj gücü", v.charge, true),
    s("BATARYA", "Batarya teknolojisi", "Li-ion Polymer (Li-Po)"),
    s("BATARYA", "Kablosuz şarj", "Var"),
    s("BATARYA", "Ters şarj", "Var (7,5 W)"),
    s("BATARYA", "Değişir batarya", "Yok"),

    s("KAMERA", "Kamera çözünürlüğü", v.camera, true),
    s("KAMERA", "Diyafram açıklığı", v.aperture),
    s("KAMERA", "Optik görüntü sabitleyici (OIS)", "Var"),
    s("KAMERA", "İkinci arka kamera", v.ultra),
    s("KAMERA", "Üçüncü arka kamera", "2 MP makro"),
    s("KAMERA", "Ön kamera çözünürlüğü", v.front),
    s("KAMERA", "Video kayıt çözünürlüğü", "4K (2160p)"),
    s("KAMERA", "Video FPS değeri", "60 fps"),
    s("KAMERA", "Kamera özellikleri", ["Portre modu (Bokeh)", "Gece modu", "PDAF", "HDR", "Panorama"]),
    s("KAMERA", "Flaş", "LED"),

    s("TEMEL DONANIM", "Yonga seti (Chipset)", v.chipset, true),
    s("TEMEL DONANIM", "Ana işlemci (CPU)", v.cpu),
    s("TEMEL DONANIM", "CPU çekirdeği", "8 çekirdek"),
    s("TEMEL DONANIM", "Grafik işlemcisi (GPU)", v.gpu),
    s("TEMEL DONANIM", "CPU üretim teknolojisi", v.nm),
    s("TEMEL DONANIM", "İşlemci mimarisi", "64-bit"),

    s("BELLEK", "RAM kapasitesi", v.ram, true),
    s("BELLEK", "RAM tipi", v.ramType),
    s("BELLEK", "Dahili depolama", v.storage, true),
    s("BELLEK", "Depolama biçimi", v.storageType),
    s("BELLEK", "Hafıza kartı yuvası", "Yok"),
    s("BELLEK", "Diğer seçenekler", ["8/12 GB RAM", "256/512 GB depolama"]),

    s("TASARIM", "Ağırlık", v.weight),
    s("TASARIM", "Boy", v.height),
    s("TASARIM", "En", v.width),
    s("TASARIM", "Kalınlık", v.thickness),
    s("TASARIM", "Renk seçenekleri", v.colours),
    s("TASARIM", "Gövde malzemesi", "Alüminyum çerçeve, cam arka"),

    s("İŞLETİM SİSTEMİ", "İşletim sistemi", v.os, true),
    s("İŞLETİM SİSTEMİ", "Kullanıcı arayüzü", v.ui),
    s("İŞLETİM SİSTEMİ", "Güncelleme taahhüdü", "4 yıl sürüm, 5 yıl güvenlik"),

    s("AĞ BAĞLANTILARI", "4.5G desteği", "Var"),
    s("AĞ BAĞLANTILARI", "5G", "Var", true),
    s("AĞ BAĞLANTILARI", "Hat sayısı", "Çift hat"),
    s("AĞ BAĞLANTILARI", "SIM", ["Nano-SIM (4FF)", "eSIM"]),

    s("KABLOSUZ BAĞLANTILAR", "Wi-Fi kanalları", v.wifi),
    s("KABLOSUZ BAĞLANTILAR", "Wi-Fi özellikleri", ["Dual-Band (5 GHz)", "Wi-Fi Direct", "Hotspot", "VoWiFi"]),
    s("KABLOSUZ BAĞLANTILAR", "Bluetooth versiyonu", v.bt),
    s("KABLOSUZ BAĞLANTILAR", "NFC", "Var", true),
    s("KABLOSUZ BAĞLANTILAR", "Navigasyon", ["GPS", "A-GPS", "GLONASS", "Galileo", "BeiDou"]),

    s("ÇOKLU ORTAM", "Hoparlör özellikleri", ["Stereo", "Çift hoparlör"]),
    s("ÇOKLU ORTAM", "Ses çıkışı", "USB Type-C"),
    s("ÇOKLU ORTAM", "Ses teknolojileri", ["Dolby Atmos", "Hi-Res Audio"]),

    s("ÖZELLİKLER", "Suya dayanıklılık", v.ip, true),
    s("ÖZELLİKLER", "Parmak izi okuyucu", "Ekran içinde"),
    s("ÖZELLİKLER", "Yüz tanıma", "Var"),
    s("ÖZELLİKLER", "Sensörler", ["İvmeölçer", "Jiroskop", "Pusula", "Ortam ışığı", "Yakınlık"]),

    s("DİĞER BAĞLANTILAR", "USB bağlantı tipi", "USB Type-C"),
    s("DİĞER BAĞLANTILAR", "USB versiyonu", "3.2 Gen 1"),
    s("DİĞER BAĞLANTILAR", "USB özellikleri", "USB On-the-go (OTG)"),

    s("TEMEL BİLGİLER", "Çıkış yılı", v.year),
    s("TEMEL BİLGİLER", "Garanti", "24 ay Türkiye garantisi"),
    s("TEMEL BİLGİLER", "Kutu içeriği", ["Cihaz", "USB-C kablo", "SIM iğnesi", "Kılavuz"])
  ];
}

function laptopSpecs(v: {
  cpu: string;
  cores: string;
  ram: string;
  storage: string;
  screen: string;
  resolution: string;
  gpu: string;
  battery: string;
  weight: string;
}): Spec[] {
  return [
    s("PERFORMANS", "İşlemci", v.cpu, true),
    s("PERFORMANS", "Çekirdek sayısı", v.cores),
    s("PERFORMANS", "Ekran kartı", v.gpu, true),
    s("PERFORMANS", "İşlemci üretim teknolojisi", "3 nm"),
    s("BELLEK", "RAM kapasitesi", v.ram, true),
    s("BELLEK", "RAM tipi", "LPDDR5X 6400 MHz"),
    s("BELLEK", "Depolama", v.storage, true),
    s("BELLEK", "Depolama tipi", "NVMe PCIe 4.0 SSD"),
    s("EKRAN", "Ekran boyutu", v.screen, true),
    s("EKRAN", "Çözünürlük", v.resolution),
    s("EKRAN", "Yenileme hızı", "120 Hz"),
    s("EKRAN", "Panel", "IPS, %100 DCI-P3"),
    s("EKRAN", "Parlaklık", "500 nit"),
    s("BATARYA", "Batarya kapasitesi", v.battery, true),
    s("BATARYA", "Kullanım süresi", "18 saate kadar"),
    s("BATARYA", "Şarj gücü", "70 W USB-C"),
    s("BAĞLANTI", "Portlar", ["2× Thunderbolt 4", "1× USB-A", "HDMI 2.1", "3,5 mm"]),
    s("BAĞLANTI", "Wi-Fi", "Wi-Fi 6E"),
    s("BAĞLANTI", "Bluetooth", "5.3"),
    s("TASARIM", "Ağırlık", v.weight),
    s("TASARIM", "Kalınlık", "15,5 mm"),
    s("TASARIM", "Klavye", "Aydınlatmalı, Türkçe Q"),
    s("TASARIM", "Gövde", "Alüminyum ünibody"),
    s("TEMEL BİLGİLER", "İşletim sistemi", "Windows 11 Home"),
    s("TEMEL BİLGİLER", "Garanti", "24 ay Türkiye garantisi")
  ];
}

function simpleSpecs(rows: [string, string, string | string[]][]): Spec[] {
  return rows.map(([group, label, value], index) =>
    s(group, label, value, index < 3)
  );
}

/* ---------------------------------------------------------------- seeds */

interface Seed {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  gallery: [string, string][];
  base: number;
  listPrice: number | null;
  shops: number;
  popularity: number;
  heat: number;
  listedAt: string;
  /** The year the product reached the market — not the year it was listed. */
  releaseYear: number;
  reviewCount: number;
  description: string;
  specs: Spec[];
  /** A licence or subscription: no shipping, no stock, instant handoff. */
  digital?: boolean;
  /**
   * `ON_REQUEST` where the amount is settled after the Handoff. Optional
   * because `FIXED` is what nineteen of these are, and a required field would
   * make every one of them repeat it.
   */
  pricingKind?: "FIXED" | "ON_REQUEST";
  /**
   * The editorial one-liner. Optional so the ten products written before this
   * increment do not each need one hand-written; a fallback is composed from
   * the name and the category. Where it is supplied it says something the
   * fallback cannot.
   */
  verdict?: string;
  /** How long ago the editorial review was last revised, in days. */
  updatedDaysAgo?: number;
}

const TONES: [string, string][][] = [
  [["#8fa6bd", "#5d7f9e"], ["#7d95ad", "#4f6f8d"], ["#9db2c6", "#6c8ba8"]],
  [["#a9b6a2", "#7d9179"], ["#98a691", "#6d8168"], ["#b6c2af", "#8ba185"]],
  [["#bdaa9a", "#9c8570"], ["#ad9a89", "#8b755f"], ["#cbbaab", "#a99680"]],
  [["#9fa8bd", "#77839e"], ["#8e97ad", "#66738e"], ["#b0b8c9", "#8794ac"]],
  [["#b6a7ae", "#8f7d86"], ["#a5959d", "#7e6c75"], ["#c4b7bd", "#9d8b95"]],
  [["#a2b3b6", "#78959a"], ["#91a3a6", "#67858a"], ["#b3c2c5", "#88a4a9"]]
];

const SEEDS: Seed[] = [
  {
    base: 42990,
    brand: "Nova",
    categoryId: "electronics",
    description:
      "Nova X7 Pro 5G, 6,83 inç AMOLED ekranı ve 8.340 mAh silikon-karbon bataryasıyla uzun kullanım süresi hedefleyen bir üst-orta segment telefon. 67 W hızlı şarj, IP68 su ve toz dayanıklılığı, ekran içi parmak izi okuyucu ve 50 MP optik sabitlemeli ana kamera taşıyor. Snapdragon 6s Gen 4 yonga seti günlük kullanımda ve orta seviye oyunlarda rahat; 120 Hz yenileme hızı arayüzü akıcı tutuyor. Kutudan Android 16 ve HyperOS 3 ile çıkıyor, dört yıl sürüm güncellemesi taahhüdü var.",
    gallery: TONES[0]!,
    heat: 91,
    id: "p1",
    releaseYear: 2026,
    listPrice: 49990,
    listedAt: "2026-08-27",
    name: "Nova X7 Pro 5G 256 GB",
    popularity: 88,
    reviewCount: 88,
    shops: 8,
    slug: "nova-x7-pro-5g-256gb",
    specs: phoneSpecs({
      aperture: "F1.8",
      battery: "8.340 mAh",
      bt: "5.4",
      camera: "50 MP",
      charge: "67 W",
      chipset: "Snapdragon 6s Gen 4",
      colours: ["Siyah", "Mavi", "Mor", "Turuncu"],
      cpu: "4× 2,4 GHz Cortex-A78",
      front: "16 MP",
      ultra: "8 MP ultra geniş açı",
      glass: "Gorilla Glass Victus 2",
      gpu: "Adreno 710",
      height: "163,45 mm",
      ip: "IP68",
      nm: "4 nm",
      os: "Android 16",
      panel: "AMOLED",
      ppi: "447 PPI",
      ram: "12 GB",
      ramType: "LPDDR4X",
      ratio: "19,5:9",
      refresh: "120 Hz",
      resolution: "1280 × 2772 (FHD+)",
      screen: "6,83 inç",
      storage: "256 GB",
      storageType: "UFS 3.1",
      thickness: "8,6 mm",
      ui: "HyperOS 3",
      weight: "223 g",
      wifi: "Wi-Fi 6 (802.11ax)",
      width: "78,27 mm",
      year: "2026"
    })
  },
  {
    base: 39750,
    brand: "Aurora",
    categoryId: "electronics",
    description:
      "Aurora S24 Ultra, 200 MP ana kamerası ve 6,8 inç QHD+ AMOLED ekranıyla fotoğraf odaklı bir amiral gemisi. Titan 8 Gen 4 yonga seti ağır oyunlarda ve video düzenlemede rahat çalışıyor; buhar odalı soğutma uzun oturumlarda hız düşüşünü sınırlıyor. 45 W kablolu, 15 W kablosuz şarj destekliyor. Yedi yıl güncelleme taahhüdü segmentindeki en uzun sürelerden biri.",
    gallery: TONES[1]!,
    heat: 74,
    id: "p2",
    releaseYear: 2025,
    listPrice: 45900,
    listedAt: "2026-08-25",
    name: "Aurora S24 Ultra 256 GB",
    popularity: 94,
    reviewCount: 214,
    shops: 6,
    slug: "aurora-s24-ultra-256gb",
    specs: phoneSpecs({
      aperture: "F1.7",
      battery: "5.000 mAh",
      bt: "5.4",
      camera: "200 MP",
      charge: "45 W",
      chipset: "Titan 8 Gen 4",
      colours: ["Siyah", "Gri", "Yeşil"],
      cpu: "1× 3,4 GHz + 5× 3,1 GHz + 2× 2,2 GHz",
      front: "12 MP",
      ultra: "50 MP ultra geniş açı",
      glass: "Gorilla Armor 2",
      gpu: "Adreno 830",
      height: "162,80 mm",
      ip: "IP68",
      nm: "3 nm",
      os: "Android 16",
      panel: "LTPO AMOLED",
      ppi: "505 PPI",
      ram: "12 GB",
      ramType: "LPDDR5X",
      ratio: "19,5:9",
      refresh: "1–120 Hz",
      resolution: "1440 × 3120 (QHD+)",
      screen: "6,8 inç",
      storage: "256 GB",
      storageType: "UFS 4.0",
      thickness: "8,2 mm",
      ui: "AuroraOS 8",
      weight: "218 g",
      wifi: "Wi-Fi 7 (802.11be)",
      width: "79,00 mm",
      year: "2026"
    })
  },
  {
    base: 27400,
    brand: "Lume",
    categoryId: "electronics",
    description:
      "Lume 12, 5.000 mAh bataryası ve sade arayüzüyle günlük kullanım için tasarlanmış giriş-orta segment bir telefon. 6,4 inç AMOLED ekranı bu fiyat aralığında öne çıkıyor; 48 MP ana kamera gündüz çekimlerinde tatmin edici sonuç veriyor. Oyun performansı sınırlı, ancak sosyal medya, mesajlaşma ve video izleme için yeterli.",
    gallery: TONES[3]!,
    heat: 88,
    id: "p4",
    releaseYear: 2026,
    listPrice: 31900,
    listedAt: "2026-08-28",
    name: "Lume 12 128 GB",
    popularity: 66,
    reviewCount: 41,
    shops: 6,
    slug: "lume-12-128gb",
    specs: phoneSpecs({
      aperture: "F1.8",
      battery: "5.000 mAh",
      bt: "5.3",
      camera: "48 MP",
      charge: "33 W",
      chipset: "Helio G99 Ultra",
      colours: ["Siyah", "Mavi"],
      cpu: "2× 2,2 GHz Cortex-A76",
      front: "8 MP",
      ultra: "2 MP derinlik",
      glass: "Gorilla Glass 5",
      gpu: "Mali-G57 MC2",
      height: "161,10 mm",
      ip: "IP54",
      nm: "6 nm",
      os: "Android 16",
      panel: "AMOLED",
      ppi: "409 PPI",
      ram: "8 GB",
      ramType: "LPDDR4X",
      ratio: "20:9",
      refresh: "90 Hz",
      resolution: "1080 × 2400 (FHD+)",
      screen: "6,4 inç",
      storage: "128 GB",
      storageType: "UFS 2.2",
      thickness: "7,9 mm",
      ui: "LumeUI 6",
      weight: "188 g",
      wifi: "Wi-Fi 5 (802.11ac)",
      width: "74,50 mm",
      year: "2026"
    })
  },
  {
    base: 61900,
    brand: "Aurora",
    categoryId: "electronics",
    description:
      "Aurora Book Air 14, 1,25 kg gövdesi ve sessiz çalışan pasif soğutmasıyla taşınabilirliği önceleyen bir dizüstü. M3 yonga seti ofis işleri, fotoğraf düzenleme ve hafif video kurgusunda rahat; 18 saate kadar batarya ömrü gün boyu prizden bağımsız kullanım sağlıyor. 14,2 inç 120 Hz ekran renk doğruluğu yüksek.",
    gallery: TONES[4]!,
    heat: 55,
    id: "p5",
    releaseYear: 2025,
    listPrice: null,
    listedAt: "2026-08-22",
    name: "Aurora Book Air 14 M3 512 GB",
    popularity: 82,
    reviewCount: 63,
    shops: 5,
    slug: "aurora-book-air-14-m3",
    specs: laptopSpecs({
      battery: "72 Wh",
      cores: "8 çekirdek (4P + 4E)",
      cpu: "Aurora M3",
      gpu: "10 çekirdekli tümleşik GPU",
      ram: "16 GB",
      resolution: "2560 × 1600",
      screen: "14,2 inç",
      storage: "512 GB SSD",
      weight: "1,25 kg"
    })
  },
  {
    base: 58400,
    brand: "Vertex",
    categoryId: "electronics",
    description:
      "Vertex Slim 14, Core Ultra 7 işlemcisi ve 1 TB depolamasıyla iş kullanımına yönelik bir dizüstü. Yapay zekâ hızlandırıcısı yerel model çalıştırmayı destekliyor. Klavyesi tuş yolu bakımından rahat, gövdesi alüminyum. Fan yük altında duyuluyor.",
    gallery: TONES[5]!,
    heat: 79,
    id: "p6",
    releaseYear: 2025,
    listPrice: 64900,
    listedAt: "2026-08-26",
    name: "Vertex Slim 14 Ultra 7 1 TB",
    popularity: 58,
    reviewCount: 29,
    shops: 5,
    slug: "vertex-slim-14-ultra-7",
    specs: laptopSpecs({
      battery: "65 Wh",
      cores: "16 çekirdek (6P + 8E + 2LP)",
      cpu: "Intel Core Ultra 7 155H",
      gpu: "Intel Arc tümleşik",
      ram: "16 GB",
      resolution: "2880 × 1800",
      screen: "14 inç",
      storage: "1 TB SSD",
      weight: "1,45 kg"
    })
  },
  {
    base: 6890,
    brand: "Sonare",
    categoryId: "electronics",
    description:
      "Sonare Air Pro 3, aktif gürültü engelleme ve şeffaflık modu sunan tam kablosuz bir kulaklık. Şarj kutusuyla birlikte 32 saate kadar kullanım veriyor. Çoklu cihaz bağlantısı telefon ile bilgisayar arasında otomatik geçiş yapıyor. Kulak içi tespit sensörü kulaklık çıkarıldığında sesi duraklatıyor.",
    gallery: TONES[0]!,
    heat: 84,
    id: "p7",
    releaseYear: 2023,
    listPrice: 8490,
    listedAt: "2026-08-29",
    name: "Sonare Air Pro 3 kulaklık",
    popularity: 77,
    reviewCount: 156,
    shops: 6,
    slug: "sonare-air-pro-3",
    specs: simpleSpecs([
      ["SES", "Gürültü engelleme", "Aktif (ANC), 45 dB"],
      ["SES", "Sürücü", "11 mm dinamik"],
      ["SES", "Codec desteği", ["SBC", "AAC", "LDAC"]],
      ["SES", "Şeffaflık modu", "Var"],
      ["BATARYA", "Kullanım süresi (ANC açık)", "6,5 saat"],
      ["BATARYA", "Kutuyla toplam", "32 saat"],
      ["BATARYA", "Hızlı şarj", "10 dakikada 2 saat"],
      ["BATARYA", "Kablosuz şarj", "Var (Qi)"],
      ["BAĞLANTI", "Bluetooth", "5.4"],
      ["BAĞLANTI", "Çoklu cihaz", "Var (2 cihaz)"],
      ["BAĞLANTI", "Menzil", "10 m"],
      ["FİZİKSEL", "Suya dayanıklılık", "IPX4"],
      ["FİZİKSEL", "Ağırlık", "5,3 g / kulaklık"],
      ["FİZİKSEL", "Kulak içi tespiti", "Var"],
      ["TEMEL BİLGİLER", "Garanti", "24 ay"],
      ["TEMEL BİLGİLER", "Kutu içeriği", ["Kulaklık", "Şarj kutusu", "3 boy kulak lastiği", "USB-C kablo"]]
    ])
  },
  {
    base: 7450,
    brand: "Klar",
    categoryId: "electronics",
    description:
      "Klar Studio 40, kulak üstü tasarımı ve 40 mm sürücüleriyle uzun dinleme oturumları için üretilmiş bir kulaklık. 45 saatlik batarya ömrü sınıfının üstünde. Kablolu bağlantı seçeneği stüdyo kullanımına imkân veriyor. Kafa bandı baskısı ilk günlerde hissediliyor.",
    gallery: TONES[1]!,
    heat: 47,
    id: "p8",
    releaseYear: 2024,
    listPrice: null,
    listedAt: "2026-08-20",
    name: "Klar Studio 40 kulaklık",
    popularity: 61,
    reviewCount: 74,
    shops: 5,
    slug: "klar-studio-40",
    specs: simpleSpecs([
      ["SES", "Gürültü engelleme", "Aktif (ANC), 40 dB"],
      ["SES", "Sürücü", "40 mm dinamik"],
      ["SES", "Frekans aralığı", "20 Hz – 40 kHz"],
      ["SES", "Codec desteği", ["SBC", "AAC", "aptX HD"]],
      ["BATARYA", "Kullanım süresi (ANC açık)", "45 saat"],
      ["BATARYA", "Hızlı şarj", "5 dakikada 4 saat"],
      ["BAĞLANTI", "Bluetooth", "5.3"],
      ["BAĞLANTI", "Kablolu bağlantı", "3,5 mm jack"],
      ["FİZİKSEL", "Tip", "Kulak üstü (over-ear)"],
      ["FİZİKSEL", "Ağırlık", "254 g"],
      ["FİZİKSEL", "Katlanabilir", "Var"],
      ["TEMEL BİLGİLER", "Garanti", "24 ay"]
    ])
  },
  {
    base: 2190,
    brand: "Dermé",
    categoryId: "beauty",
    description:
      "Dermé C-Serum, %15 saf C vitamini ve hyaluronik asit içeren bir aydınlatıcı serum. Cilt tonu eşitsizliği ve donukluk için sabah kullanımına uygun. Damlalıklı koyu cam şişe içeriği ışıktan koruyor. İlk kullanımda hassasiyet görülebileceği için gün aşırı başlanması öneriliyor.",
    gallery: TONES[2]!,
    heat: 69,
    id: "p9",
    releaseYear: 2023,
    listPrice: 2790,
    listedAt: "2026-08-28",
    name: "Dermé C-Serum 30 ml",
    popularity: 73,
    reviewCount: 312,
    shops: 6,
    slug: "derme-c-serum-30ml",
    specs: simpleSpecs([
      ["İÇERİK", "Etken madde", "%15 L-askorbik asit"],
      ["İÇERİK", "Ek bileşenler", ["Hyaluronik asit", "E vitamini", "Ferulik asit"]],
      ["İÇERİK", "Hacim", "30 ml"],
      ["İÇERİK", "pH değeri", "3,2"],
      ["KULLANIM", "Cilt tipi", ["Normal", "Karma", "Yağlı"]],
      ["KULLANIM", "Zaman", "Sabah"],
      ["KULLANIM", "Sıklık", "Günde 1 kez"],
      ["KULLANIM", "Uyarı", "Güneş koruyucu ile kullanın"],
      ["FİZİKSEL", "Ambalaj", "Damlalıklı koyu cam şişe"],
      ["FİZİKSEL", "Saklama", "Serin ve ışıktan uzak"],
      ["TEMEL BİLGİLER", "Menşei", "Fransa"],
      ["TEMEL BİLGİLER", "Kullanım ömrü", "Açıldıktan sonra 3 ay"]
    ])
  },
  {
    base: 2450,
    brand: "Selene",
    categoryId: "beauty",
    description:
      "Selene Retinol Gece Kremi, %0,5 retinol ve niasinamid içeren bir gece bakım kremi. İnce çizgiler ve gözenek görünümü için geliştirildi. Airless pompa içeriği havayla temastan koruyor. Retinole yeni başlayanlar için haftada iki kullanım öneriliyor.",
    gallery: TONES[3]!,
    heat: 52,
    id: "p10",
    releaseYear: 2024,
    listPrice: null,
    listedAt: "2026-08-23",
    name: "Selene Retinol Gece Kremi 50 ml",
    popularity: 64,
    reviewCount: 98,
    shops: 5,
    slug: "selene-retinol-gece-kremi",
    specs: simpleSpecs([
      ["İÇERİK", "Etken madde", "%0,5 retinol"],
      ["İÇERİK", "Ek bileşenler", ["Niasinamid", "Skualan", "Seramid"]],
      ["İÇERİK", "Hacim", "50 ml"],
      ["KULLANIM", "Cilt tipi", ["Normal", "Kuru"]],
      ["KULLANIM", "Zaman", "Gece"],
      ["KULLANIM", "Sıklık", "Haftada 2–3 kez"],
      ["FİZİKSEL", "Ambalaj", "Airless pompa"],
      ["TEMEL BİLGİLER", "Menşei", "İtalya"],
      ["TEMEL BİLGİLER", "Kullanım ömrü", "Açıldıktan sonra 6 ay"]
    ])
  },
  {
    base: 2000,
    brand: "MaxTool",
    categoryId: "home",
    description:
      "MaxTool MX8008, 20 V çift akü ile çalışan mini dal budama testeresi. 10 cm kılavuz uzunluğu ve 5 m/s zincir hızıyla ince ve orta kalınlıktaki dallar için uygun. Taşıma çantası, iki akü ve şarj cihazı kutudan çıkıyor. Tek elle kullanılabilecek ağırlıkta; kalın gövde kesimi için tasarlanmadı.",
    gallery: TONES[5]!,
    heat: 66,
    id: "p11",
    releaseYear: 2025,
    listPrice: 2839,
    listedAt: "2026-08-24",
    name: "MaxTool MX8008 Akülü Budama Testeresi",
    popularity: 70,
    reviewCount: 47,
    shops: 8,
    slug: "maxtool-mx8008-budama-testeresi",
    specs: simpleSpecs([
      ["MOTOR VE GÜÇ", "Akü voltajı", "20 V"],
      ["MOTOR VE GÜÇ", "Akü kapasitesi", "2,0 Ah"],
      ["MOTOR VE GÜÇ", "Akü sayısı", "2 adet (çift akü)"],
      ["MOTOR VE GÜÇ", "Motor tipi", "Fırçalı"],
      ["KESİM", "Kılavuz uzunluğu", "10 cm"],
      ["KESİM", "Zincir hızı", "5 m/s"],
      ["KESİM", "Azami kesim çapı", "8 cm"],
      ["KESİM", "Zincir yağlama", "Manuel"],
      ["FİZİKSEL", "Ağırlık", "1,3 kg (akü dâhil)"],
      ["FİZİKSEL", "Taşıma çantası", "Var"],
      ["GÜVENLİK", "Çift açma emniyeti", "Var"],
      ["GÜVENLİK", "El siperi", "Var"],
      ["TEMEL BİLGİLER", "Garanti", "24 ay"],
      ["TEMEL BİLGİLER", "Kutu içeriği", ["Testere", "2 akü", "Şarj cihazı", "Yedek zincir", "Çanta"]]
    ]),
    updatedDaysAgo: 2,
    verdict:
      "Hafif, tek elle kullanılabilir ve ince dal için fazlasıyla yeterli; kalın gövde bekleyen yanlış aleti alır."
  },

  /* ------------------------------------------------------------------------
   * Added so the budget control has something to do.
   *
   * The catalogue ran from 2.000 ₺ to 90.000 ₺ and every product was a
   * physical good, so narrowing the budget slider below the cheapest item
   * emptied the page in one step and taught nothing. These nine span **149 ₺
   * to 18.500 ₺** and fill the four categories the analysis adds, where the
   * economics are different: a digital licence has no shipping, no stock and
   * an instant handoff, and its commission is recurring rather than one-off.
   * ---------------------------------------------------------------------- */

  {
    base: 149,
    brand: "KeyVault",
    categoryId: "gaming",
    description:
      "Dijital oyun anahtarı. Satın alma sonrası e-posta ile iletilen kod, ilgili oyun mağazasında kütüphanenize eklenir. Bölge kısıtı bulunmuyor; kod tek kullanımlıktır ve etkinleştirildikten sonra iade edilemez. Anahtarın hangi mağaza için geçerli olduğunu satıcı sayfasında doğrulayın.",
    digital: true,
    gallery: TONES[3]!,
    heat: 96,
    id: "p12",
    releaseYear: 2026,
    listPrice: 249,
    listedAt: "2026-08-30",
    name: "Shadowfall: Requiem — PC Dijital Anahtar",
    popularity: 82,
    reviewCount: 61,
    shops: 8,
    slug: "shadowfall-requiem-pc-anahtar",
    specs: simpleSpecs([
      ["LİSANS", "Platform", "PC"],
      ["LİSANS", "Teslimat", "E-posta ile anında"],
      ["LİSANS", "Bölge kısıtı", "Yok (Global)"],
      ["LİSANS", "Kullanım", "Tek seferlik etkinleştirme"],
      ["OYUN", "Tür", ["Aksiyon", "Rol yapma"]],
      ["OYUN", "Tek oyunculu", "Var"],
      ["OYUN", "Çok oyunculu", "Var (çevrimiçi)"],
      ["OYUN", "Türkçe dil desteği", "Altyazı"],
      ["SİSTEM", "Asgari işlemci", "Intel Core i5-8400"],
      ["SİSTEM", "Asgari ekran kartı", "GTX 1060 6 GB"],
      ["SİSTEM", "Depolama", "85 GB"],
      ["TEMEL BİLGİLER", "İade", "Etkinleştirilmemişse 14 gün"]
    ]),
    updatedDaysAgo: 1,
    verdict:
      "Dijital anahtarda tek soru fiyat: aynı kod sekiz satıcıda iki katına kadar değişiyor."
  },
  {
    base: 289,
    brand: "Hostwell",
    categoryId: "software",
    description:
      "Paylaşımlı web barındırma, yıllık ödemeli başlangıç paketi. Tek alan adı, 50 GB NVMe depolama, ücretsiz SSL sertifikası ve haftalık yedekleme içerir. Küçük kurumsal siteler ve bloglar için tasarlanmış; yüksek trafikli e-ticaret için üst paketlere geçilmesi gerekir. Fiyat ilk yıl içindir, yenileme bedeli farklıdır.",
    digital: true,
    gallery: TONES[0]!,
    heat: 71,
    id: "p13",
    releaseYear: 2024,
    listPrice: 720,
    listedAt: "2026-08-28",
    name: "Hostwell Başlangıç Barındırma — 1 Yıl",
    popularity: 66,
    reviewCount: 38,
    shops: 6,
    slug: "hostwell-baslangic-barindirma-1-yil",
    specs: simpleSpecs([
      ["PAKET", "Alan adı sayısı", "1"],
      ["PAKET", "Depolama", "50 GB NVMe"],
      ["PAKET", "Aylık trafik", "Sınırsız (adil kullanım)"],
      ["PAKET", "SSL sertifikası", "Ücretsiz (Let's Encrypt)"],
      ["PAKET", "E-posta hesabı", "10 adet"],
      ["ALTYAPI", "Sunucu konumu", ["Türkiye", "Almanya"]],
      ["ALTYAPI", "PHP sürümü", "8.1 – 8.4"],
      ["ALTYAPI", "Veritabanı", "MySQL 8"],
      ["ALTYAPI", "Yedekleme", "Haftalık, otomatik"],
      ["DESTEK", "Destek kanalı", ["Canlı sohbet", "E-posta"]],
      ["DESTEK", "Çalışma süresi taahhüdü", "%99,9"],
      ["TEMEL BİLGİLER", "İade süresi", "30 gün koşulsuz"]
    ]),
    updatedDaysAgo: 5,
    verdict:
      "İlk yıl fiyatı cazip, yenilemede iki katına çıkıyor — kararı ikinci yılın bedeliyle verin."
  },
  {
    base: 549,
    brand: "Rankly",
    categoryId: "software",
    description:
      "SEO analiz aracı, aylık abonelik. Anahtar kelime araştırması, rakip analizi, geri bağlantı takibi ve site denetimi modüllerini içerir. Üç proje ve günde 500 sorgu sınırı vardır. Ajanslar için sınırsız proje sunan üst paket ayrıca listelenmektedir. Abonelik aylık yenilenir, istenildiği zaman iptal edilebilir.",
    digital: true,
    gallery: TONES[4]!,
    heat: 58,
    id: "p14",
    releaseYear: 2023,
    listPrice: null,
    listedAt: "2026-08-22",
    name: "Rankly SEO Pro — Aylık Abonelik",
    popularity: 61,
    reviewCount: 24,
    shops: 5,
    slug: "rankly-seo-pro-aylik",
    specs: simpleSpecs([
      ["KAPSAM", "Proje sayısı", "3"],
      ["KAPSAM", "Günlük sorgu", "500"],
      ["KAPSAM", "Takip edilen anahtar kelime", "1.500"],
      ["MODÜLLER", "Anahtar kelime araştırması", "Var"],
      ["MODÜLLER", "Rakip analizi", "Var"],
      ["MODÜLLER", "Geri bağlantı takibi", "Var"],
      ["MODÜLLER", "Site denetimi", "Var"],
      ["MODÜLLER", "API erişimi", "Yok (üst pakette)"],
      ["VERİ", "Veri tabanı kapsamı", ["Türkiye", "Avrupa", "Kuzey Amerika"]],
      ["VERİ", "Güncelleme sıklığı", "Günlük"],
      ["TEMEL BİLGİLER", "Sözleşme", "Aylık, taahhütsüz"],
      ["TEMEL BİLGİLER", "Deneme", "7 gün ücretsiz"]
    ]),
    updatedDaysAgo: 9,
    verdict:
      "Üç projeye kadar en dengeli seçenek; API gerekiyorsa bu paket size göre değil."
  },
  {
    base: 899,
    brand: "Keyra",
    categoryId: "finance",
    description:
      "Donanım kripto cüzdanı. Özel anahtarlar cihazın güvenli yongasında saklanır ve hiçbir koşulda dışarı çıkmaz. Kurtarma ifadesi ilk kurulumda cihaz üzerinde üretilir. Bluetooth ve USB-C ile bağlanır; 1.000'den fazla varlığı destekler. Yatırım tavsiyesi değildir, yalnızca bir saklama cihazıdır.",
    gallery: TONES[2]!,
    heat: 63,
    id: "p15",
    releaseYear: 2025,
    listPrice: 1149,
    listedAt: "2026-08-20",
    name: "Keyra One Donanım Cüzdanı",
    popularity: 57,
    reviewCount: 31,
    shops: 6,
    slug: "keyra-one-donanim-cuzdani",
    specs: simpleSpecs([
      ["GÜVENLİK", "Güvenli yonga", "EAL6+ sertifikalı"],
      ["GÜVENLİK", "Kurtarma ifadesi", "24 kelime, cihazda üretilir"],
      ["GÜVENLİK", "PIN denemesi", "3 hatada sıfırlama"],
      ["BAĞLANTI", "Arayüz", ["USB-C", "Bluetooth 5.2"]],
      ["BAĞLANTI", "Mobil uygulama", ["iOS", "Android"]],
      ["DESTEK", "Desteklenen varlık", "1.000+"],
      ["DESTEK", "Açık kaynak yazılım", "Kısmen"],
      ["FİZİKSEL", "Ekran", "1,4 inç tek renk"],
      ["FİZİKSEL", "Batarya", "120 mAh"],
      ["FİZİKSEL", "Ağırlık", "34 g"],
      ["TEMEL BİLGİLER", "Garanti", "24 ay"],
      ["TEMEL BİLGİLER", "Kutu içeriği", ["Cihaz", "USB-C kablo", "Kurtarma kartı"]]
    ]),
    updatedDaysAgo: 11,
    verdict:
      "Kurtarma ifadesini cihaz üretiyor; bu tek başına ucuz alternatiflerin çoğunu eler."
  },
  {
    base: 1450,
    brand: "Rankly",
    categoryId: "software",
    description:
      "Ajans paketi: sınırsız proje, günde 10.000 sorgu, API erişimi ve beyaz etiketli rapor çıktısı. Beş kullanıcıya kadar ekip hesabı içerir. Aylık faturalandırılır; yıllık ödemede iki ay ücretsizdir. Küçük ekipler için Pro paket çoğu durumda yeterlidir.",
    digital: true,
    gallery: TONES[4]!,
    heat: 44,
    id: "p16",
    releaseYear: 2023,
    listPrice: 1990,
    listedAt: "2026-08-18",
    name: "Rankly SEO Ajans — Aylık Abonelik",
    popularity: 48,
    reviewCount: 17,
    shops: 5,
    slug: "rankly-seo-ajans-aylik",
    specs: simpleSpecs([
      ["KAPSAM", "Proje sayısı", "Sınırsız"],
      ["KAPSAM", "Günlük sorgu", "10.000"],
      ["KAPSAM", "Kullanıcı sayısı", "5"],
      ["MODÜLLER", "API erişimi", "Var"],
      ["MODÜLLER", "Beyaz etiketli rapor", "Var"],
      ["MODÜLLER", "Zamanlanmış rapor", "Var"],
      ["MODÜLLER", "Site denetimi", "Var"],
      ["VERİ", "Veri tabanı kapsamı", ["Türkiye", "Avrupa", "Kuzey Amerika", "Asya"]],
      ["VERİ", "Geçmiş veri", "36 ay"],
      ["TEMEL BİLGİLER", "Sözleşme", "Aylık veya yıllık"],
      ["TEMEL BİLGİLER", "Yıllık indirim", "2 ay ücretsiz"],
      ["TEMEL BİLGİLER", "Deneme", "7 gün ücretsiz"]
    ]),
    updatedDaysAgo: 14
  },
  {
    base: 2450,
    brand: "Dermé",
    categoryId: "beauty",
    description:
      "Günlük kullanım için tasarlanmış nemlendirici set: temizleme jeli, tonik ve nemlendirici krem. Kokusuz, dermatolojik test edilmiş formül; hassas ciltte de kullanılabilir. Set hâlinde alındığında tek tek alımdan daha uygun; ürünler ayrı ayrı da listelenmektedir.",
    gallery: TONES[4]!,
    heat: 52,
    id: "p17",
    releaseYear: 2026,
    listPrice: 3200,
    listedAt: "2026-08-19",
    name: "Dermé Günlük Bakım Seti (3 ürün)",
    popularity: 59,
    reviewCount: 43,
    shops: 6,
    slug: "derme-gunluk-bakim-seti",
    specs: simpleSpecs([
      ["İÇERİK", "Ürün sayısı", "3"],
      ["İÇERİK", "Temizleme jeli", "200 ml"],
      ["İÇERİK", "Tonik", "150 ml"],
      ["İÇERİK", "Nemlendirici krem", "50 ml"],
      ["FORMÜL", "Koku", "Yok"],
      ["FORMÜL", "Alkol", "Yok"],
      ["FORMÜL", "Cilt tipi", ["Normal", "Kuru", "Hassas"]],
      ["FORMÜL", "Dermatolojik test", "Yapıldı"],
      ["KULLANIM", "Sıklık", "Günde 2 kez"],
      ["TEMEL BİLGİLER", "Menşei", "Fransa"],
      ["TEMEL BİLGİLER", "Raf ömrü", "24 ay"],
      ["TEMEL BİLGİLER", "Açıldıktan sonra", "6 ay"]
    ]),
    updatedDaysAgo: 7
  },
  {
    base: 4900,
    brand: "MaxTool",
    categoryId: "home",
    description:
      "20 V akülü darbeli matkap ve vidalama seti. 60 Nm tork, iki hızlı şanzıman ve 21 kademeli tork ayarı sunar. İki adet 4,0 Ah akü, hızlı şarj cihazı ve 42 parça uç seti kutudan çıkar. Ev tadilatı ve orta seviye ahşap-metal işleri için tasarlandı; beton delme performansı sınırlıdır.",
    gallery: TONES[5]!,
    heat: 68,
    id: "p18",
    releaseYear: 2024,
    listPrice: 6250,
    listedAt: "2026-08-21",
    name: "MaxTool MX4200 Akülü Darbeli Matkap Seti",
    popularity: 72,
    reviewCount: 55,
    shops: 8,
    slug: "maxtool-mx4200-akulu-matkap-seti",
    specs: simpleSpecs([
      ["MOTOR VE GÜÇ", "Akü voltajı", "20 V"],
      ["MOTOR VE GÜÇ", "Akü kapasitesi", "4,0 Ah"],
      ["MOTOR VE GÜÇ", "Azami tork", "60 Nm"],
      ["MOTOR VE GÜÇ", "Motor tipi", "Fırçasız"],
      ["PERFORMANS", "Devir (1. vites)", "0 – 550 dev/dk"],
      ["PERFORMANS", "Devir (2. vites)", "0 – 2.000 dev/dk"],
      ["PERFORMANS", "Darbe sayısı", "28.000 vuruş/dk"],
      ["PERFORMANS", "Tork kademesi", "21 + delme"],
      ["PERFORMANS", "Mandren", "13 mm anahtarsız"],
      ["FİZİKSEL", "Ağırlık", "1,6 kg (akü dâhil)"],
      ["FİZİKSEL", "LED aydınlatma", "Var"],
      ["TEMEL BİLGİLER", "Garanti", "36 ay"],
      ["TEMEL BİLGİLER", "Kutu içeriği", ["Matkap", "2 akü", "Hızlı şarj", "42 parça uç", "Çanta"]]
    ]),
    updatedDaysAgo: 4
  },
  {
    base: 8900,
    brand: "Sonare",
    categoryId: "electronics",
    description:
      "Aktif gürültü engelleme özellikli kulak üstü kablosuz kulaklık. 40 mm sürücü, 55 saate kadar pil ömrü ve çok noktalı bağlantı sunar. Katlanabilir gövde ve taşıma çantası ile geliyor. Uçuş ve ofis kullanımı için tasarlandı; stüdyo referans kulaklığı değildir.",
    gallery: TONES[0]!,
    heat: 77,
    id: "p19",
    releaseYear: 2026,
    listPrice: 11250,
    listedAt: "2026-08-26",
    name: "Sonare Vast 900 ANC Kulaklık",
    popularity: 79,
    reviewCount: 92,
    shops: 8,
    slug: "sonare-vast-900-anc",
    specs: simpleSpecs([
      ["SES", "Sürücü çapı", "40 mm"],
      ["SES", "Frekans aralığı", "20 Hz – 40 kHz"],
      ["SES", "Kodek desteği", ["SBC", "AAC", "LDAC"]],
      ["GÜRÜLTÜ ENGELLEME", "ANC", "Uyarlanabilir"],
      ["GÜRÜLTÜ ENGELLEME", "Şeffaflık modu", "Var"],
      ["GÜRÜLTÜ ENGELLEME", "Mikrofon sayısı", "8"],
      ["BATARYA", "ANC açık", "40 saat"],
      ["BATARYA", "ANC kapalı", "55 saat"],
      ["BATARYA", "Hızlı şarj", "10 dk = 6 saat"],
      ["BAĞLANTI", "Bluetooth", "5.4"],
      ["BAĞLANTI", "Çok noktalı", "Var (2 cihaz)"],
      ["BAĞLANTI", "Kablolu giriş", "3,5 mm"],
      ["FİZİKSEL", "Ağırlık", "268 g"],
      ["FİZİKSEL", "Katlanabilir", "Var"],
      ["TEMEL BİLGİLER", "Garanti", "24 ay"]
    ]),
    updatedDaysAgo: 3
  },
  {
    base: 18500,
    brand: "Vertex",
    categoryId: "electronics",
    description:
      "27 inç 4K IPS monitör; %98 DCI-P3 renk kapsama, 144 Hz yenileme hızı ve 90 W güç aktarımlı USB-C girişi. Yükseklik, eğim ve pivot ayarlı stand ile geliyor. Görsel işler ve oyun arasında bölünen kullanım için tasarlandı; HDR performansı sertifikasının sınırları içinde kalıyor.",
    gallery: TONES[3]!,
    heat: 69,
    id: "p20",
    releaseYear: 2025,
    listPrice: 22900,
    listedAt: "2026-08-23",
    name: "Vertex View 27 4K 144 Hz Monitör",
    popularity: 75,
    reviewCount: 66,
    shops: 7,
    slug: "vertex-view-27-4k-144hz",
    specs: simpleSpecs([
      ["EKRAN", "Ekran boyutu", "27 inç"],
      ["EKRAN", "Çözünürlük", "3840 × 2160 (4K)"],
      ["EKRAN", "Panel", "IPS"],
      ["EKRAN", "Yenileme hızı", "144 Hz"],
      ["EKRAN", "Tepki süresi", "1 ms (GtG)"],
      ["RENK", "Renk kapsama", ["%98 DCI-P3", "%99 sRGB"]],
      ["RENK", "Renk derinliği", "10 bit (8 bit + FRC)"],
      ["RENK", "HDR", "DisplayHDR 400"],
      ["BAĞLANTI", "HDMI", "2 × HDMI 2.1"],
      ["BAĞLANTI", "DisplayPort", "1 × DP 1.4"],
      ["BAĞLANTI", "USB-C", "90 W güç aktarımlı"],
      ["BAĞLANTI", "USB hub", "3 × USB-A 3.2"],
      ["STAND", "Yükseklik ayarı", "130 mm"],
      ["STAND", "Pivot", "Var"],
      ["STAND", "VESA", "100 × 100 mm"],
      ["TEMEL BİLGİLER", "Garanti", "36 ay"]
    ]),
    updatedDaysAgo: 6
  }
  ,

  /* ------------------------------------------------------------------------
   * The five categories the Owner added on 2026-08-31 that had nothing in
   * them: insurance, property, education, motoring and travel.
   *
   * **Two of these have no price, and that is the point.** A commercial
   * insurance policy is quoted after the risk is described, and a commercial
   * property's asking price is often "görüşmeye açık" — PRD-0001 v4.0 §5.10.1
   * calls both *On Request*, which is a real answer rather than a gap. They
   * are here so the model the Owner approved can be seen working rather than
   * only read about.
   * ---------------------------------------------------------------------- */

  {
    base: 8900,
    brand: "Anadolu Sigorta Aracılık",
    categoryId: "insurance",
    description:
      "Yıllık kasko poliçesi. Çarpma, çarpışma, devrilme, yanma, çalınma ve doğal afet teminatlarını içerir; cam kırılması ve yol yardımı standart olarak eklidir. Prim aracın marka, model, yaş ve kullanım şekline göre değişir — buradaki tutar, 2020 model orta segment bir binek araç için örnek primdir. Kesin teklif, poliçe öncesi araç bilgileriyle hesaplanır.",
    gallery: TONES[3]!,
    heat: 61,
    id: "p21",
    releaseYear: 2026,
    listPrice: 11400,
    listedAt: "2026-08-29",
    name: "Tam Kasko Poliçesi — Binek Araç (Yıllık)",
    popularity: 68,
    reviewCount: 52,
    shops: 6,
    slug: "tam-kasko-policesi-binek-yillik",
    specs: simpleSpecs([
      ["TEMİNAT", "Çarpma ve çarpışma", "Var"],
      ["TEMİNAT", "Çalınma", "Var"],
      ["TEMİNAT", "Doğal afet", "Var"],
      ["TEMİNAT", "Cam kırılması", "Muafiyetsiz"],
      ["TEMİNAT", "Yol yardımı", "Var (7/24)"],
      ["TEMİNAT", "İkame araç", "10 gün"],
      ["TEMİNAT", "Mini onarım", "Yılda 2 kez"],
      ["KOŞULLAR", "Muafiyet", "Yok"],
      ["KOŞULLAR", "Hasarsızlık indirimi", "Devreder"],
      ["KOŞULLAR", "Anlaşmalı servis", "Var"],
      ["KOŞULLAR", "Ödeme", "Peşin veya 12 taksit"],
      ["TEMEL BİLGİLER", "Poliçe süresi", "1 yıl"],
      ["TEMEL BİLGİLER", "Cayma hakkı", "İlk 14 gün"]
    ]),
    updatedDaysAgo: 2,
    verdict:
      "Teminat listesi geniş; asıl fark anlaşmalı servis ağında ve muafiyet koşullarında ortaya çıkıyor."
  },
  {
    base: 0,
    brand: "Marmara Sigorta Aracılık",
    categoryId: "insurance",
    description:
      "İşyeri paket sigortası. Yangın, hırsızlık, su baskını, cam kırılması, iş durması ve üçüncü şahıs mali mesuliyet teminatlarını tek poliçede toplar. **Bu poliçenin sabit bir fiyatı yoktur:** prim, işyerinin faaliyet konusu, metrekaresi, konumu, demirbaş değeri ve talep edilen teminat limitlerine göre hesaplanır. Talebinizi ilettiğinizde aracı kurum tarafından teklif hazırlanır.",
    gallery: TONES[1]!,
    heat: 44,
    id: "p22",
    releaseYear: 2026,
    listPrice: null,
    listedAt: "2026-08-27",
    name: "İşyeri Paket Sigortası — Kurumsal",
    popularity: 51,
    pricingKind: "ON_REQUEST",
    reviewCount: 19,
    shops: 0,
    slug: "isyeri-paket-sigortasi-kurumsal",
    specs: simpleSpecs([
      ["TEMİNAT", "Yangın ve infilak", "Var"],
      ["TEMİNAT", "Hırsızlık", "Var"],
      ["TEMİNAT", "Su baskını", "Var"],
      ["TEMİNAT", "İş durması", "Opsiyonel"],
      ["TEMİNAT", "Mali mesuliyet", "Limitli"],
      ["TEMİNAT", "Elektronik cihaz", "Opsiyonel"],
      ["KOŞULLAR", "Teklif süresi", "1 – 3 iş günü"],
      ["KOŞULLAR", "Eksper incelemesi", "Değere göre gerekebilir"],
      ["KOŞULLAR", "Ödeme", "Peşin veya taksitli"],
      ["TEMEL BİLGİLER", "Poliçe süresi", "1 yıl"],
      ["TEMEL BİLGİLER", "Kapsam", ["İmalathane", "Ofis", "Perakende", "Depo"]]
    ]),
    updatedDaysAgo: 4,
    verdict:
      "Fiyat sorulduğunda belirlenir; karşılaştırma teminat limitleri ve muafiyetler üzerinden yapılmalı."
  },
  {
    base: 4850000,
    brand: "Kıyı Emlak",
    categoryId: "realestate",
    description:
      "Deniz manzaralı, 3+1, 145 m² brüt daire. Ara kat, güneydoğu cephe, ebeveyn banyolu. Site içinde otopark, güvenlik ve yeşil alan bulunuyor. Bina 2021 yapımı, aidat aylık 2.400 TL. Krediye uygun, tapu hazır. Görüntülü gezinti randevusu talep edilebilir.",
    gallery: TONES[2]!,
    heat: 58,
    id: "p23",
    releaseYear: 2024,
    listPrice: 5200000,
    listedAt: "2026-08-26",
    name: "Deniz Manzaralı 3+1 Daire — 145 m²",
    popularity: 63,
    reviewCount: 27,
    shops: 4,
    slug: "deniz-manzarali-3-1-daire-145m2",
    specs: simpleSpecs([
      ["TAŞINMAZ", "Oda sayısı", "3+1"],
      ["TAŞINMAZ", "Brüt alan", "145 m²"],
      ["TAŞINMAZ", "Net alan", "128 m²"],
      ["TAŞINMAZ", "Bulunduğu kat", "4 / 8"],
      ["TAŞINMAZ", "Cephe", "Güneydoğu"],
      ["TAŞINMAZ", "Bina yaşı", "5"],
      ["TAŞINMAZ", "Isıtma", "Doğalgaz kombi"],
      ["SİTE", "Otopark", "Kapalı, tahsisli"],
      ["SİTE", "Güvenlik", "7/24"],
      ["SİTE", "Aidat", "2.400 TL / ay"],
      ["HUKUKİ", "Tapu durumu", "Kat mülkiyeti"],
      ["HUKUKİ", "Krediye uygunluk", "Uygun"],
      ["HUKUKİ", "İskan", "Var"]
    ]),
    updatedDaysAgo: 3
  },
  {
    base: 0,
    brand: "Liman Gayrimenkul",
    categoryId: "realestate",
    description:
      "Ana cadde üzerinde, 320 m² kullanım alanlı ticari mülk. Zemin kat, çift cepheli, yüksek tavanlı; perakende, showroom veya şube kullanımına uygun. **Satış fiyatı görüşmeye açıktır** — mülk sahibi, kullanım amacına ve ödeme planına göre değerlendirme yapmaktadır. Kiralama seçeneği de değerlendirilebilir.",
    gallery: TONES[5]!,
    heat: 39,
    id: "p24",
    releaseYear: 2023,
    listPrice: null,
    listedAt: "2026-08-24",
    name: "Cadde Üzeri Ticari Mülk — 320 m²",
    popularity: 42,
    pricingKind: "ON_REQUEST",
    reviewCount: 13,
    shops: 0,
    slug: "cadde-uzeri-ticari-mulk-320m2",
    specs: simpleSpecs([
      ["TAŞINMAZ", "Kullanım alanı", "320 m²"],
      ["TAŞINMAZ", "Kat", "Zemin"],
      ["TAŞINMAZ", "Cephe", "Çift cepheli"],
      ["TAŞINMAZ", "Tavan yüksekliği", "4,2 m"],
      ["TAŞINMAZ", "Vitrin genişliği", "12 m"],
      ["KONUM", "Yol", "Ana cadde"],
      ["KONUM", "Toplu taşıma", "150 m"],
      ["KULLANIM", "Uygun kullanım", ["Perakende", "Showroom", "Banka şubesi", "Ofis"]],
      ["HUKUKİ", "Tapu durumu", "Kat mülkiyeti"],
      ["HUKUKİ", "İmar durumu", "Ticari"],
      ["TEMEL BİLGİLER", "Devir", "Boş teslim"]
    ]),
    updatedDaysAgo: 6,
    verdict:
      "Fiyat görüşmeye açık; kıyaslama metrekare birim fiyatı ve cadde konumu üzerinden yapılmalı."
  },
  {
    base: 1290,
    brand: "Kodlab",
    categoryId: "education",
    description:
      "Sıfırdan ileri seviyeye web geliştirme kursu. 68 saat video, 240 alıştırma ve 6 bitirme projesi içerir. HTML, CSS, JavaScript, React ve temel arka uç konularını kapsar. Ömür boyu erişim, mobil uygulama üzerinden çevrimdışı izleme ve tamamlama sertifikası verilir. İlk 30 gün içinde koşulsuz iade.",
    digital: true,
    gallery: TONES[0]!,
    heat: 73,
    id: "p25",
    releaseYear: 2026,
    listPrice: 2490,
    listedAt: "2026-08-30",
    name: "Web Geliştirme Kampı — 68 Saat",
    popularity: 77,
    reviewCount: 84,
    shops: 5,
    slug: "web-gelistirme-kampi-68-saat",
    specs: simpleSpecs([
      ["İÇERİK", "Video süresi", "68 saat"],
      ["İÇERİK", "Alıştırma", "240"],
      ["İÇERİK", "Bitirme projesi", "6"],
      ["İÇERİK", "Kapsam", ["HTML", "CSS", "JavaScript", "React", "Node.js"]],
      ["ERİŞİM", "Süre", "Ömür boyu"],
      ["ERİŞİM", "Çevrimdışı izleme", "Var"],
      ["ERİŞİM", "Mobil uygulama", "Var"],
      ["DESTEK", "Soru-cevap forumu", "Var"],
      ["DESTEK", "Canlı ders", "Ayda 2"],
      ["BELGE", "Tamamlama sertifikası", "Var"],
      ["TEMEL BİLGİLER", "Dil", "Türkçe"],
      ["TEMEL BİLGİLER", "İade", "30 gün koşulsuz"]
    ]),
    updatedDaysAgo: 1
  },
  {
    base: 349,
    brand: "Lingua",
    categoryId: "education",
    description:
      "İngilizce konuşma pratiği aboneliği, aylık. Haftada iki, 25 dakikalık birebir çevrimiçi ders içerir; seviye tespiti ilk derste yapılır. Ders kaydı ve eğitmen notları hesabınıza işlenir. Taahhüt yoktur, istenildiği zaman iptal edilebilir; kullanılmayan dersler bir sonraki aya devretmez.",
    digital: true,
    gallery: TONES[4]!,
    heat: 55,
    id: "p26",
    releaseYear: 2025,
    listPrice: null,
    listedAt: "2026-08-25",
    name: "Birebir İngilizce Konuşma — Aylık Abonelik",
    popularity: 60,
    reviewCount: 46,
    shops: 4,
    slug: "birebir-ingilizce-konusma-aylik",
    specs: simpleSpecs([
      ["DERS", "Haftalık ders", "2"],
      ["DERS", "Ders süresi", "25 dakika"],
      ["DERS", "Ders tipi", "Birebir"],
      ["DERS", "Seviye tespiti", "İlk derste"],
      ["EĞİTMEN", "Anadili İngilizce", "Seçilebilir"],
      ["EĞİTMEN", "Eğitmen değiştirme", "Serbest"],
      ["KAYIT", "Ders kaydı", "Var"],
      ["KAYIT", "Eğitmen notu", "Var"],
      ["TEMEL BİLGİLER", "Taahhüt", "Yok"],
      ["TEMEL BİLGİLER", "Devir", "Kullanılmayan ders devretmez"],
      ["TEMEL BİLGİLER", "İptal", "İstenildiği zaman"]
    ]),
    updatedDaysAgo: 8
  },
  {
    base: 2450,
    brand: "Ege Rent",
    categoryId: "automotive",
    description:
      "Haftalık araç kiralama — B segment, otomatik vites, dizel. Kilometre sınırı haftalık 1.400 km, aşım kilometre başına ücretlendirilir. Tam kasko ve trafik sigortası fiyata dâhildir; ek sürücü ve bebek koltuğu ücretlidir. Teslim ve iade havalimanı ofisinden yapılır, depozito kredi kartından bloke edilir.",
    gallery: TONES[1]!,
    heat: 67,
    id: "p27",
    releaseYear: 2025,
    listPrice: 3100,
    listedAt: "2026-08-28",
    name: "Haftalık Araç Kiralama — B Segment Otomatik",
    popularity: 71,
    reviewCount: 58,
    shops: 7,
    slug: "haftalik-arac-kiralama-b-segment",
    specs: simpleSpecs([
      ["ARAÇ", "Segment", "B"],
      ["ARAÇ", "Vites", "Otomatik"],
      ["ARAÇ", "Yakıt", "Dizel"],
      ["ARAÇ", "Koltuk", "5"],
      ["ARAÇ", "Bagaj", "2 valiz"],
      ["KOŞULLAR", "Kilometre sınırı", "1.400 km / hafta"],
      ["KOŞULLAR", "Asgari yaş", "23"],
      ["KOŞULLAR", "Ehliyet yaşı", "En az 3 yıl"],
      ["KOŞULLAR", "Depozito", "Kredi kartı blokesi"],
      ["SİGORTA", "Tam kasko", "Dâhil"],
      ["SİGORTA", "Trafik sigortası", "Dâhil"],
      ["SİGORTA", "Lastik-cam-far", "Opsiyonel"],
      ["TESLİM", "Alım noktası", ["Havalimanı", "Şehir merkezi"]],
      ["TESLİM", "Farklı noktaya iade", "Ücretli"]
    ]),
    updatedDaysAgo: 2
  },
  {
    base: 1180,
    brand: "OtoBakım",
    categoryId: "automotive",
    description:
      "Periyodik bakım paketi — motor yağı, yağ filtresi, hava filtresi, polen filtresi değişimi ve 25 nokta kontrolü. Benzinli ve dizel binek araçlar için geçerlidir; 2,0 litre üzeri motorlarda yağ farkı eklenir. Randevu ile aynı gün teslim. Kullanılan parçalar orijinal muadili, 12 ay garantilidir.",
    gallery: TONES[5]!,
    heat: 49,
    id: "p28",
    releaseYear: 2026,
    listPrice: null,
    listedAt: "2026-08-23",
    name: "Periyodik Bakım Paketi — Binek Araç",
    popularity: 54,
    reviewCount: 37,
    shops: 6,
    slug: "periyodik-bakim-paketi-binek",
    specs: simpleSpecs([
      ["KAPSAM", "Motor yağı", "Tam sentetik 5W-30"],
      ["KAPSAM", "Yağ filtresi", "Değişim"],
      ["KAPSAM", "Hava filtresi", "Değişim"],
      ["KAPSAM", "Polen filtresi", "Değişim"],
      ["KAPSAM", "Kontrol noktası", "25"],
      ["KOŞULLAR", "Motor hacmi", "2,0 litreye kadar"],
      ["KOŞULLAR", "Yakıt tipi", ["Benzinli", "Dizel"]],
      ["KOŞULLAR", "Teslim", "Randevu ile aynı gün"],
      ["GARANTİ", "Parça garantisi", "12 ay"],
      ["GARANTİ", "İşçilik garantisi", "6 ay"],
      ["TEMEL BİLGİLER", "Parça tipi", "Orijinal muadili"]
    ]),
    updatedDaysAgo: 5
  },
  {
    base: 18900,
    brand: "Meridyen Tur",
    categoryId: "travel",
    description:
      "5 gece 6 gün, her şey dâhil tatil paketi. Gidiş-dönüş uçak bileti, havalimanı transferi ve beş yıldızlı otelde çift kişilik oda konaklaması içerir. Fiyat kişi başıdır ve iki kişilik rezervasyon esas alınmıştır. Tek kişilik konaklamada fark ücreti uygulanır; yüksek sezon tarihlerinde fiyat değişir.",
    gallery: TONES[3]!,
    heat: 84,
    id: "p29",
    releaseYear: 2026,
    listPrice: 23500,
    listedAt: "2026-08-31",
    name: "5 Gece Her Şey Dâhil Tatil Paketi",
    popularity: 86,
    reviewCount: 112,
    shops: 8,
    slug: "5-gece-her-sey-dahil-tatil-paketi",
    specs: simpleSpecs([
      ["PAKET", "Süre", "5 gece 6 gün"],
      ["PAKET", "Konsept", "Her şey dâhil"],
      ["PAKET", "Otel sınıfı", "5 yıldız"],
      ["PAKET", "Oda tipi", "Standart, çift kişilik"],
      ["ULAŞIM", "Uçak bileti", "Gidiş-dönüş dâhil"],
      ["ULAŞIM", "Bagaj hakkı", "20 kg"],
      ["ULAŞIM", "Havalimanı transferi", "Dâhil"],
      ["KOŞULLAR", "Fiyat esası", "Kişi başı, 2 kişilik odada"],
      ["KOŞULLAR", "Tek kişi farkı", "Uygulanır"],
      ["KOŞULLAR", "İptal", "15 gün öncesine kadar cezasız"],
      ["KOŞULLAR", "Seyahat sigortası", "Opsiyonel"],
      ["TEMEL BİLGİLER", "Çocuk indirimi", "0–6 yaş ücretsiz"]
    ]),
    updatedDaysAgo: 1,
    verdict:
      "Sezon dışında güçlü bir fiyat; asıl fark otelin konumunda ve iptal koşullarında."
  },
  {
    base: 3450,
    brand: "Meridyen Tur",
    categoryId: "travel",
    description:
      "Kapadokya'da 2 gece 3 gün butik otel konaklaması, kahvaltı dâhil. Balon turu, vadi yürüyüşü ve yeraltı şehri gezisi opsiyonel olarak eklenebilir. Ulaşım pakete dâhil değildir. Hafta içi tarihlerde fiyat daha uygundur; balon turu hava koşullarına bağlıdır ve iptalinde ücret iade edilir.",
    gallery: TONES[2]!,
    heat: 62,
    id: "p30",
    releaseYear: 2025,
    listPrice: 4200,
    listedAt: "2026-08-22",
    name: "Kapadokya 2 Gece Butik Otel — Kahvaltı Dâhil",
    popularity: 65,
    reviewCount: 41,
    shops: 6,
    slug: "kapadokya-2-gece-butik-otel",
    specs: simpleSpecs([
      ["PAKET", "Süre", "2 gece 3 gün"],
      ["PAKET", "Konsept", "Oda + kahvaltı"],
      ["PAKET", "Otel tipi", "Butik / mağara oda"],
      ["PAKET", "Oda tipi", "Çift kişilik"],
      ["EKLENEBİLİR", "Balon turu", "Opsiyonel"],
      ["EKLENEBİLİR", "Vadi yürüyüşü", "Opsiyonel"],
      ["EKLENEBİLİR", "Yeraltı şehri", "Opsiyonel"],
      ["ULAŞIM", "Uçak bileti", "Dâhil değil"],
      ["ULAŞIM", "Otel transferi", "Ücretli"],
      ["KOŞULLAR", "İptal", "7 gün öncesine kadar cezasız"],
      ["KOŞULLAR", "Balon iptali", "Ücret iadesi yapılır"],
      ["TEMEL BİLGİLER", "Fiyat esası", "Kişi başı, 2 kişilik odada"]
    ]),
    updatedDaysAgo: 9
  }
];

export const PRODUCTS: Product[] = SEEDS.map((seed, index) => {
  /*
   * An Offering priced On Request has no seller rows at all — not rows with a
   * blank price. A row with an empty amount reads as a price the site failed
   * to fetch, which is the exact confusion PRD-0001 v4.0 §5.10.1 exists to
   * prevent. What it has instead is a way to ask, and the page says so.
   */
  const onRequest = seed.pricingKind === "ON_REQUEST";
  const offers = onRequest
    ? []
    : offersAround(
        seed.base,
        seed.shops,
        index,
        seed.name,
        seed.digital ?? false
      );
  const reviews = reviewsFor(seed);
  return {
    brand: seed.brand,
    categoryId: seed.categoryId,
    description: seed.description,
    editorial: editorialFor(seed),
    gallery: seed.gallery,
    heat: seed.heat,
    id: seed.id,
    listPrice: seed.listPrice,
    listedAt: seed.listedAt,
    lowestPrice: onRequest ? 0 : Math.min(...offers.map((offer) => offer.price)),
    name: seed.name,
    offerCount: offers.length,
    offers,
    popularity: seed.popularity,
    pricingKind: onRequest ? "ON_REQUEST" : "FIXED",
    releaseYear: seed.releaseYear,
    /*
     * The crowd's average is computed from the reviews on the page, never
     * stored beside them. A stored average is a second copy of a fact that can
     * disagree with the rows it came from — the same reason PRD-0001 §5.10.4
     * refuses to store a discount percentage.
     */
    rating:
      Math.round(
        (reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length) *
          10
      ) / 10,
    reviewCount: seed.reviewCount,
    reviews,
    slug: seed.slug,
    /*
     * Every product states its release year in the table, not only in the
     * filter. A control that narrows on a value the page never shows leaves a
     * person unable to check the answer they were given.
     */
    specs: seed.specs.some((spec) => spec.label === "Çıkış yılı")
      ? seed.specs
      : [
          ...seed.specs,
          {
            chips: [String(seed.releaseYear)],
            group: "TEMEL BİLGİLER",
            key: false,
            label: "Çıkış yılı"
          }
        ]
  };
});

/** Products in the same category, excluding the one being looked at. */
export const sameCategory = (product: Product): Product[] =>
  PRODUCTS.filter(
    (other) =>
      other.categoryId === product.categoryId && other.id !== product.id
  );

export const categoryById = (id: string): Category | undefined =>
  CATEGORIES.find((category) => category.id === id);

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug);

/** The widest price in the catalogue, so the budget ceiling is a real one. */
/*
 * The range covers priced Offerings only. Including the unpriced ones would
 * drag the floor to zero and make the budget control's left half do nothing.
 */
const PRICED = PRODUCTS.filter((p) => p.pricingKind === "FIXED");

export const MAX_PRICE = Math.max(...PRICED.map((p) => p.lowestPrice));

/** The cheapest listing, so a budget control can be built to reach it. */
export const MIN_PRICE = Math.min(...PRICED.map((p) => p.lowestPrice));

/** The release-year range in the catalogue, so the year control fits it. */
export const MIN_YEAR = Math.min(...PRODUCTS.map((p) => p.releaseYear));
export const MAX_YEAR = Math.max(...PRODUCTS.map((p) => p.releaseYear));
