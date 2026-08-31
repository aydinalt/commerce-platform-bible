import type { Category, Merchant, PriceOffer, Product, Spec } from "./types";

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

export const CATEGORIES: Category[] = [
  { id: "all", name: "Tüm kategoriler" },
  { id: "phone", name: "Akıllı telefon" },
  { id: "laptop", name: "Dizüstü bilgisayar" },
  { id: "audio", name: "Kulaklık ve ses" },
  { id: "beauty", name: "Sağlık ve kozmetik" },
  { id: "garden", name: "Bahçe ve yapı market" }
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
  title: string
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
    const outOfStock = (index + seed) % 5 === 4;
    return {
      dispatch: DISPATCH[(index + seed) % DISPATCH.length] ?? "Yarın kargoda",
      listingTitle: variants[index] ?? title,
      merchant,
      price: Math.round((base * (1 + (spread[index] ?? 0.42))) / 10) * 10,
      promotion: PROMOTIONS[(index + seed) % PROMOTIONS.length] ?? null,
      seenAt: `2026-08-${String(26 + ((index + seed) % 5)).padStart(2, "0")}T${String(9 + ((index * 3 + seed) % 12)).padStart(2, "0")}:${String((index * 17 + seed * 7) % 60).padStart(2, "0")}:00`,
      shipping: index % 3 === 0 ? 0 : 149,
      stock: outOfStock ? null : [25, 3, 10, 7, 12, 2, 40, 5][index] ?? 5
    };
  });
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
  reviewCount: number;
  description: string;
  specs: Spec[];
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
    categoryId: "phone",
    description:
      "Nova X7 Pro 5G, 6,83 inç AMOLED ekranı ve 8.340 mAh silikon-karbon bataryasıyla uzun kullanım süresi hedefleyen bir üst-orta segment telefon. 67 W hızlı şarj, IP68 su ve toz dayanıklılığı, ekran içi parmak izi okuyucu ve 50 MP optik sabitlemeli ana kamera taşıyor. Snapdragon 6s Gen 4 yonga seti günlük kullanımda ve orta seviye oyunlarda rahat; 120 Hz yenileme hızı arayüzü akıcı tutuyor. Kutudan Android 16 ve HyperOS 3 ile çıkıyor, dört yıl sürüm güncellemesi taahhüdü var.",
    gallery: TONES[0]!,
    heat: 91,
    id: "p1",
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
    categoryId: "phone",
    description:
      "Aurora S24 Ultra, 200 MP ana kamerası ve 6,8 inç QHD+ AMOLED ekranıyla fotoğraf odaklı bir amiral gemisi. Titan 8 Gen 4 yonga seti ağır oyunlarda ve video düzenlemede rahat çalışıyor; buhar odalı soğutma uzun oturumlarda hız düşüşünü sınırlıyor. 45 W kablolu, 15 W kablosuz şarj destekliyor. Yedi yıl güncelleme taahhüdü segmentindeki en uzun sürelerden biri.",
    gallery: TONES[1]!,
    heat: 74,
    id: "p2",
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
    categoryId: "phone",
    description:
      "Lume 12, 5.000 mAh bataryası ve sade arayüzüyle günlük kullanım için tasarlanmış giriş-orta segment bir telefon. 6,4 inç AMOLED ekranı bu fiyat aralığında öne çıkıyor; 48 MP ana kamera gündüz çekimlerinde tatmin edici sonuç veriyor. Oyun performansı sınırlı, ancak sosyal medya, mesajlaşma ve video izleme için yeterli.",
    gallery: TONES[3]!,
    heat: 88,
    id: "p4",
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
    categoryId: "laptop",
    description:
      "Aurora Book Air 14, 1,25 kg gövdesi ve sessiz çalışan pasif soğutmasıyla taşınabilirliği önceleyen bir dizüstü. M3 yonga seti ofis işleri, fotoğraf düzenleme ve hafif video kurgusunda rahat; 18 saate kadar batarya ömrü gün boyu prizden bağımsız kullanım sağlıyor. 14,2 inç 120 Hz ekran renk doğruluğu yüksek.",
    gallery: TONES[4]!,
    heat: 55,
    id: "p5",
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
    categoryId: "laptop",
    description:
      "Vertex Slim 14, Core Ultra 7 işlemcisi ve 1 TB depolamasıyla iş kullanımına yönelik bir dizüstü. Yapay zekâ hızlandırıcısı yerel model çalıştırmayı destekliyor. Klavyesi tuş yolu bakımından rahat, gövdesi alüminyum. Fan yük altında duyuluyor.",
    gallery: TONES[5]!,
    heat: 79,
    id: "p6",
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
    categoryId: "audio",
    description:
      "Sonare Air Pro 3, aktif gürültü engelleme ve şeffaflık modu sunan tam kablosuz bir kulaklık. Şarj kutusuyla birlikte 32 saate kadar kullanım veriyor. Çoklu cihaz bağlantısı telefon ile bilgisayar arasında otomatik geçiş yapıyor. Kulak içi tespit sensörü kulaklık çıkarıldığında sesi duraklatıyor.",
    gallery: TONES[0]!,
    heat: 84,
    id: "p7",
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
    categoryId: "audio",
    description:
      "Klar Studio 40, kulak üstü tasarımı ve 40 mm sürücüleriyle uzun dinleme oturumları için üretilmiş bir kulaklık. 45 saatlik batarya ömrü sınıfının üstünde. Kablolu bağlantı seçeneği stüdyo kullanımına imkân veriyor. Kafa bandı baskısı ilk günlerde hissediliyor.",
    gallery: TONES[1]!,
    heat: 47,
    id: "p8",
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
    categoryId: "garden",
    description:
      "MaxTool MX8008, 20 V çift akü ile çalışan mini dal budama testeresi. 10 cm kılavuz uzunluğu ve 5 m/s zincir hızıyla ince ve orta kalınlıktaki dallar için uygun. Taşıma çantası, iki akü ve şarj cihazı kutudan çıkıyor. Tek elle kullanılabilecek ağırlıkta; kalın gövde kesimi için tasarlanmadı.",
    gallery: TONES[5]!,
    heat: 66,
    id: "p11",
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
    ])
  }
];

export const PRODUCTS: Product[] = SEEDS.map((seed, index) => {
  const offers = offersAround(seed.base, seed.shops, index, seed.name);
  return {
    brand: seed.brand,
    categoryId: seed.categoryId,
    description: seed.description,
    gallery: seed.gallery,
    heat: seed.heat,
    id: seed.id,
    listPrice: seed.listPrice,
    listedAt: seed.listedAt,
    lowestPrice: Math.min(...offers.map((offer) => offer.price)),
    name: seed.name,
    offerCount: offers.length,
    offers,
    popularity: seed.popularity,
    reviewCount: seed.reviewCount,
    slug: seed.slug,
    specs: seed.specs
  };
});

export const productBySlug = (slug: string): Product | undefined =>
  PRODUCTS.find((product) => product.slug === slug);

/** The widest price in the catalogue, so the budget ceiling is a real one. */
export const MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.lowestPrice));
