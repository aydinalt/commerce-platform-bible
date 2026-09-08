#!/usr/bin/env node
/**
 * The field sets a listing is entered against (I66).
 *
 * **The catalogue had a shape and no fields.** `seed-taxonomy.mjs` gave the
 * platform eleven sectors and a hundred and twenty-seven headings; the
 * Attribute machinery — `attribute_definition`, `attribute_option`,
 * `category_attribute`, `offering_attribute_value` — has existed since I2 with
 * an Admin API in front of it, and outside the test suite **nothing has ever
 * written a row into it**. `seed-demo.mjs` publishes its Offerings with
 * `attributes: []`.
 *
 * Everything that follows from that is missing at once, and it is most of the
 * product:
 *
 * - the Owner's *"her başlık kendi alan setini kullanır"* — the Açıklama tab's
 *   grouped specification, which his prototype shows on every product page;
 * - **Attribute Filters**, which `US-DSC-F05-001` defines and which are offered
 *   only where a Category has filterable Attributes — i.e. nowhere;
 * - the **comparison table's rows**, which come from `comparable` definitions;
 * - the search that answers *"16 gb ram laptop"*, because `attribute_text` in
 *   the projection is assembled from supplied values;
 * - and, before any of those, **listing entry itself**: a seller opening the
 *   form is shown the applicable Attributes, and an empty set is a form that
 *   asks for a title and a price and nothing that distinguishes one laptop from
 *   another.
 *
 * ## Why a script rather than the Admin screens
 *
 * The same reason `seed-taxonomy.mjs` gives for the Categories: a hundred and
 * twenty-seven field sets is a data-entry project, not a bootstrap, and one
 * redone from memory on every fresh environment. The rules being bypassed are
 * worth naming rather than assumed:
 *
 * - **Definitions are global and Categories point at them.** `stable_key` is
 *   unique on `attribute_definition`, so "Garanti süresi" is one definition
 *   used by thirty headings rather than thirty definitions with one name. That
 *   is what makes a filter mean the same thing in two Categories, and it is why
 *   the data below is written per heading and de-duplicated here rather than
 *   being written as a definition list somebody has to keep in sync by hand.
 * - **A definition's shape is fixed by its first appearance.** Where the same
 *   key is written twice with different options the script refuses, because two
 *   shapes under one key is the one error this format makes easy and the
 *   database would accept silently.
 * - **Text cannot be filterable.** `US-PLT-F09-001` refuses it and so does the
 *   Admin service; the flags below never set it, and the insert would be
 *   rejected by the same rule if they did.
 * - Uniqueness is left to the database — `stable_key`, and
 *   `(attribute_definition_id, stable_key)` for options — so a second run
 *   changes nothing and running it after adding a heading adds only that
 *   heading.
 *
 *   npm run seed:attributes
 *
 * ## What is written, and what is deliberately not
 *
 * Between four and eight fields per heading: the ones a person actually
 * compares. A heading with twenty fields is a form nobody finishes and a filter
 * panel nobody reads — and PRD-0002 §5.5 makes every one of these a potential
 * Filter, so the list is the answer to "what would you narrow by", not "what
 * could be recorded".
 *
 * `requiredForPublication` is set on **nothing**. It is a real gate — an
 * Offering missing a required value cannot be published — and turning it on for
 * a catalogue that already holds unpublished drafts would retire other people's
 * work by seeding a script. The flag stays for the Admin screens to set, one
 * heading at a time, once there are sellers to tell.
 */
import { Client } from "pg";

/**
 * One field, in the terms the columns use.
 *
 * `kind` is shortened here and expanded on write: the five `AttributeValueKind`
 * values are long, this file has some eight hundred of them, and a line that
 * fits on one line is a line somebody will read.
 *
 * `flags` is a bag of letters rather than four booleans, for the same reason:
 *   f — filterable (offered as a Discovery Filter)
 *   c — comparable (becomes a row in the comparison table)
 *   s — searchable (its value joins the Offering's searchable text)
 * Nothing here sets `requiredForPublication`; see the note above.
 */
/**
 * @typedef {object} Field
 * @property {string} flags
 * @property {string} key
 * @property {"BOOL"|"MULTI"|"NUM"|"SELECT"|"TEXT"} kind
 * @property {string} name
 * @property {string[]|string|null} spec
 */

/**
 * @param {string} key
 * @param {string} name
 * @param {"BOOL"|"MULTI"|"NUM"|"SELECT"|"TEXT"} kind
 * @param {string[]|string|null} spec
 * @param {string} flags
 * @returns {Field}
 */
function a(key, name, kind, spec, flags) {
  return { flags, key, kind, name, spec };
}

/** @type {Record<string, string>} */
const KINDS = {
  BOOL: "BOOLEAN",
  MULTI: "MULTI_SELECT",
  NUM: "NUMBER",
  SELECT: "SINGLE_SELECT",
  TEXT: "TEXT"
};

/**
 * A stable key for an option, derived from its own label.
 *
 * @param {string} label
 */
function optionKey(label) {
  /** @type {Record<string, string>} */
  const latin = {
    â: "a",
    ç: "c",
    ğ: "g",
    ı: "i",
    î: "i",
    ö: "o",
    ş: "s",
    û: "u",
    ü: "u"
  };
  /*
   * `replace` with a global pattern rather than `replaceAll`: this file is
   * linted against the default TypeScript project, whose library does not
   * declare the ES2021 method — `seed-taxonomy.mjs` avoids it for the same
   * reason, with `split`/`join`.
   */
  const lower = label.toLocaleLowerCase("tr");
  const latinised = lower.replace(
    /[âçğıîöşûü]/gu,
    (letter) => latin[letter] ?? letter
  );
  return latinised
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_|_$/gu, "")
    .toUpperCase()
    .slice(0, 60);
}

/*
 * The fields several headings share, written once and referenced.
 *
 * A repeated `a(...)` call with a drifted option list is the one mistake this
 * file's shape invites, and naming the shared ones removes the opportunity
 * rather than guarding against it.
 */
const GARANTI = a(
  "GARANTI",
  "Garanti süresi",
  "SELECT",
  ["12 ay", "24 ay", "36 ay"],
  "fc"
);
const RENK = a(
  "RENK",
  "Renk",
  "SELECT",
  ["Siyah", "Beyaz", "Gri", "Gümüş", "Mavi", "Kırmızı"],
  "fc"
);
const PLATFORM = a(
  "PLATFORM",
  "Platform",
  "MULTI",
  ["Windows", "macOS", "Linux", "iOS", "Android", "Web"],
  "fcs"
);
const ABONELIK_SURESI = a(
  "ABONELIK_SURESI",
  "Abonelik süresi",
  "SELECT",
  ["Aylık", "Yıllık", "2 yıllık"],
  "fc"
);
const KULLANICI_SAYISI = a(
  "KULLANICI_SAYISI",
  "Kullanıcı sayısı",
  "SELECT",
  ["1 kullanıcı", "5 kullanıcı", "10 kullanıcı", "25 kullanıcı ve üzeri"],
  "fc"
);
const DESTEK = a(
  "DESTEK",
  "Destek",
  "SELECT",
  ["E-posta", "7/24 telefon", "Öncelikli destek"],
  "fc"
);
const TESLIM_BICIMI = a(
  "TESLIM_BICIMI",
  "Teslim biçimi",
  "SELECT",
  ["Dijital kod", "Kargo", "Hesaba yükleme"],
  "fc"
);
const POLICE_SURESI = a(
  "POLICE_SURESI",
  "Poliçe süresi",
  "SELECT",
  ["12 ay", "24 ay"],
  "fc"
);
const ODEME = a(
  "ODEME",
  "Ödeme seçeneği",
  "MULTI",
  ["Peşin", "6 taksit", "9 taksit", "12 taksit"],
  "fc"
);
const MUAFIYET = a(
  "MUAFIYET",
  "Muafiyet",
  "SELECT",
  ["Muafiyetsiz", "%2 muafiyetli", "%5 muafiyetli"],
  "fc"
);
const SERTIFIKA = a("SERTIFIKA", "Sertifika verilir", "BOOL", null, "fc");
const EGITIM_DILI = a(
  "EGITIM_DILI",
  "Eğitim dili",
  "SELECT",
  ["Türkçe", "İngilizce", "İngilizce (Türkçe altyazılı)"],
  "fcs"
);
const SEVIYE = a(
  "SEVIYE",
  "Seviye",
  "SELECT",
  ["Başlangıç", "Orta", "İleri"],
  "fc"
);
const SURE_SAAT = a("SURE_SAAT", "Toplam süre", "NUM", "saat", "fc");
const ERISIM_SURESI = a(
  "ERISIM_SURESI",
  "Erişim süresi",
  "SELECT",
  ["1 yıl", "2 yıl", "Ömür boyu"],
  "fc"
);
const EGITIM_FORMATI = a(
  "EGITIM_FORMATI",
  "Format",
  "SELECT",
  ["Canlı çevrim içi", "Kayıttan izleme", "Hibrit"],
  "fc"
);
const BAGLANTI = a(
  "BAGLANTI",
  "Bağlantı",
  "SELECT",
  ["Kablolu", "Kablosuz 2,4 GHz", "Bluetooth"],
  "fcs"
);
const EKRAN_BOYUTU = a("EKRAN_BOYUTU", "Ekran boyutu", "NUM", "inç", "fcs");
const RAM = a(
  "RAM",
  "RAM",
  "SELECT",
  ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "32 GB", "64 GB"],
  "fcs"
);
const DEPOLAMA = a(
  "DEPOLAMA",
  "Depolama",
  "SELECT",
  ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"],
  "fcs"
);
const ISLEMCI = a(
  "ISLEMCI",
  "İşlemci",
  "SELECT",
  [
    "Intel Core i5",
    "Intel Core i7",
    "Intel Core i9",
    "AMD Ryzen 5",
    "AMD Ryzen 7",
    "Apple M serisi"
  ],
  "fcs"
);
const PIL_KAPASITESI = a(
  "PIL_KAPASITESI",
  "Batarya kapasitesi",
  "NUM",
  "mAh",
  "fc"
);
const SU_DAYANIKLILIK = a(
  "SU_DAYANIKLILIK",
  "Suya dayanıklılık",
  "SELECT",
  ["IPX4", "IPX5", "IP67", "IP68", "5 ATM", "Yok"],
  "fc"
);
const AGIRLIK_G = a("AGIRLIK_G", "Ağırlık", "NUM", "g", "c");
const ENERJI_SINIFI = a(
  "ENERJI_SINIFI",
  "Enerji sınıfı",
  "SELECT",
  ["A", "B", "C", "D"],
  "fc"
);
const KURULUM = a("KURULUM", "Kurulum dâhil", "BOOL", null, "fc");
const MALZEME = a(
  "MALZEME",
  "Malzeme",
  "SELECT",
  ["Metal", "Ahşap", "MDF", "Cam", "Plastik", "Kumaş"],
  "fc"
);
const IPTAL_KOSULU = a(
  "IPTAL_KOSULU",
  "İptal koşulu",
  "SELECT",
  ["Ücretsiz iptal", "Cayma bedelli", "İade yok"],
  "fc"
);
const KISI_SAYISI = a("KISI_SAYISI", "Kişi sayısı", "NUM", "kişi", "fc");
const SEZON = a(
  "SEZON",
  "Sezon",
  "SELECT",
  ["Yaz", "Kış", "Dört mevsim"],
  "fc"
);
const ARAC_SEGMENTI = a(
  "ARAC_SEGMENTI",
  "Araç segmenti",
  "SELECT",
  ["Ekonomi", "Orta sınıf", "Üst sınıf", "SUV", "Ticari"],
  "fc"
);
const VITES = a("VITES", "Vites", "SELECT", ["Manuel", "Otomatik"], "fc");
const YAKIT = a(
  "YAKIT",
  "Yakıt",
  "SELECT",
  ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik"],
  "fc"
);
const CILT_TIPI = a(
  "CILT_TIPI",
  "Cilt tipi",
  "SELECT",
  ["Kuru", "Karma", "Yağlı", "Hassas", "Normal"],
  "fcs"
);
const HACIM_ML = a("HACIM_ML", "Hacim", "NUM", "ml", "fc");
const KULLANIM_SURESI_GUN = a(
  "KULLANIM_SURESI_GUN",
  "Kullanım süresi",
  "NUM",
  "gün",
  "fc"
);
const YAS_SINIRI = a(
  "YAS_SINIRI",
  "Yaş sınırı",
  "SELECT",
  ["3+", "7+", "12+", "16+", "18+"],
  "fc"
);
const BOLGE = a(
  "BOLGE",
  "Geçerli bölge",
  "SELECT",
  ["Türkiye", "Avrupa", "Global"],
  "fc"
);

/**
 * Heading slug → the fields a listing under it is entered against.
 *
 * The slugs are `seed-taxonomy.mjs`'s, and the Category is found by the stable
 * key that script derives from them, so a heading renamed there keeps its
 * fields here.
 */
/** @type {Record<string, Field[]>} */
const FIELDS = {
  /* ── Teknoloji ve Tüketici Elektroniği ──────────────────────────────── */
  "cep-telefonlari": [
    EKRAN_BOYUTU,
    a(
      "EKRAN_TEKNOLOJISI",
      "Ekran teknolojisi",
      "SELECT",
      ["LCD", "OLED", "AMOLED"],
      "fcs"
    ),
    a(
      "TAZELEME_HIZI",
      "Tazeleme hızı",
      "SELECT",
      ["60 Hz", "90 Hz", "120 Hz", "144 Hz"],
      "fc"
    ),
    RAM,
    DEPOLAMA,
    PIL_KAPASITESI,
    a("ARKA_KAMERA_MP", "Arka kamera çözünürlüğü", "NUM", "MP", "fcs"),
    a(
      "SEBEKE",
      "Ağ desteği",
      "MULTI",
      ["4G", "5G", "Wi-Fi 6", "Wi-Fi 6E", "eSIM"],
      "fcs"
    ),
    RENK,
    GARANTI
  ],
  "mobil-aksesuar": [
    a(
      "AKSESUAR_TIPI",
      "Aksesuar tipi",
      "SELECT",
      [
        "Kılıf",
        "Ekran koruyucu",
        "Şarj cihazı",
        "Kablo",
        "Powerbank",
        "Tutucu"
      ],
      "fcs"
    ),
    a(
      "UYUMLU_MARKA",
      "Uyumlu marka",
      "MULTI",
      ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Evrensel"],
      "fcs"
    ),
    a("SARJ_GUCU_W", "Şarj gücü", "NUM", "W", "fc"),
    MALZEME,
    RENK,
    GARANTI
  ],
  laptop: [
    EKRAN_BOYUTU,
    a(
      "COZUNURLUK",
      "Çözünürlük",
      "SELECT",
      [
        "1366×768",
        "1920×1080",
        "2560×1440",
        "2560×1600",
        "2880×1800",
        "3840×2160"
      ],
      "fcs"
    ),
    ISLEMCI,
    RAM,
    DEPOLAMA,
    a(
      "EKRAN_KARTI",
      "Ekran kartı",
      "SELECT",
      ["Dahili", "RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080", "Radeon"],
      "fcs"
    ),
    a(
      "ISLETIM_SISTEMI",
      "İşletim sistemi",
      "SELECT",
      ["Windows 11", "macOS", "FreeDOS", "Linux"],
      "fcs"
    ),
    a("AGIRLIK_KG", "Ağırlık", "NUM", "kg", "fc"),
    GARANTI
  ],
  masaustu: [
    ISLEMCI,
    RAM,
    DEPOLAMA,
    a(
      "EKRAN_KARTI",
      "Ekran kartı",
      "SELECT",
      ["Dahili", "RTX 4050", "RTX 4060", "RTX 4070", "RTX 4080", "Radeon"],
      "fcs"
    ),
    a(
      "KASA_TIPI",
      "Kasa tipi",
      "SELECT",
      ["Mini PC", "Mid Tower", "Full Tower", "Hepsi bir arada"],
      "fcs"
    ),
    a("GUC_KAYNAGI_W", "Güç kaynağı", "NUM", "W", "c"),
    GARANTI
  ],
  "donanim-parcalari": [
    a(
      "PARCA_TIPI",
      "Parça tipi",
      "SELECT",
      [
        "Anakart",
        "İşlemci",
        "Ekran kartı",
        "RAM",
        "SSD",
        "Güç kaynağı",
        "Soğutucu"
      ],
      "fcs"
    ),
    a(
      "UYUMLU_SOKET",
      "Uyumlu soket",
      "SELECT",
      ["AM4", "AM5", "LGA1700", "LGA1851"],
      "fcs"
    ),
    a("KAPASITE_GB", "Kapasite", "NUM", "GB", "fc"),
    a(
      "ARABIRIM",
      "Arabirim",
      "SELECT",
      ["PCIe 4.0", "PCIe 5.0", "SATA III", "NVMe"],
      "fcs"
    ),
    GARANTI
  ],
  televizyon: [
    EKRAN_BOYUTU,
    a("PANEL", "Panel", "SELECT", ["LED", "QLED", "OLED", "Mini LED"], "fcs"),
    a(
      "COZUNURLUK",
      "Çözünürlük",
      "SELECT",
      [
        "1366×768",
        "1920×1080",
        "2560×1440",
        "2560×1600",
        "2880×1800",
        "3840×2160"
      ],
      "fcs"
    ),
    a(
      "TAZELEME_HIZI",
      "Tazeleme hızı",
      "SELECT",
      ["60 Hz", "90 Hz", "120 Hz", "144 Hz"],
      "fc"
    ),
    a("SES_GUCU_W", "Ses gücü", "NUM", "W", "c"),
    a(
      "BAGLANTI_NOKTALARI",
      "Bağlantı noktaları",
      "MULTI",
      ["HDMI 2.1", "USB", "Ethernet", "Wi-Fi", "Bluetooth", "Optik çıkış"],
      "fcs"
    ),
    ENERJI_SINIFI,
    GARANTI
  ],
  "ev-sinema": [
    a(
      "KANAL_YAPISI",
      "Kanal yapısı",
      "SELECT",
      ["2.0", "2.1", "3.1", "5.1", "7.1", "Dolby Atmos"],
      "fcs"
    ),
    a("SES_GUCU_W", "Ses gücü", "NUM", "W", "c"),
    a(
      "BAGLANTI_NOKTALARI",
      "Bağlantı noktaları",
      "MULTI",
      ["HDMI 2.1", "USB", "Ethernet", "Wi-Fi", "Bluetooth", "Optik çıkış"],
      "fcs"
    ),
    KURULUM,
    GARANTI
  ],
  "akilli-saat": [
    EKRAN_BOYUTU,
    a("PIL_OMRU_GUN", "Pil ömrü", "NUM", "gün", "fc"),
    a(
      "SENSORLER",
      "Sensörler",
      "MULTI",
      ["Nabız", "SpO2", "EKG", "Uyku takibi", "GPS", "Barometre"],
      "fcs"
    ),
    SU_DAYANIKLILIK,
    a(
      "KORDON_MALZEMESI",
      "Kordon malzemesi",
      "SELECT",
      ["Silikon", "Deri", "Metal", "Kumaş"],
      "fc"
    ),
    GARANTI
  ],
  giyilebilir: [
    a(
      "URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Akıllı bileklik",
        "Akıllı yüzük",
        "Akıllı gözlük",
        "Vücut analiz cihazı"
      ],
      "fcs"
    ),
    a("PIL_OMRU_GUN", "Pil ömrü", "NUM", "gün", "fc"),
    a(
      "SENSORLER",
      "Sensörler",
      "MULTI",
      ["Nabız", "SpO2", "EKG", "Uyku takibi", "GPS", "Barometre"],
      "fcs"
    ),
    SU_DAYANIKLILIK,
    GARANTI
  ],
  "fotograf-makinesi": [
    a(
      "MAKINE_TIPI",
      "Makine tipi",
      "SELECT",
      ["Aynasız", "DSLR", "Kompakt", "Anlık baskı"],
      "fcs"
    ),
    a(
      "SENSOR_BOYUTU",
      "Sensör boyutu",
      "SELECT",
      ["1 inç", "APS-C", "Tam kare", "Micro 4/3"],
      "fcs"
    ),
    a("COZUNURLUK_MP", "Çözünürlük", "NUM", "MP", "fcs"),
    a(
      "VIDEO_KAYIT",
      "Video kayıt",
      "SELECT",
      ["1080p", "4K 30 fps", "4K 60 fps", "6K", "8K"],
      "fcs"
    ),
    a("LENS_DAHIL", "Lens dâhil", "BOOL", null, "fc"),
    GARANTI
  ],
  "video-kamera": [
    a(
      "VIDEO_KAYIT",
      "Video kayıt",
      "SELECT",
      ["1080p", "4K 30 fps", "4K 60 fps", "6K", "8K"],
      "fcs"
    ),
    a(
      "STABILIZASYON",
      "Stabilizasyon",
      "SELECT",
      ["Yok", "Elektronik", "Optik", "Gimbal"],
      "fcs"
    ),
    a("KAYIT_SURESI_DK", "Kesintisiz kayıt süresi", "NUM", "dk", "c"),
    SU_DAYANIKLILIK,
    GARANTI
  ],
  dron: [
    a("UCUS_SURESI_DK", "Uçuş süresi", "NUM", "dk", "fc"),
    a("MENZIL_KM", "Menzil", "NUM", "km", "fc"),
    a(
      "VIDEO_KAYIT",
      "Video kayıt",
      "SELECT",
      ["1080p", "4K 30 fps", "4K 60 fps", "6K", "8K"],
      "fcs"
    ),
    AGIRLIK_G,
    a("ENGEL_ALGILAMA", "Engel algılama", "BOOL", null, "fc"),
    GARANTI
  ],
  kulaklik: [
    a(
      "KULAKLIK_TIPI",
      "Kulaklık tipi",
      "SELECT",
      ["Kulak içi", "Kulak üstü", "Kulak çevreleyen", "Kemik iletimli"],
      "fcs"
    ),
    a(
      "GURULTU_ENGELLEME",
      "Gürültü engelleme",
      "SELECT",
      ["Aktif (ANC)", "Pasif", "Yok"],
      "fcs"
    ),
    BAGLANTI,
    a("KULLANIM_SURESI_SAAT", "Kullanım süresi", "NUM", "saat", "fc"),
    SU_DAYANIKLILIK,
    a("MIKROFON", "Mikrofon", "BOOL", null, "fc"),
    GARANTI
  ]
};

/* ── Otomotiv ve Araç Kiralama ──────────────────────────────────────────── */
Object.assign(FIELDS, {
  "arac-kiralama": [
    ARAC_SEGMENTI,
    VITES,
    YAKIT,
    a(
      "GUNLUK_KM_SINIRI",
      "Günlük km sınırı",
      "SELECT",
      ["200 km", "300 km", "400 km", "Sınırsız"],
      "fc"
    ),
    a(
      "DEPOZITO",
      "Depozito",
      "SELECT",
      ["Depozitosuz", "2.500 ₺", "5.000 ₺", "10.000 ₺"],
      "fc"
    ),
    a(
      "SURUCU_YASI",
      "En az sürücü yaşı",
      "SELECT",
      ["21 yaş", "25 yaş", "30 yaş"],
      "fc"
    ),
    a(
      "TESLIM_YERI",
      "Teslim yeri",
      "MULTI",
      ["Ofis", "Havalimanı", "Adrese teslim"],
      "fcs"
    )
  ],
  "filo-kiralama": [
    ARAC_SEGMENTI,
    VITES,
    YAKIT,
    a("SOZLESME_SURESI_AY", "Sözleşme süresi", "NUM", "ay", "fc"),
    a(
      "YILLIK_KM_SINIRI",
      "Yıllık km sınırı",
      "SELECT",
      ["10.000 km", "20.000 km", "30.000 km", "Sınırsız"],
      "fc"
    ),
    a("BAKIM_DAHIL", "Bakım dâhil", "BOOL", null, "fc"),
    a("SIGORTA_DAHIL", "Sigorta dâhil", "BOOL", null, "fc")
  ],
  "oto-lastik": [
    a(
      "LASTIK_EBADI",
      "Ebat",
      "SELECT",
      ["195/65 R15", "205/55 R16", "225/45 R17", "235/60 R18", "255/40 R19"],
      "fcs"
    ),
    SEZON,
    a(
      "ISLAK_ZEMIN_SINIFI",
      "Islak zemin sınıfı",
      "SELECT",
      ["A", "B", "C", "D"],
      "fc"
    ),
    a(
      "YAKIT_SINIFI",
      "Yakıt verimliliği sınıfı",
      "SELECT",
      ["A", "B", "C", "D"],
      "fc"
    ),
    a("GURULTU_DB", "Gürültü", "NUM", "dB", "c"),
    a("ADET", "Adet", "NUM", "adet", "fc")
  ],
  jant: [
    a(
      "JANT_CAPI",
      "Jant çapı",
      "SELECT",
      ['15"', '16"', '17"', '18"', '19"', '20"'],
      "fcs"
    ),
    a(
      "BIJON_DELIGI",
      "Bijon deliği",
      "SELECT",
      ["4×100", "5×100", "5×108", "5×112", "5×114,3"],
      "fcs"
    ),
    MALZEME,
    RENK,
    a("ADET", "Adet", "NUM", "adet", "fc")
  ],
  "dis-donanim": [
    a(
      "DONANIM_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Port bagaj", "Çeki demiri", "Spoiler", "Marşpiyel", "Cam filmi"],
      "fcs"
    ),
    a("UYUMLU_ARAC", "Uyumlu araç", "TEXT", null, "s"),
    MALZEME,
    KURULUM,
    GARANTI
  ],
  "arac-multimedya": [
    EKRAN_BOYUTU,
    a(
      "MULTIMEDYA_UYUM",
      "Uyumluluk",
      "MULTI",
      ["Apple CarPlay", "Android Auto", "Bluetooth", "USB", "DAB+"],
      "fcs"
    ),
    a("HAFIZA_GB", "Dahili hafıza", "NUM", "GB", "c"),
    KURULUM,
    GARANTI
  ],
  "oto-ici-aksesuar": [
    a(
      "IC_AKSESUAR_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Paspas",
        "Koltuk kılıfı",
        "Telefon tutucu",
        "Organizer",
        "Direksiyon kılıfı"
      ],
      "fcs"
    ),
    a("UYUMLU_ARAC", "Uyumlu araç", "TEXT", null, "s"),
    MALZEME,
    RENK
  ],
  "oto-bakim": [
    a(
      "BAKIM_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Fren balatası", "Filtre", "Akü", "Silecek", "Buji"],
      "fcs"
    ),
    a("UYUMLU_ARAC", "Uyumlu araç", "TEXT", null, "s"),
    GARANTI,
    a("MENSEI", "Menşei", "SELECT", ["Orijinal", "Muadil"], "fc")
  ],
  "oto-temizlik": [
    a(
      "TEMIZLIK_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Şampuan",
        "Cila",
        "İç temizleyici",
        "Jant temizleyici",
        "Seramik kaplama"
      ],
      "fcs"
    ),
    HACIM_ML,
    a("UYGULAMA", "Uygulama", "SELECT", ["Sprey", "Sünger", "Makine"], "fc"),
    a(
      "YUZEY",
      "Uygulanacak yüzey",
      "MULTI",
      ["Boya", "Cam", "Jant", "Döşeme", "Motor"],
      "fcs"
    )
  ],
  "motor-yaglari": [
    a(
      "YAG_VISKOZITESI",
      "Viskozite",
      "SELECT",
      ["0W-20", "5W-30", "5W-40", "10W-40", "15W-40"],
      "fcs"
    ),
    a(
      "YAG_TIPI",
      "Yağ tipi",
      "SELECT",
      ["Tam sentetik", "Yarı sentetik", "Mineral"],
      "fcs"
    ),
    a("HACIM_L", "Hacim", "NUM", "L", "fc"),
    a(
      "UYUMLU_MOTOR",
      "Uyumlu motor",
      "SELECT",
      ["Benzinli", "Dizel", "Benzinli ve dizel"],
      "fc"
    )
  ],
  "yedek-parca": [
    a(
      "PARCA_KATEGORISI",
      "Parça kategorisi",
      "SELECT",
      ["Motor", "Şanzıman", "Fren", "Süspansiyon", "Elektrik", "Kaporta"],
      "fcs"
    ),
    a("UYUMLU_ARAC", "Uyumlu araç", "TEXT", null, "s"),
    a("MENSEI", "Menşei", "SELECT", ["Orijinal", "Muadil"], "fc"),
    GARANTI
  ],
  "oto-ekspertiz": [
    a(
      "EKSPERTIZ_KAPSAMI",
      "Kapsam",
      "MULTI",
      [
        "Boya ölçümü",
        "Motor testi",
        "Fren testi",
        "Süspansiyon",
        "OBD arıza taraması"
      ],
      "fcs"
    ),
    a("RAPOR_SURESI_SAAT", "Rapor teslim süresi", "NUM", "saat", "fc"),
    a(
      "RANDEVU",
      "Randevu",
      "SELECT",
      ["Aynı gün", "1 gün içinde", "3 gün içinde"],
      "fc"
    ),
    a("MOBIL_HIZMET", "Adrese gelen hizmet", "BOOL", null, "fc")
  ]
});

/* ── Gayrimenkul ve Emlak ───────────────────────────────────────────────── */
Object.assign(FIELDS, {
  "satilik-konut": [
    a(
      "ODA_SAYISI",
      "Oda sayısı",
      "SELECT",
      ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri"],
      "fcs"
    ),
    a("BRUT_ALAN_M2", "Brüt alan", "NUM", "m²", "fcs"),
    a(
      "BINA_YASI",
      "Bina yaşı",
      "SELECT",
      ["0 (sıfır)", "1-5", "6-10", "11-20", "21 ve üzeri"],
      "fc"
    ),
    a(
      "BULUNDUGU_KAT",
      "Bulunduğu kat",
      "SELECT",
      ["Bodrum", "Giriş", "1-3", "4-8", "9 ve üzeri", "Çatı katı"],
      "fc"
    ),
    a(
      "ISITMA",
      "Isıtma",
      "SELECT",
      ["Doğalgaz kombi", "Merkezi", "Yerden ısıtma", "Klima", "Soba"],
      "fcs"
    ),
    a(
      "TAPU_DURUMU",
      "Tapu durumu",
      "SELECT",
      ["Kat mülkiyetli", "Kat irtifaklı", "Hisseli", "Arsa tapulu"],
      "fc"
    ),
    a("KREDIYE_UYGUN", "Krediye uygun", "BOOL", null, "fc"),
    a(
      "OTOPARK",
      "Otopark",
      "SELECT",
      ["Kapalı otopark", "Açık otopark", "Yok"],
      "fc"
    )
  ],
  "satilik-proje": [
    a(
      "ODA_SAYISI",
      "Oda sayısı",
      "SELECT",
      ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri"],
      "fcs"
    ),
    a("BRUT_ALAN_M2", "Brüt alan", "NUM", "m²", "fcs"),
    a(
      "TESLIM_TARIHI",
      "Teslim tarihi",
      "SELECT",
      ["Teslim edildi", "6 ay içinde", "1 yıl içinde", "2 yıl ve sonrası"],
      "fc"
    ),
    a(
      "SOSYAL_OLANAKLAR",
      "Sosyal olanaklar",
      "MULTI",
      ["Havuz", "Spor salonu", "Güvenlik", "Otopark", "Çocuk oyun alanı"],
      "fcs"
    ),
    a("KREDIYE_UYGUN", "Krediye uygun", "BOOL", null, "fc")
  ],
  "satilik-isyeri": [
    a(
      "ISYERI_TIPI",
      "İş yeri tipi",
      "SELECT",
      ["Dükkân", "Ofis", "Depo", "Atölye", "Fabrika"],
      "fcs"
    ),
    a("BRUT_ALAN_M2", "Brüt alan", "NUM", "m²", "fcs"),
    a("KAT_SAYISI", "Kat sayısı", "NUM", "kat", "c"),
    a(
      "RUHSAT_DURUMU",
      "Ruhsat durumu",
      "SELECT",
      ["İş yeri ruhsatlı", "Ruhsatsız", "Ruhsat alınabilir"],
      "fc"
    ),
    a(
      "TAPU_DURUMU",
      "Tapu durumu",
      "SELECT",
      ["Kat mülkiyetli", "Kat irtifaklı", "Hisseli", "Arsa tapulu"],
      "fc"
    )
  ],
  "satilik-ticari": [
    a(
      "TICARI_TIP",
      "Gayrimenkul tipi",
      "SELECT",
      ["Plaza katı", "AVM mağazası", "Otel", "Benzin istasyonu", "Fabrika"],
      "fcs"
    ),
    a("BRUT_ALAN_M2", "Brüt alan", "NUM", "m²", "fcs"),
    a("KIRA_GETIRISI", "Kira getirisi var", "BOOL", null, "fc"),
    a(
      "TAPU_DURUMU",
      "Tapu durumu",
      "SELECT",
      ["Kat mülkiyetli", "Kat irtifaklı", "Hisseli", "Arsa tapulu"],
      "fc"
    )
  ],
  "satilik-arsa": [
    a("ARSA_ALANI_M2", "Alan", "NUM", "m²", "fcs"),
    a(
      "IMAR_DURUMU",
      "İmar durumu",
      "SELECT",
      [
        "Konut imarlı",
        "Ticari imarlı",
        "Sanayi imarlı",
        "Tarla",
        "Bağ-bahçe",
        "İmarsız"
      ],
      "fcs"
    ),
    a(
      "KAKS",
      "Emsal (KAKS)",
      "SELECT",
      ["0,30", "0,50", "1,00", "1,50", "2,00"],
      "fc"
    ),
    a(
      "ALTYAPI",
      "Altyapı",
      "MULTI",
      ["Elektrik", "Su", "Doğalgaz", "Yol", "Kanalizasyon"],
      "fcs"
    ),
    a(
      "TAPU_DURUMU",
      "Tapu durumu",
      "SELECT",
      ["Kat mülkiyetli", "Kat irtifaklı", "Hisseli", "Arsa tapulu"],
      "fc"
    )
  ],
  "satilik-arazi": [
    a("ARSA_ALANI_M2", "Alan", "NUM", "m²", "fcs"),
    a(
      "ARAZI_NITELIGI",
      "Niteliği",
      "SELECT",
      ["Tarla", "Bağ", "Bahçe", "Zeytinlik", "Orman vasıflı"],
      "fcs"
    ),
    a("SULAMA", "Sulama", "SELECT", ["Sulu", "Kuru", "Damla sulama"], "fc"),
    a(
      "ALTYAPI",
      "Altyapı",
      "MULTI",
      ["Elektrik", "Su", "Doğalgaz", "Yol", "Kanalizasyon"],
      "fcs"
    ),
    a(
      "TAPU_DURUMU",
      "Tapu durumu",
      "SELECT",
      ["Kat mülkiyetli", "Kat irtifaklı", "Hisseli", "Arsa tapulu"],
      "fc"
    )
  ],
  "turistik-tesis": [
    a("ODA_KAPASITESI", "Oda kapasitesi", "NUM", "oda", "fcs"),
    a("YATAK_KAPASITESI", "Yatak kapasitesi", "NUM", "yatak", "fc"),
    a(
      "TESIS_TIPI",
      "Tesis tipi",
      "SELECT",
      ["Otel", "Apart", "Butik otel", "Tatil köyü", "Pansiyon"],
      "fcs"
    ),
    a(
      "ISLETME_BELGESI",
      "İşletme belgesi",
      "SELECT",
      ["Turizm işletme belgeli", "Belediye belgeli", "Belgesiz"],
      "fc"
    )
  ],
  "gunluk-kiralik-ev": [
    a(
      "ODA_SAYISI",
      "Oda sayısı",
      "SELECT",
      ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri"],
      "fcs"
    ),
    KISI_SAYISI,
    a("EN_AZ_KONAKLAMA_GECE", "En az konaklama", "NUM", "gece", "fc"),
    a(
      "EV_OLANAKLARI",
      "Olanaklar",
      "MULTI",
      ["Wi-Fi", "Mutfak", "Klima", "Çamaşır makinesi", "Otopark", "Havuz"],
      "fcs"
    ),
    IPTAL_KOSULU
  ],
  "emlak-danismanligi": [
    a(
      "HIZMET_KAPSAMI",
      "Hizmet kapsamı",
      "MULTI",
      [
        "Alım danışmanlığı",
        "Satış danışmanlığı",
        "Kiralama",
        "Portföy yönetimi"
      ],
      "fcs"
    ),
    a(
      "KOMISYON_ORANI",
      "Komisyon oranı",
      "SELECT",
      ["%1", "%2", "%3", "%4"],
      "fc"
    ),
    a("SOZLESME_SURESI_AY", "Sözleşme süresi", "NUM", "ay", "fc"),
    a(
      "GAYRIMENKUL_TIPI",
      "Gayrimenkul tipi",
      "MULTI",
      ["Konut", "İş yeri", "Arsa", "Turistik tesis"],
      "fcs"
    )
  ],
  "online-ekspertiz": [
    a(
      "EKSPERTIZ_TURU",
      "Ekspertiz türü",
      "SELECT",
      ["Konut değerleme", "Ticari değerleme", "Arsa değerleme"],
      "fcs"
    ),
    a("RAPOR_SURESI_SAAT", "Rapor teslim süresi", "NUM", "saat", "fc"),
    a("SPK_LISANSLI", "SPK lisanslı", "BOOL", null, "fc"),
    a("KESIF_DAHIL", "Yerinde keşif dâhil", "BOOL", null, "fc")
  ]
});

/* ── Yazılım, Yapay Zeka ve Dijital Araçlar ─────────────────────────────── */
Object.assign(FIELDS, {
  "web-barindirma": [
    a(
      "BARINDIRMA_TIPI",
      "Barındırma tipi",
      "SELECT",
      ["Paylaşımlı", "VDS/VPS", "Bulut", "Adanmış sunucu"],
      "fcs"
    ),
    a("DISK_GB", "Disk alanı", "NUM", "GB", "fcs"),
    a(
      "AYLIK_TRAFIK",
      "Aylık trafik",
      "SELECT",
      ["100 GB", "500 GB", "1 TB", "5 TB", "Sınırsız"],
      "fc"
    ),
    a(
      "CALISMA_SURESI",
      "Çalışma süresi taahhüdü",
      "SELECT",
      ["%99,5", "%99,9", "%99,95", "%99,99"],
      "fc"
    ),
    a(
      "YONETIM_PANELI",
      "Yönetim paneli",
      "SELECT",
      ["cPanel", "Plesk", "DirectAdmin", "Kendi paneli"],
      "fcs"
    ),
    a(
      "VERI_MERKEZI",
      "Veri merkezi",
      "SELECT",
      ["İstanbul", "Ankara", "Frankfurt", "Amsterdam", "Londra"],
      "fcs"
    ),
    DESTEK
  ],
  "sunucu-cozumleri": [
    a("VCPU", "İşlemci", "NUM", "vCPU", "fcs"),
    a("RAM_GB", "RAM", "NUM", "GB", "fcs"),
    a("DISK_GB", "Disk alanı", "NUM", "GB", "fcs"),
    a("DISK_TIPI", "Disk tipi", "SELECT", ["HDD", "SSD", "NVMe"], "fcs"),
    a("YEDEKLEME", "Yedekleme", "SELECT", ["Günlük", "Haftalık", "Yok"], "fc"),
    a(
      "VERI_MERKEZI",
      "Veri merkezi",
      "SELECT",
      ["İstanbul", "Ankara", "Frankfurt", "Amsterdam", "Londra"],
      "fcs"
    )
  ],
  "alan-adi": [
    a(
      "UZANTI",
      "Uzantı",
      "MULTI",
      [".com", ".com.tr", ".net", ".org", ".io", ".dev"],
      "fcs"
    ),
    a("TESCIL_SURESI_YIL", "Tescil süresi", "NUM", "yıl", "fc"),
    a("WHOIS_GIZLILIK", "WHOIS gizliliği", "BOOL", null, "fc"),
    a("DNS_YONETIMI", "DNS yönetimi", "BOOL", null, "fc")
  ],
  "ai-icerik": [
    ABONELIK_SURESI,
    KULLANICI_SAYISI,
    a(
      "AYLIK_KULLANIM",
      "Aylık kullanım",
      "SELECT",
      ["Sınırlı", "Genişletilmiş", "Sınırsıza yakın"],
      "fc"
    ),
    a(
      "MODEL_YETENEKLERI",
      "Yetenekler",
      "MULTI",
      ["Metin", "Görsel", "Ses", "Kod", "Çeviri"],
      "fcs"
    ),
    a("API_ERISIMI", "API erişimi", "BOOL", null, "fc"),
    a(
      "VERI_KULLANIMI",
      "Veri kullanımı",
      "SELECT",
      ["Eğitimde kullanılmaz", "Tercihe bağlı", "Eğitimde kullanılır"],
      "fc"
    )
  ],
  "ai-gorsel-video": [
    ABONELIK_SURESI,
    a("AYLIK_URETIM", "Aylık üretim hakkı", "NUM", "adet", "fcs"),
    a(
      "COZUNURLUK_CIKTI",
      "Çıktı çözünürlüğü",
      "SELECT",
      ["720p", "1080p", "2K", "4K"],
      "fcs"
    ),
    a("TICARI_KULLANIM", "Ticari kullanım hakkı", "BOOL", null, "fc"),
    a("FILIGRAN", "Filigransız çıktı", "BOOL", null, "fc")
  ],
  "is-otomasyonu": [
    ABONELIK_SURESI,
    KULLANICI_SAYISI,
    a("ENTEGRASYON_SAYISI", "Entegrasyon sayısı", "NUM", "adet", "fcs"),
    a("OTOMASYON_CALISMA", "Aylık çalıştırma hakkı", "NUM", "adet", "fc"),
    DESTEK
  ],
  "b2b-saas": [
    ABONELIK_SURESI,
    KULLANICI_SAYISI,
    a(
      "SAAS_ALANI",
      "Çözüm alanı",
      "SELECT",
      ["CRM", "ERP", "İK", "Muhasebe", "Proje yönetimi", "Çağrı merkezi"],
      "fcs"
    ),
    a("KVKK_UYUMU", "KVKK uyumu belgeli", "BOOL", null, "fc"),
    DESTEK
  ],
  vpn: [
    ABONELIK_SURESI,
    a("ESZAMANLI_CIHAZ", "Eş zamanlı cihaz", "NUM", "cihaz", "fcs"),
    a("SUNUCU_ULKE_SAYISI", "Sunucu ülke sayısı", "NUM", "ülke", "fc"),
    a("KAYIT_TUTMAMA", "Kayıt tutmama politikası", "BOOL", null, "fc"),
    PLATFORM
  ],
  "siber-guvenlik": [
    ABONELIK_SURESI,
    a(
      "GUVENLIK_KAPSAMI",
      "Kapsam",
      "MULTI",
      [
        "Uç nokta koruması",
        "Güvenlik duvarı",
        "Sızma testi",
        "SIEM",
        "E-posta güvenliği"
      ],
      "fcs"
    ),
    a("ESZAMANLI_CIHAZ", "Eş zamanlı cihaz", "NUM", "cihaz", "fcs"),
    DESTEK
  ],
  antivirus: [
    ABONELIK_SURESI,
    a("ESZAMANLI_CIHAZ", "Eş zamanlı cihaz", "NUM", "cihaz", "fcs"),
    a("GUVENLIK_DUVARI", "Güvenlik duvarı", "BOOL", null, "fc"),
    a(
      "VPN_DAHIL",
      "VPN dâhil",
      "SELECT",
      ["Sınırsız VPN", "Aylık 10 GB", "Yok"],
      "fc"
    ),
    PLATFORM
  ],
  "eticaret-altyapi": [
    ABONELIK_SURESI,
    a(
      "URUN_LIMITI",
      "Ürün limiti",
      "SELECT",
      ["100 ürün", "1.000 ürün", "10.000 ürün", "Sınırsız"],
      "fcs"
    ),
    a(
      "PAZARYERI_ENTEGRASYONU",
      "Pazaryeri entegrasyonu",
      "MULTI",
      ["Trendyol", "Hepsiburada", "Amazon", "N11", "Etsy"],
      "fcs"
    ),
    a(
      "ISLEM_KOMISYONU",
      "İşlem komisyonu",
      "SELECT",
      ["Yok", "%0,5", "%1", "%2"],
      "fc"
    ),
    DESTEK
  ],
  "sanal-pos": [
    a(
      "ISLEM_KOMISYONU",
      "İşlem komisyonu",
      "SELECT",
      ["Yok", "%0,5", "%1", "%2"],
      "fc"
    ),
    a(
      "TAKSIT_DESTEGI",
      "Taksit desteği",
      "SELECT",
      ["Taksitsiz", "9 taksit", "12 taksit"],
      "fc"
    ),
    a("ODEME_VADESI_GUN", "Ödeme vadesi", "NUM", "gün", "fcs"),
    a(
      "ENTEGRASYON",
      "Entegrasyon",
      "MULTI",
      ["API", "Hazır modül", "Ödeme linki", "Sanal terminal"],
      "fcs"
    )
  ]
});

/* ── Finans ve Kripto ───────────────────────────────────────────────────── */
Object.assign(FIELDS, {
  "kredi-kartlari": [
    a(
      "YILLIK_UCRET",
      "Yıllık ücret",
      "SELECT",
      ["Yok", "199 ₺", "450 ₺", "1.000 ₺ ve üzeri"],
      "fc"
    ),
    a(
      "PUAN_KAZANIMI",
      "Kazanç türü",
      "SELECT",
      ["Nakit iade", "Puan", "Mil", "İndirim çeki"],
      "fcs"
    ),
    a(
      "TAKSIT_DESTEGI",
      "Taksit desteği",
      "SELECT",
      ["Taksitsiz", "9 taksit", "12 taksit"],
      "fc"
    ),
    a(
      "KART_AYRICALIKLARI",
      "Ayrıcalıklar",
      "MULTI",
      ["Havalimanı lounge", "Seyahat sigortası", "Vale", "Sinema"],
      "fcs"
    ),
    a("TEMASSIZ", "Temassız ödeme", "BOOL", null, "c")
  ],
  "avantaj-puan": [
    a(
      "PROGRAM_TIPI",
      "Program tipi",
      "SELECT",
      ["Alışveriş puanı", "Akaryakıt", "Market", "Seyahat"],
      "fcs"
    ),
    a(
      "KAZANIM_ORANI",
      "Kazanım oranı",
      "SELECT",
      ["%1", "%2", "%3", "%5 ve üzeri"],
      "fc"
    ),
    a("PUAN_GECERLILIK_AY", "Puan geçerlilik süresi", "NUM", "ay", "fc"),
    a("UYELIK_UCRETI", "Üyelik ücreti", "SELECT", ["Ücretsiz", "Ücretli"], "fc")
  ],
  "kripto-borsalari": [
    a(
      "ISLEM_UCRETI",
      "İşlem ücreti",
      "SELECT",
      ["%0,05", "%0,10", "%0,20", "%0,30"],
      "fcs"
    ),
    a("COIN_SAYISI", "Coin sayısı", "NUM", "adet", "fcs"),
    a(
      "KALDIRAC",
      "Kaldıraç",
      "SELECT",
      ["Yok", "3x", "5x", "10x", "20x"],
      "fc"
    ),
    a("TL_YATIRMA", "TL ile işlem", "BOOL", null, "fc"),
    a(
      "SAKLAMA",
      "Saklama",
      "SELECT",
      ["Soğuk cüzdan", "Sıcak ve soğuk cüzdan"],
      "fc"
    )
  ],
  "dijital-cuzdan": [
    a(
      "PARA_YUKLEME",
      "Para yükleme yöntemi",
      "MULTI",
      ["Banka havalesi", "Kredi kartı", "Nakit noktası", "QR"],
      "fcs"
    ),
    a(
      "TRANSFER_UCRETI",
      "Transfer ücreti",
      "SELECT",
      ["Ücretsiz", "Sabit ücret", "Oransal ücret"],
      "fc"
    ),
    a("FIZIKSEL_KART", "Fiziksel kart", "BOOL", null, "fc"),
    PLATFORM
  ],
  "hisse-senedi": [
    a(
      "KOMISYON_HISSE",
      "Hisse komisyonu",
      "SELECT",
      ["Yok", "%0,05", "%0,10", "%0,20"],
      "fcs"
    ),
    a(
      "PIYASALAR",
      "Erişilen piyasalar",
      "MULTI",
      ["BIST", "ABD", "Avrupa", "Kripto", "Emtia"],
      "fcs"
    ),
    a(
      "EN_AZ_YATIRIM",
      "En az yatırım",
      "SELECT",
      ["100 ₺", "500 ₺", "1.000 ₺", "10.000 ₺"],
      "fc"
    ),
    a("KESIRLI_HISSE", "Kesirli hisse", "BOOL", null, "fc")
  ],
  forex: [
    a("SPREAD", "Spread", "SELECT", ["Sabit", "Değişken"], "fc"),
    a(
      "KALDIRAC",
      "Kaldıraç",
      "SELECT",
      ["Yok", "3x", "5x", "10x", "20x"],
      "fc"
    ),
    a(
      "EN_AZ_YATIRIM",
      "En az yatırım",
      "SELECT",
      ["100 ₺", "500 ₺", "1.000 ₺", "10.000 ₺"],
      "fc"
    ),
    a(
      "LISANS",
      "Lisans",
      "SELECT",
      ["SPK lisanslı", "Yurt dışı lisanslı"],
      "fc"
    )
  ],
  "mikro-yatirim": [
    a(
      "EN_AZ_YATIRIM",
      "En az yatırım",
      "SELECT",
      ["100 ₺", "500 ₺", "1.000 ₺", "10.000 ₺"],
      "fc"
    ),
    a("OTOMATIK_YATIRIM", "Otomatik yatırım", "BOOL", null, "fc"),
    a(
      "PORTFOY_TIPI",
      "Portföy tipi",
      "SELECT",
      ["Hazır portföy", "Serbest seçim", "Robo danışman"],
      "fcs"
    ),
    a(
      "YONETIM_UCRETI",
      "Yönetim ücreti",
      "SELECT",
      ["%0,50", "%0,95", "%1,45", "%1,90"],
      "fc"
    )
  ],
  bes: [
    a("DEVLET_KATKISI", "Devlet katkısı", "BOOL", null, "c"),
    a(
      "YONETIM_UCRETI",
      "Yönetim ücreti",
      "SELECT",
      ["%0,50", "%0,95", "%1,45", "%1,90"],
      "fc"
    ),
    a("FON_SECENEGI", "Fon seçeneği", "NUM", "adet", "fc"),
    a(
      "EN_AZ_KATKI_PAYI",
      "En az katkı payı",
      "SELECT",
      ["250 ₺", "500 ₺", "1.000 ₺"],
      "fc"
    )
  ],
  "fon-yonetimi": [
    a(
      "FON_TURU",
      "Fon türü",
      "SELECT",
      [
        "Hisse senedi",
        "Borçlanma araçları",
        "Serbest",
        "Karma",
        "Kıymetli maden"
      ],
      "fcs"
    ),
    a(
      "RISK_DEGERI",
      "Risk değeri",
      "SELECT",
      ["1", "2", "3", "4", "5", "6", "7"],
      "fc"
    ),
    a(
      "YONETIM_UCRETI",
      "Yönetim ücreti",
      "SELECT",
      ["%0,50", "%0,95", "%1,45", "%1,90"],
      "fc"
    ),
    a(
      "EN_AZ_YATIRIM",
      "En az yatırım",
      "SELECT",
      ["100 ₺", "500 ₺", "1.000 ₺", "10.000 ₺"],
      "fc"
    )
  ],
  "butce-planlama": [
    ABONELIK_SURESI,
    a("BANKA_BAGLANTISI", "Banka bağlantısı", "BOOL", null, "fc"),
    a("HESAP_SAYISI", "Bağlanabilen hesap", "NUM", "adet", "fc"),
    PLATFORM
  ],
  "kisisel-finans": [
    ABONELIK_SURESI,
    a(
      "FINANS_OZELLIKLERI",
      "Özellikler",
      "MULTI",
      [
        "Harcama takibi",
        "Bütçe",
        "Fatura hatırlatma",
        "Yatırım takibi",
        "Kredi notu"
      ],
      "fcs"
    ),
    a("BANKA_BAGLANTISI", "Banka bağlantısı", "BOOL", null, "fc"),
    PLATFORM
  ]
});

/* ── Sigorta Hizmetleri ─────────────────────────────────────────────────── */
Object.assign(FIELDS, {
  kasko: [
    a(
      "KASKO_TEMINATLARI",
      "Teminatlar",
      "MULTI",
      ["Çarpma", "Hırsızlık", "Doğal afet", "Cam kırılması", "Ferdi kaza"],
      "fcs"
    ),
    MUAFIYET,
    a(
      "ONARIM_YERI",
      "Onarım yeri",
      "SELECT",
      ["Yetkili servis", "Özel servis", "Serbest seçim"],
      "fc"
    ),
    a("IKAME_ARAC_GUN", "İkame araç", "NUM", "gün", "fc"),
    a("HASARSIZLIK_KORUMA", "Hasarsızlık indirimi korunur", "BOOL", null, "fc"),
    POLICE_SURESI,
    ODEME
  ],
  "trafik-sigortasi": [
    a(
      "MADDI_TEMINAT",
      "Maddi teminat",
      "SELECT",
      ["100.000 ₺", "200.000 ₺", "300.000 ₺"],
      "fc"
    ),
    a(
      "SAGLIK_TEMINATI",
      "Sağlık teminatı",
      "SELECT",
      ["1.000.000 ₺", "2.000.000 ₺", "3.000.000 ₺"],
      "fc"
    ),
    a(
      "BASAMAK",
      "Basamak",
      "SELECT",
      ["1. basamak", "2. basamak", "4. basamak", "7. basamak"],
      "fc"
    ),
    POLICE_SURESI,
    ODEME
  ],
  "tamamlayici-saglik": [
    a(
      "SAGLIK_KAPSAMI",
      "Kapsam",
      "SELECT",
      ["Yatarak tedavi", "Yatarak ve ayakta tedavi"],
      "fcs"
    ),
    a("ANLASMALI_KURUM", "Anlaşmalı kurum sayısı", "NUM", "kurum", "fcs"),
    a(
      "AYAKTA_LIMIT",
      "Ayakta tedavi limiti",
      "SELECT",
      ["5 kullanım", "10 kullanım", "Sınırsız"],
      "fc"
    ),
    a(
      "BEKLEME_SURESI",
      "Bekleme süresi",
      "SELECT",
      ["Yok", "3 ay", "6 ay", "12 ay"],
      "fc"
    ),
    POLICE_SURESI
  ],
  "hayat-sigortasi": [
    a(
      "TEMINAT_TUTARI",
      "Teminat tutarı",
      "SELECT",
      ["100.000 ₺", "250.000 ₺", "500.000 ₺", "1.000.000 ₺"],
      "fcs"
    ),
    a(
      "HAYAT_TEMINATLARI",
      "Ek teminatlar",
      "MULTI",
      ["Vefat", "Kaza sonucu vefat", "Maluliyet", "Kritik hastalık"],
      "fcs"
    ),
    a("BIRIKIM", "Birikimli", "BOOL", null, "fc"),
    POLICE_SURESI,
    ODEME
  ],
  "konut-sigortasi": [
    a(
      "BINA_BEDELI",
      "Bina bedeli",
      "SELECT",
      ["500.000 ₺", "1.000.000 ₺", "1.500.000 ₺", "3.000.000 ₺"],
      "fcs"
    ),
    a(
      "ESYA_BEDELI",
      "Eşya bedeli",
      "SELECT",
      ["100.000 ₺", "250.000 ₺", "500.000 ₺"],
      "fc"
    ),
    a(
      "KONUT_TEMINATLARI",
      "Teminatlar",
      "MULTI",
      ["Yangın", "Su baskını", "Hırsızlık", "Cam kırılması", "Deprem"],
      "fcs"
    ),
    MUAFIYET,
    POLICE_SURESI
  ],
  dask: [
    a(
      "SIGORTA_BEDELI",
      "Sigorta bedeli",
      "SELECT",
      ["640.000 ₺", "1.272.000 ₺", "1.908.000 ₺"],
      "fcs"
    ),
    a(
      "YAPI_TARZI",
      "Yapı tarzı",
      "SELECT",
      ["Betonarme", "Yığma", "Diğer"],
      "fcs"
    ),
    a(
      "BINA_YASI",
      "Bina yaşı",
      "SELECT",
      ["0 (sıfır)", "1-5", "6-10", "11-20", "21 ve üzeri"],
      "fc"
    ),
    a("BRUT_ALAN_M2", "Brüt alan", "NUM", "m²", "fcs"),
    POLICE_SURESI
  ],
  "seyahat-sigortasi": [
    a(
      "SEYAHAT_TEMINAT",
      "Teminat tutarı",
      "SELECT",
      ["30.000 €", "50.000 €", "100.000 €"],
      "fcs"
    ),
    a(
      "SEYAHAT_KAPSAMI",
      "Kapsam",
      "MULTI",
      ["Sağlık", "Bagaj", "Seyahat iptali", "Uçuş gecikmesi"],
      "fcs"
    ),
    BOLGE,
    a("SEYAHAT_GUN", "Seyahat süresi", "NUM", "gün", "fc")
  ],
  "vize-sigortasi": [
    a(
      "SEYAHAT_TEMINAT",
      "Teminat tutarı",
      "SELECT",
      ["30.000 €", "50.000 €", "100.000 €"],
      "fcs"
    ),
    a("SCHENGEN_UYUMLU", "Schengen uyumlu", "BOOL", null, "fc"),
    a("SEYAHAT_GUN", "Seyahat süresi", "NUM", "gün", "fc"),
    a("ANINDA_POLICE", "Anında poliçe", "BOOL", null, "fc")
  ],
  "pet-saglik": [
    a(
      "PET_TURU",
      "Evcil hayvan türü",
      "SELECT",
      ["Kedi", "Köpek", "Kuş", "Diğer"],
      "fcs"
    ),
    a(
      "PET_TEMINATLARI",
      "Teminatlar",
      "MULTI",
      ["Muayene", "Ameliyat", "Aşı", "Üçüncü şahıs sorumluluk"],
      "fcs"
    ),
    a(
      "YILLIK_LIMIT",
      "Yıllık limit",
      "SELECT",
      ["10.000 ₺", "25.000 ₺", "50.000 ₺"],
      "fc"
    ),
    POLICE_SURESI
  ],
  "isyeri-sigortasi": [
    a(
      "BINA_BEDELI",
      "Bina bedeli",
      "SELECT",
      ["500.000 ₺", "1.000.000 ₺", "1.500.000 ₺", "3.000.000 ₺"],
      "fcs"
    ),
    a(
      "EMTIA_BEDELI",
      "Emtia bedeli",
      "SELECT",
      ["250.000 ₺", "500.000 ₺", "900.000 ₺"],
      "fc"
    ),
    a(
      "KONUT_TEMINATLARI",
      "Teminatlar",
      "MULTI",
      ["Yangın", "Su baskını", "Hırsızlık", "Cam kırılması", "Deprem"],
      "fcs"
    ),
    MUAFIYET,
    POLICE_SURESI
  ]
});

/* ── Eğitim ve Çevrimiçi Gelişim ────────────────────────────────────────── */
Object.assign(FIELDS, {
  "yazilim-kodlama": [
    SEVIYE,
    SURE_SAAT,
    a(
      "KODLAMA_ALANI",
      "Alan",
      "SELECT",
      [
        "Web geliştirme",
        "Mobil",
        "Veri bilimi",
        "Oyun",
        "DevOps",
        "Yapay zekâ"
      ],
      "fcs"
    ),
    a("PROJE_SAYISI", "Uygulama projesi", "NUM", "adet", "fc"),
    ERISIM_SURESI,
    EGITIM_DILI,
    SERTIFIKA
  ],
  "tasarim-egitimleri": [
    SEVIYE,
    SURE_SAAT,
    a(
      "TASARIM_ALANI",
      "Alan",
      "SELECT",
      ["Grafik tasarım", "UI/UX", "3B modelleme", "Motion", "İç mimari"],
      "fcs"
    ),
    a(
      "YAZILIM_ARACI",
      "Kullanılan araç",
      "MULTI",
      ["Figma", "Photoshop", "Illustrator", "Blender", "After Effects"],
      "fcs"
    ),
    ERISIM_SURESI,
    SERTIFIKA
  ],
  "teknoloji-kurslari": [
    SEVIYE,
    SURE_SAAT,
    EGITIM_FORMATI,
    ERISIM_SURESI,
    EGITIM_DILI,
    SERTIFIKA
  ],
  "dijital-pazarlama": [
    SEVIYE,
    SURE_SAAT,
    a(
      "PAZARLAMA_ALANI",
      "Alan",
      "MULTI",
      ["SEO", "Google Ads", "Sosyal medya", "E-posta pazarlama", "Analitik"],
      "fcs"
    ),
    ERISIM_SURESI,
    SERTIFIKA
  ],
  "eticaret-egitimleri": [
    SEVIYE,
    SURE_SAAT,
    a(
      "ETICARET_ALANI",
      "Alan",
      "MULTI",
      [
        "Pazaryeri",
        "Kendi mağazan",
        "Dropshipping",
        "Yurt dışı satış",
        "Lojistik"
      ],
      "fcs"
    ),
    ERISIM_SURESI,
    SERTIFIKA
  ],
  "dil-ogrenme": [
    a(
      "DIL",
      "Dil",
      "SELECT",
      ["İngilizce", "Almanca", "Fransızca", "İspanyolca", "Rusça", "Arapça"],
      "fcs"
    ),
    a("DIL_SEVIYESI", "Seviye", "SELECT", ["A1-A2", "B1-B2", "C1-C2"], "fcs"),
    a(
      "DERS_TIPI",
      "Ders tipi",
      "SELECT",
      ["Birebir", "Grup", "Uygulama içi", "Karma"],
      "fc"
    ),
    a("HAFTALIK_DERS", "Haftalık ders", "NUM", "ders", "fc"),
    a(
      "EGITMEN_TIPI",
      "Eğitmen",
      "SELECT",
      ["Ana dili konuşan", "Yerli eğitmen", "Yapay zekâ destekli"],
      "fc"
    ),
    SERTIFIKA
  ],
  "sertifika-programlari": [
    a(
      "SERTIFIKA_ALANI",
      "Alan",
      "SELECT",
      [
        "Proje yönetimi",
        "Veri analizi",
        "Dijital pazarlama",
        "Finans",
        "İnsan kaynakları"
      ],
      "fcs"
    ),
    a("PROGRAM_SURESI_HAFTA", "Program süresi", "NUM", "hafta", "fcs"),
    EGITIM_FORMATI,
    a(
      "SERTIFIKA_VEREN",
      "Sertifikayı veren",
      "SELECT",
      ["Üniversite", "Meslek kuruluşu", "Kurum", "Uluslararası kuruluş"],
      "fcs"
    ),
    a("SINAV_VAR", "Sınav var", "BOOL", null, "fc")
  ],
  "kariyer-gelisimi": [
    a(
      "KARIYER_HIZMETI",
      "Hizmet",
      "MULTI",
      ["CV hazırlama", "Mülakat koçluğu", "LinkedIn", "Kariyer planı"],
      "fcs"
    ),
    a("SEANS_SAYISI", "Seans sayısı", "NUM", "seans", "fc"),
    EGITIM_FORMATI,
    SEVIYE
  ],
  "cocuk-egitimleri": [
    a(
      "YAS_ARALIGI",
      "Yaş aralığı",
      "SELECT",
      ["4-6", "7-9", "10-12", "13-15", "16-18"],
      "fcs"
    ),
    a(
      "COCUK_ALANI",
      "Alan",
      "SELECT",
      ["Kodlama", "Matematik", "Yabancı dil", "Robotik", "Müzik", "Resim"],
      "fcs"
    ),
    a("HAFTALIK_DERS", "Haftalık ders", "NUM", "ders", "fc"),
    EGITIM_FORMATI,
    a("VELI_TAKIBI", "Veli takip paneli", "BOOL", null, "fc")
  ]
});

/* ── Sağlık, Kozmetik ve Kişisel Bakım ──────────────────────────────────── */
Object.assign(FIELDS, {
  vitaminler: [
    a(
      "ETKEN_MADDE",
      "Etken madde",
      "SELECT",
      [
        "D vitamini",
        "B12",
        "C vitamini",
        "Magnezyum",
        "Çinko",
        "Demir",
        "Omega-3"
      ],
      "fcs"
    ),
    a(
      "FORM",
      "Form",
      "SELECT",
      ["Tablet", "Kapsül", "Damla", "Toz", "Sprey", "Gummy"],
      "fcs"
    ),
    a("DOZ", "Doz", "TEXT", null, "s"),
    KULLANIM_SURESI_GUN,
    a(
      "KATKI_BILGISI",
      "Katkı bilgisi",
      "MULTI",
      ["Şekersiz", "Glutensiz", "Vegan", "Laktozsuz", "Helal"],
      "fcs"
    )
  ],
  "besin-takviyeleri": [
    a(
      "TAKVIYE_AMACI",
      "Amaç",
      "SELECT",
      ["Bağışıklık", "Enerji", "Uyku", "Sindirim", "Eklem", "Saç ve cilt"],
      "fcs"
    ),
    a(
      "FORM",
      "Form",
      "SELECT",
      ["Tablet", "Kapsül", "Damla", "Toz", "Sprey", "Gummy"],
      "fcs"
    ),
    KULLANIM_SURESI_GUN,
    a(
      "KATKI_BILGISI",
      "Katkı bilgisi",
      "MULTI",
      ["Şekersiz", "Glutensiz", "Vegan", "Laktozsuz", "Helal"],
      "fcs"
    )
  ],
  "sporcu-beslenmesi": [
    a(
      "SPOR_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Whey protein", "Kazein", "Kreatin", "BCAA", "Gainer", "Pre-workout"],
      "fcs"
    ),
    a("PORSIYON_PROTEIN_G", "Porsiyon başına protein", "NUM", "g", "fcs"),
    a("NET_AGIRLIK_G", "Net ağırlık", "NUM", "g", "fc"),
    a(
      "AROMA",
      "Aroma",
      "SELECT",
      ["Çikolata", "Vanilya", "Çilek", "Muz", "Aromasız"],
      "fc"
    ),
    a(
      "KATKI_BILGISI",
      "Katkı bilgisi",
      "MULTI",
      ["Şekersiz", "Glutensiz", "Vegan", "Laktozsuz", "Helal"],
      "fcs"
    )
  ],
  "cilt-bakimi": [
    CILT_TIPI,
    a(
      "BAKIM_ETKEN_MADDE",
      "Etken madde",
      "MULTI",
      [
        "Hyaluronik asit",
        "Niasinamid",
        "Retinol",
        "C vitamini",
        "Salisilik asit",
        "Peptit"
      ],
      "fcs"
    ),
    a(
      "URUN_DOKUSU",
      "Doku",
      "SELECT",
      ["Serum", "Krem", "Jel", "Losyon", "Yağ", "Maske"],
      "fcs"
    ),
    HACIM_ML,
    a(
      "SPF",
      "Güneş koruma faktörü",
      "SELECT",
      ["SPF 15", "SPF 30", "SPF 50", "Yok"],
      "fc"
    ),
    a("PARFUM_ICERIR", "Parfüm içerir", "BOOL", null, "fc")
  ],
  "yuz-bakimi": [
    CILT_TIPI,
    a(
      "YUZ_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Temizleyici", "Tonik", "Nemlendirici", "Göz kremi", "Peeling", "Maske"],
      "fcs"
    ),
    a(
      "BAKIM_ETKEN_MADDE",
      "Etken madde",
      "MULTI",
      [
        "Hyaluronik asit",
        "Niasinamid",
        "Retinol",
        "C vitamini",
        "Salisilik asit",
        "Peptit"
      ],
      "fcs"
    ),
    HACIM_ML,
    a(
      "KULLANIM_ZAMANI",
      "Kullanım zamanı",
      "SELECT",
      ["Sabah", "Akşam", "Sabah ve akşam"],
      "fc"
    )
  ],
  "anti-aging": [
    CILT_TIPI,
    a(
      "BAKIM_ETKEN_MADDE",
      "Etken madde",
      "MULTI",
      [
        "Hyaluronik asit",
        "Niasinamid",
        "Retinol",
        "C vitamini",
        "Salisilik asit",
        "Peptit"
      ],
      "fcs"
    ),
    a(
      "HEDEF_ETKI",
      "Hedef etki",
      "MULTI",
      ["Kırışıklık", "Sıkılaşma", "Leke", "Dolgunluk"],
      "fcs"
    ),
    HACIM_ML,
    a(
      "KULLANIM_ZAMANI",
      "Kullanım zamanı",
      "SELECT",
      ["Sabah", "Akşam", "Sabah ve akşam"],
      "fc"
    )
  ],
  parfum: [
    a(
      "KOKU_AILESI",
      "Koku ailesi",
      "SELECT",
      ["Odunsu", "Çiçeksi", "Oryantal", "Ferah", "Fujer", "Gurme"],
      "fcs"
    ),
    a(
      "KONSANTRASYON",
      "Konsantrasyon",
      "SELECT",
      ["EDC", "EDT", "EDP", "Parfum"],
      "fcs"
    ),
    a(
      "KALICILIK",
      "Kalıcılık",
      "SELECT",
      ["4-6 saat", "6-8 saat", "8 saat ve üzeri"],
      "fc"
    ),
    HACIM_ML,
    a("CINSIYET", "Cinsiyet", "SELECT", ["Kadın", "Erkek", "Unisex"], "fcs")
  ],
  deodorant: [
    a(
      "DEO_FORM",
      "Form",
      "SELECT",
      ["Sprey", "Roll-on", "Stick", "Krem"],
      "fcs"
    ),
    a("ALUMINYUM_ICERMEZ", "Alüminyum içermez", "BOOL", null, "fc"),
    a("KORUMA_SURESI_SAAT", "Koruma süresi", "NUM", "saat", "fc"),
    HACIM_ML,
    a("CINSIYET", "Cinsiyet", "SELECT", ["Kadın", "Erkek", "Unisex"], "fcs")
  ],
  "sac-bakimi": [
    a(
      "SAC_TIPI",
      "Saç tipi",
      "SELECT",
      ["Kuru", "Yağlı", "Boyalı", "Kıvırcık", "İnce telli", "Normal"],
      "fcs"
    ),
    a(
      "SAC_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Şampuan", "Saç kremi", "Maske", "Serum", "Sprey"],
      "fcs"
    ),
    a(
      "SAC_HEDEF",
      "Hedef",
      "MULTI",
      ["Dökülme karşıtı", "Kepek karşıtı", "Nem", "Hacim", "Onarım"],
      "fcs"
    ),
    HACIM_ML,
    a("SULFATSIZ", "Sülfatsız", "BOOL", null, "fc")
  ],
  "sac-sekillendirici": [
    a(
      "SEKILLENDIRICI_TIPI",
      "Cihaz tipi",
      "SELECT",
      ["Saç kurutma", "Düzleştirici", "Maşa", "Çok fonksiyonlu"],
      "fcs"
    ),
    a("GUC_W", "Güç", "NUM", "W", "fc"),
    a(
      "ISI_AYARI",
      "Isı ayarı",
      "SELECT",
      ["Tek kademe", "2 kademe", "3 kademe", "Dijital ayar"],
      "fc"
    ),
    a(
      "PLAKA_KAPLAMA",
      "Plaka kaplaması",
      "SELECT",
      ["Seramik", "Turmalin", "Titanyum"],
      "fc"
    ),
    GARANTI
  ],
  "diyet-programlari": [
    a(
      "DIYET_TIPI",
      "Program tipi",
      "SELECT",
      ["Kilo verme", "Kilo alma", "Sporcu", "Vegan", "Gluten içermeyen"],
      "fcs"
    ),
    a("PROGRAM_SURESI_HAFTA", "Program süresi", "NUM", "hafta", "fcs"),
    a(
      "DIYETISYEN_GORUSMESI",
      "Diyetisyen görüşmesi",
      "SELECT",
      ["Yok", "Haftalık", "İki haftada bir", "Aylık"],
      "fc"
    ),
    a("MENU_KISISELLESTIRME", "Kişiye özel menü", "BOOL", null, "fc")
  ],
  "fitness-uygulamalari": [
    ABONELIK_SURESI,
    a(
      "ANTRENMAN_TIPI",
      "Antrenman tipi",
      "MULTI",
      ["Kardiyo", "Kuvvet", "Yoga", "Pilates", "HIIT", "Koşu"],
      "fcs"
    ),
    a(
      "CIHAZ_SENKRONU",
      "Cihaz senkronizasyonu",
      "MULTI",
      ["Apple Health", "Google Fit", "Garmin", "Fitbit"],
      "fcs"
    ),
    a("CEVRIMDISI_KULLANIM", "Çevrim dışı kullanım", "BOOL", null, "fc"),
    PLATFORM
  ],
  "kilo-kontrolu": [
    a("PROGRAM_SURESI_HAFTA", "Program süresi", "NUM", "hafta", "fcs"),
    a(
      "TAKIP_YONTEMI",
      "Takip yöntemi",
      "MULTI",
      ["Uygulama", "Diyetisyen", "Grup", "Ölçüm cihazı"],
      "fcs"
    ),
    a(
      "DIYETISYEN_GORUSMESI",
      "Diyetisyen görüşmesi",
      "SELECT",
      ["Yok", "Haftalık", "İki haftada bir", "Aylık"],
      "fc"
    ),
    a("MENU_KISISELLESTIRME", "Kişiye özel menü", "BOOL", null, "fc")
  ]
});

/* ── Oyun ve E-spor ─────────────────────────────────────────────────────── */
Object.assign(FIELDS, {
  "dijital-oyun": [
    a(
      "OYUN_TURU",
      "Tür",
      "SELECT",
      [
        "Aksiyon",
        "Macera",
        "Yarış",
        "Strateji",
        "Spor",
        "Rol yapma",
        "Simülasyon"
      ],
      "fcs"
    ),
    a(
      "OYUN_PLATFORMU",
      "Platform",
      "SELECT",
      [
        "PC (Steam)",
        "PC (Epic)",
        "PlayStation 5",
        "Xbox Series",
        "Nintendo Switch"
      ],
      "fcs"
    ),
    a(
      "OYUN_SURUMU",
      "Sürüm",
      "SELECT",
      ["Standart", "Deluxe", "Ultimate", "Sezon geçişi"],
      "fc"
    ),
    a(
      "COK_OYUNCULU",
      "Çok oyunculu",
      "SELECT",
      ["Tek oyunculu", "Çevrim içi çok oyunculu", "İkisi de"],
      "fcs"
    ),
    a(
      "TURKCE_DESTEK",
      "Türkçe desteği",
      "SELECT",
      ["Türkçe altyazı", "Türkçe seslendirme", "Yok"],
      "fcs"
    ),
    TESLIM_BICIMI,
    YAS_SINIRI
  ],
  "oyun-abonelikleri": [
    ABONELIK_SURESI,
    a(
      "OYUN_PLATFORMU",
      "Platform",
      "SELECT",
      [
        "PC (Steam)",
        "PC (Epic)",
        "PlayStation 5",
        "Xbox Series",
        "Nintendo Switch"
      ],
      "fcs"
    ),
    a("KATALOG_BUYUKLUGU", "Katalog büyüklüğü", "NUM", "oyun", "fcs"),
    a("BULUT_OYUN", "Bulut oyun", "BOOL", null, "fc"),
    BOLGE
  ],
  "oyun-ici-satin-alim": [
    a("PAKET_MIKTARI", "Paket miktarı", "TEXT", null, "s"),
    a("BONUS_ORANI", "Bonus", "SELECT", ["%0", "%10", "%25", "%50"], "fc"),
    a(
      "TESLIM_SURESI",
      "Teslim süresi",
      "SELECT",
      ["Anında", "5 dakika", "1 saat", "24 saat"],
      "fc"
    ),
    TESLIM_BICIMI,
    BOLGE
  ],
  "oyuncu-kulakliklari": [
    a(
      "KULAKLIK_TIPI",
      "Kulaklık tipi",
      "SELECT",
      ["Kulak içi", "Kulak üstü", "Kulak çevreleyen", "Kemik iletimli"],
      "fcs"
    ),
    BAGLANTI,
    a("SURUCU_MM", "Sürücü çapı", "NUM", "mm", "fc"),
    a(
      "SES_SISTEMI",
      "Ses sistemi",
      "SELECT",
      ["Stereo", "7.1 sanal", "Uzamsal ses"],
      "fcs"
    ),
    a("MIKROFON", "Mikrofon", "BOOL", null, "fc"),
    GARANTI
  ],
  "oyuncu-klavyeleri": [
    a(
      "KLAVYE_TIPI",
      "Klavye tipi",
      "SELECT",
      ["Mekanik", "Membran", "Optik", "Hall effect"],
      "fcs"
    ),
    a(
      "SWITCH",
      "Switch",
      "SELECT",
      ["Kırmızı", "Mavi", "Kahverengi", "Gümüş"],
      "fcs"
    ),
    a(
      "KLAVYE_BOYUTU",
      "Boyut",
      "SELECT",
      ["Tam boy", "TKL", "%75", "%60"],
      "fcs"
    ),
    BAGLANTI,
    a("AYDINLATMA", "Aydınlatma", "SELECT", ["RGB", "Tek renk", "Yok"], "fc"),
    GARANTI
  ],
  "oyuncu-mouselari": [
    a("DPI", "Hassasiyet", "NUM", "DPI", "fcs"),
    BAGLANTI,
    a("TUS_SAYISI", "Tuş sayısı", "NUM", "tuş", "fc"),
    AGIRLIK_G,
    a("AYDINLATMA", "Aydınlatma", "SELECT", ["RGB", "Tek renk", "Yok"], "fc"),
    GARANTI
  ],
  "oyun-konsollari": [
    a(
      "KONSOL_NESLI",
      "Konsol",
      "SELECT",
      [
        "PlayStation 5",
        "Xbox Series X",
        "Xbox Series S",
        "Nintendo Switch",
        "Steam Deck"
      ],
      "fcs"
    ),
    DEPOLAMA,
    a(
      "OYUN_COZUNURLUGU",
      "Çözünürlük",
      "SELECT",
      ["1080p", "1440p", "4K 60 fps", "4K 120 fps"],
      "fcs"
    ),
    a(
      "KUTU_ICERIGI",
      "Kutu içeriği",
      "MULTI",
      ["Konsol", "Kumanda", "HDMI kablo", "Şarj istasyonu", "Oyun"],
      "fcs"
    ),
    GARANTI
  ],
  "konsol-aksesuarlari": [
    a(
      "KONSOL_AKSESUAR_TIPI",
      "Aksesuar tipi",
      "SELECT",
      ["Kumanda", "Şarj istasyonu", "Direksiyon", "Kulaklık", "Taşıma çantası"],
      "fcs"
    ),
    a(
      "UYUMLU_KONSOL",
      "Uyumlu konsol",
      "MULTI",
      ["PlayStation 5", "Xbox Series", "Nintendo Switch", "PC"],
      "fcs"
    ),
    BAGLANTI,
    GARANTI
  ],
  "espor-platformlari": [
    ABONELIK_SURESI,
    a(
      "ESPOR_OYUNLARI",
      "Desteklenen oyunlar",
      "MULTI",
      ["CS2", "Valorant", "League of Legends", "Dota 2", "FIFA"],
      "fcs"
    ),
    a(
      "TURNUVA_SIKLIGI",
      "Turnuva sıklığı",
      "SELECT",
      ["Günlük", "Haftalık", "Aylık"],
      "fc"
    ),
    a("ODUL_HAVUZU", "Ödül havuzu var", "BOOL", null, "fc")
  ],
  igaming: [
    a(
      "LISANS_ULKE",
      "Lisans",
      "SELECT",
      ["Malta", "Curaçao", "Birleşik Krallık", "Yurt içi"],
      "fcs"
    ),
    a(
      "SORUMLU_OYUN",
      "Sorumlu oyun araçları",
      "MULTI",
      ["Kayıp limiti", "Süre limiti", "Kendini dışlama", "Gerçeklik kontrolü"],
      "fcs"
    ),
    a("YAS_DOGRULAMA", "Yaş doğrulaması", "BOOL", null, "fc"),
    YAS_SINIRI
  ],
  "yayinci-ekipmanlari": [
    a(
      "YAYIN_EKIPMAN_TIPI",
      "Ekipman tipi",
      "SELECT",
      ["Mikrofon", "Kamera", "Işık", "Yakalama kartı", "Yeşil perde"],
      "fcs"
    ),
    BAGLANTI,
    a(
      "COZUNURLUK_CIKTI",
      "Çıktı çözünürlüğü",
      "SELECT",
      ["720p", "1080p", "2K", "4K"],
      "fcs"
    ),
    a(
      "KUTU_ICERIGI",
      "Kutu içeriği",
      "MULTI",
      ["Konsol", "Kumanda", "HDMI kablo", "Şarj istasyonu", "Oyun"],
      "fcs"
    ),
    GARANTI
  ]
});

/* ── Ev, Yaşam ve Bahçe ─────────────────────────────────────────────────── */
Object.assign(FIELDS, {
  "robot-supurge": [
    a("EMIS_GUCU_PA", "Emiş gücü", "NUM", "Pa", "fcs"),
    a("CALISMA_SURESI_DK", "Çalışma süresi", "NUM", "dk", "fc"),
    a(
      "HARITALAMA",
      "Haritalama",
      "SELECT",
      ["Yok", "Jiroskop", "LIDAR", "Kamera + LIDAR"],
      "fcs"
    ),
    a("PASPAS_OZELLIGI", "Paspas özelliği", "BOOL", null, "fc"),
    a("TOZ_TOPLAMA_ISTASYONU", "Toz toplama istasyonu", "BOOL", null, "fc"),
    a("HAZNE_L", "Hazne", "NUM", "L", "c"),
    GARANTI
  ],
  "kucuk-ev-aletleri": [
    a(
      "KUCUK_ALET_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Blender",
        "Kahve makinesi",
        "Air fryer",
        "Ütü",
        "Tost makinesi",
        "Su ısıtıcı"
      ],
      "fcs"
    ),
    a("GUC_W", "Güç", "NUM", "W", "fc"),
    a("HAZNE_L", "Hazne", "NUM", "L", "c"),
    RENK,
    GARANTI
  ],
  "akilli-ev": [
    a(
      "AKILLI_CIHAZ_TIPI",
      "Cihaz tipi",
      "SELECT",
      ["Akıllı priz", "Ampul", "Termostat", "Kilit", "Sensör", "Asistan"],
      "fcs"
    ),
    a(
      "EKOSISTEM",
      "Ekosistem",
      "MULTI",
      [
        "Google Home",
        "Apple HomeKit",
        "Amazon Alexa",
        "Matter",
        "Kendi uygulaması"
      ],
      "fcs"
    ),
    a(
      "BAGLANTI_PROTOKOLU",
      "Bağlantı protokolü",
      "SELECT",
      ["Wi-Fi", "Zigbee", "Z-Wave", "Bluetooth", "Thread"],
      "fcs"
    ),
    KURULUM,
    GARANTI
  ],
  "guvenlik-kameralari": [
    a(
      "COZUNURLUK_CIKTI",
      "Çıktı çözünürlüğü",
      "SELECT",
      ["720p", "1080p", "2K", "4K"],
      "fcs"
    ),
    a(
      "KAMERA_KONUMU",
      "Konum",
      "SELECT",
      ["İç mekân", "Dış mekân", "İç ve dış mekân"],
      "fcs"
    ),
    a(
      "GECE_GORUSU",
      "Gece görüşü",
      "SELECT",
      ["Yok", "Kızılötesi", "Renkli gece görüşü"],
      "fc"
    ),
    a(
      "KAYIT_ORTAMI",
      "Kayıt ortamı",
      "MULTI",
      ["microSD", "NVR", "Bulut"],
      "fcs"
    ),
    a("HAREKET_ALGILAMA", "Hareket algılama", "BOOL", null, "fc"),
    GARANTI
  ],
  "beyaz-esya": [
    a(
      "BEYAZ_ESYA_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Çamaşır makinesi",
        "Bulaşık makinesi",
        "Buzdolabı",
        "Kurutma makinesi",
        "Fırın"
      ],
      "fcs"
    ),
    a("KAPASITE", "Kapasite", "TEXT", null, "s"),
    ENERJI_SINIFI,
    a("GURULTU_DB", "Gürültü", "NUM", "dB", "c"),
    a("PROGRAM_SAYISI", "Program sayısı", "NUM", "program", "fc"),
    RENK,
    GARANTI
  ],
  ankastre: [
    a(
      "ANKASTRE_ICERIK",
      "Set içeriği",
      "MULTI",
      ["Fırın", "Ocak", "Davlumbaz", "Mikrodalga", "Bulaşık makinesi"],
      "fcs"
    ),
    a(
      "OCAK_TIPI",
      "Ocak tipi",
      "SELECT",
      ["Gazlı", "Elektrikli", "İndüksiyon", "Vitroseramik"],
      "fcs"
    ),
    ENERJI_SINIFI,
    RENK,
    KURULUM,
    GARANTI
  ],
  "oturma-odasi": [
    a(
      "MOBILYA_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Koltuk takımı", "Kanepe", "TV ünitesi", "Sehpa", "Berjer"],
      "fcs"
    ),
    a("OTURMA_KAPASITESI", "Oturma kapasitesi", "NUM", "kişi", "fc"),
    MALZEME,
    a(
      "KUMAS",
      "Kumaş",
      "SELECT",
      ["Keten", "Kadife", "Suni deri", "Hakiki deri", "Chenille"],
      "fc"
    ),
    a("YATAKLI", "Yatak olabilen", "BOOL", null, "fc"),
    KURULUM,
    GARANTI
  ],
  "yatak-odasi": [
    a(
      "YATAK_ODASI_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Yatak odası takımı", "Karyola", "Gardırop", "Şifonyer", "Yatak"],
      "fcs"
    ),
    a(
      "YATAK_OLCUSU",
      "Yatak ölçüsü",
      "SELECT",
      ["90×190", "120×200", "140×190", "160×200", "180×200"],
      "fcs"
    ),
    MALZEME,
    KURULUM,
    GARANTI
  ],
  dekorasyon: [
    a(
      "DEKOR_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Halı", "Perde", "Tablo", "Ayna", "Aydınlatma", "Kırlent"],
      "fcs"
    ),
    a("OLCU", "Ölçüler", "TEXT", null, "s"),
    MALZEME,
    RENK
  ],
  ergonomi: [
    a(
      "ERGONOMI_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Çalışma koltuğu",
        "Yükseklik ayarlı masa",
        "Monitör standı",
        "Ayak desteği"
      ],
      "fcs"
    ),
    a(
      "AYARLANABILIR_PARCA",
      "Ayarlanabilir bölümler",
      "MULTI",
      ["Yükseklik", "Kol dayama", "Bel desteği", "Baş desteği", "Eğim"],
      "fcs"
    ),
    a("TASIMA_KAPASITESI_KG", "Taşıma kapasitesi", "NUM", "kg", "fc"),
    MALZEME,
    GARANTI
  ],
  "evcil-mama": [
    a(
      "PET_TURU",
      "Evcil hayvan türü",
      "SELECT",
      ["Kedi", "Köpek", "Kuş", "Diğer"],
      "fcs"
    ),
    a(
      "MAMA_TIPI",
      "Mama tipi",
      "SELECT",
      ["Kuru mama", "Yaş mama", "Ödül maması", "Veteriner diyet"],
      "fcs"
    ),
    a(
      "YAS_GRUBU",
      "Yaş grubu",
      "SELECT",
      ["Yavru", "Yetişkin", "Yaşlı"],
      "fcs"
    ),
    a("NET_AGIRLIK_KG", "Net ağırlık", "NUM", "kg", "fcs"),
    a("TAHILSIZ", "Tahılsız", "BOOL", null, "fc")
  ],
  "evcil-aksesuar": [
    a(
      "PET_TURU",
      "Evcil hayvan türü",
      "SELECT",
      ["Kedi", "Köpek", "Kuş", "Diğer"],
      "fcs"
    ),
    a(
      "PET_AKSESUAR_TIPI",
      "Aksesuar tipi",
      "SELECT",
      ["Tasma", "Taşıma çantası", "Yatak", "Oyuncak", "Kum kabı", "Tırmalama"],
      "fcs"
    ),
    a("OLCU", "Ölçüler", "TEXT", null, "s"),
    MALZEME
  ],
  "el-aletleri": [
    a(
      "ALET_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Matkap", "Vidalama", "Taşlama", "Testere", "Çim biçme", "Alet seti"],
      "fcs"
    ),
    a("GUC_W", "Güç", "NUM", "W", "fc"),
    a("BATARYA_AH", "Batarya", "NUM", "Ah", "fc"),
    a("TORK_NM", "Tork", "NUM", "Nm", "fc"),
    a("KABLOSUZ", "Kablosuz", "BOOL", null, "fc"),
    GARANTI
  ]
});

/* ── Seyahat, Turizm ve Outdoor ─────────────────────────────────────────── */
Object.assign(FIELDS, {
  "ucak-bileti": [
    a("KALKIS_SEHRI", "Kalkış", "TEXT", null, "s"),
    a("VARIS_SEHRI", "Varış", "TEXT", null, "s"),
    a(
      "AKTARMA",
      "Aktarma",
      "SELECT",
      ["Direkt", "1 aktarmalı", "2 ve üzeri aktarmalı"],
      "fcs"
    ),
    a(
      "KABIN_SINIFI",
      "Kabin",
      "SELECT",
      ["Ekonomi", "Premium ekonomi", "Business", "First"],
      "fcs"
    ),
    a("KABIN_BAGAJI_KG", "Kabin bagajı", "NUM", "kg", "fc"),
    a("BAGAJ_HAKKI_KG", "Bagaj hakkı", "NUM", "kg", "fcs"),
    a(
      "DEGISIKLIK_HAKKI",
      "Değişiklik hakkı",
      "SELECT",
      ["Ücretsiz", "Ücretli", "Yapılamaz"],
      "fc"
    )
  ],
  "otobus-bileti": [
    a("KALKIS_SEHRI", "Kalkış", "TEXT", null, "s"),
    a("VARIS_SEHRI", "Varış", "TEXT", null, "s"),
    a("KOLTUK_DUZENI", "Koltuk düzeni", "SELECT", ["2+1", "2+2"], "fcs"),
    a("SEYAHAT_SURESI_SAAT", "Seyahat süresi", "NUM", "saat", "fc"),
    a(
      "OTOBUS_OLANAKLARI",
      "Olanaklar",
      "MULTI",
      ["Wi-Fi", "Ekran", "Priz", "İkram", "Tuvalet"],
      "fcs"
    )
  ],
  "tren-bileti": [
    a("KALKIS_SEHRI", "Kalkış", "TEXT", null, "s"),
    a("VARIS_SEHRI", "Varış", "TEXT", null, "s"),
    a(
      "TREN_TIPI",
      "Tren tipi",
      "SELECT",
      ["Yüksek hızlı tren", "Ana hat", "Bölgesel"],
      "fcs"
    ),
    a(
      "VAGON_SINIFI",
      "Vagon sınıfı",
      "SELECT",
      ["Ekonomi", "Business", "Yataklı"],
      "fcs"
    ),
    a("SEYAHAT_SURESI_SAAT", "Seyahat süresi", "NUM", "saat", "fc")
  ],
  "otel-rezervasyonu": [
    a(
      "KONSEPT",
      "Konsept",
      "SELECT",
      [
        "Sadece oda",
        "Oda kahvaltı",
        "Yarım pansiyon",
        "Tam pansiyon",
        "Her şey dâhil",
        "Ultra her şey dâhil"
      ],
      "fcs"
    ),
    a(
      "YILDIZ",
      "Yıldız",
      "SELECT",
      ["2 yıldız", "3 yıldız", "4 yıldız", "5 yıldız", "Butik"],
      "fcs"
    ),
    a(
      "ODA_TIPI",
      "Oda tipi",
      "SELECT",
      ["Standart", "Deniz manzaralı", "Aile odası", "Suit", "Villa"],
      "fcs"
    ),
    a(
      "OTEL_OLANAKLARI",
      "Olanaklar",
      "MULTI",
      ["Havuz", "Spa", "Otopark", "Wi-Fi", "Plaj", "Çocuk kulübü"],
      "fcs"
    ),
    IPTAL_KOSULU,
    KISI_SAYISI
  ],
  "tatil-koyu": [
    a(
      "KONSEPT",
      "Konsept",
      "SELECT",
      [
        "Sadece oda",
        "Oda kahvaltı",
        "Yarım pansiyon",
        "Tam pansiyon",
        "Her şey dâhil",
        "Ultra her şey dâhil"
      ],
      "fcs"
    ),
    a(
      "OTEL_OLANAKLARI",
      "Olanaklar",
      "MULTI",
      ["Havuz", "Spa", "Otopark", "Wi-Fi", "Plaj", "Çocuk kulübü"],
      "fcs"
    ),
    a("GECE_SAYISI", "Gece sayısı", "NUM", "gece", "fcs"),
    KISI_SAYISI,
    IPTAL_KOSULU
  ],
  "gunluk-kiralik-konaklama": [
    a(
      "ODA_SAYISI",
      "Oda sayısı",
      "SELECT",
      ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri"],
      "fcs"
    ),
    KISI_SAYISI,
    a("EN_AZ_KONAKLAMA_GECE", "En az konaklama", "NUM", "gece", "fc"),
    a(
      "EV_OLANAKLARI",
      "Olanaklar",
      "MULTI",
      ["Wi-Fi", "Mutfak", "Klima", "Çamaşır makinesi", "Otopark", "Havuz"],
      "fcs"
    ),
    IPTAL_KOSULU
  ],
  "yurtici-turlar": [
    a("TUR_SURESI_GUN", "Tur süresi", "NUM", "gün", "fcs"),
    a(
      "ULASIM",
      "Ulaşım",
      "SELECT",
      ["Otobüs", "Uçak", "Tren", "Kendi aracınızla"],
      "fcs"
    ),
    a(
      "TUR_DAHIL",
      "Fiyata dâhil",
      "MULTI",
      ["Konaklama", "Ulaşım", "Rehber", "Müze girişleri", "Öğle yemeği"],
      "fcs"
    ),
    a("GRUP_BUYUKLUGU", "Grup büyüklüğü", "NUM", "kişi", "fc"),
    IPTAL_KOSULU
  ],
  "yurtdisi-turlar": [
    a("TUR_SURESI_GUN", "Tur süresi", "NUM", "gün", "fcs"),
    a(
      "ULASIM",
      "Ulaşım",
      "SELECT",
      ["Otobüs", "Uçak", "Tren", "Kendi aracınızla"],
      "fcs"
    ),
    a(
      "TUR_DAHIL",
      "Fiyata dâhil",
      "MULTI",
      ["Konaklama", "Ulaşım", "Rehber", "Müze girişleri", "Öğle yemeği"],
      "fcs"
    ),
    a("VIZE_DAHIL", "Vize dâhil", "BOOL", null, "fc"),
    a("GRUP_BUYUKLUGU", "Grup büyüklüğü", "NUM", "kişi", "fc"),
    IPTAL_KOSULU
  ],
  "havaalani-transfer": [
    a(
      "TRANSFER_ARACI",
      "Araç",
      "SELECT",
      ["Binek", "Minivan", "Minibüs", "VIP araç"],
      "fcs"
    ),
    KISI_SAYISI,
    a("MESAFE_KM", "Mesafe", "NUM", "km", "fc"),
    a(
      "KARSILAMA",
      "Karşılama",
      "SELECT",
      ["Tabelalı karşılama", "Buluşma noktası", "Kapıda"],
      "fc"
    ),
    a("BEKLEME_SURESI_DK", "Ücretsiz bekleme", "NUM", "dk", "fc"),
    IPTAL_KOSULU
  ],
  "vip-ulasim": [
    a(
      "TRANSFER_ARACI",
      "Araç",
      "SELECT",
      ["Binek", "Minivan", "Minibüs", "VIP araç"],
      "fcs"
    ),
    KISI_SAYISI,
    a(
      "VIP_HIZMETLER",
      "Hizmetler",
      "MULTI",
      ["Şoför", "İkram", "Wi-Fi", "Karşılama", "Saatlik kiralama"],
      "fcs"
    ),
    a("SAATLIK_KIRALAMA", "Saatlik kiralama", "BOOL", null, "fc")
  ],
  "kamp-ekipmanlari": [
    a(
      "KAMP_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      ["Çadır", "Uyku tulumu", "Mat", "Ocak", "Sırt çantası", "Sandalye"],
      "fcs"
    ),
    KISI_SAYISI,
    a(
      "MEVSIM_UYUMU",
      "Mevsim uyumu",
      "SELECT",
      ["3 mevsim", "4 mevsim", "Yaz"],
      "fcs"
    ),
    a("AGIRLIK_KG", "Ağırlık", "NUM", "kg", "fc"),
    a("SU_GECIRMEZLIK_MM", "Su geçirmezlik", "NUM", "mm", "fc")
  ],
  "karavan-ekipmanlari": [
    a(
      "KARAVAN_URUN_TIPI",
      "Ürün tipi",
      "SELECT",
      [
        "Tente",
        "Güneş paneli",
        "Su tankı",
        "Buzdolabı",
        "Tuvalet",
        "Jeneratör"
      ],
      "fcs"
    ),
    a("GUC_W", "Güç", "NUM", "W", "fc"),
    a("KAPASITE", "Kapasite", "TEXT", null, "s"),
    KURULUM,
    GARANTI
  ],
  "doga-sporlari": [
    a(
      "SPOR_DALI",
      "Spor dalı",
      "SELECT",
      ["Tırmanış", "Dağcılık", "Bisiklet", "Kayak", "Su sporları", "Trekking"],
      "fcs"
    ),
    a(
      "EKIPMAN_SEVIYESI",
      "Kullanım seviyesi",
      "SELECT",
      ["Başlangıç", "Orta", "Profesyonel"],
      "fc"
    ),
    a("AGIRLIK_KG", "Ağırlık", "NUM", "kg", "fc"),
    MALZEME,
    GARANTI
  ]
});

/**
 * The catalogue, derived from the heading lists rather than written twice.
 *
 * A key's shape is fixed by its first appearance, and a second appearance that
 * disagrees is refused here rather than by the database — which would accept
 * it, because the second write is an `on conflict do nothing` that silently
 * keeps the first shape and leaves a heading pointing at options it does not
 * use.
 *
 * @returns {Map<string, Field>}
 */
function catalogue() {
  /** @type {Map<string, Field>} */
  const byKey = new Map();
  /** @type {string[]} */
  const clashes = [];
  for (const fields of Object.values(FIELDS))
    for (const field of fields) {
      const seen = byKey.get(field.key);
      if (seen === undefined) {
        byKey.set(field.key, field);
        continue;
      }
      const same =
        seen.name === field.name &&
        seen.kind === field.kind &&
        seen.flags === field.flags &&
        JSON.stringify(seen.spec) === JSON.stringify(field.spec);
      if (!same) clashes.push(field.key);
    }
  if (clashes.length > 0)
    throw new Error(
      `ATTRIBUTE_SHAPE_CLASH: ${[...new Set(clashes)].sort().join(", ")}`
    );
  return byKey;
}

/** `seed-taxonomy.mjs`'s own derivation, so a heading is found by the key it wrote. */
/**
 * @param {string} domain
 * @param {string} slug
 */
const categoryKey = (domain, slug) =>
  `${domain}__${slug.split("-").join("_").toUpperCase()}`;

if (process.env["DATABASE_URL"] === undefined) {
  process.stderr.write("DATABASE_URL is unset.\n");
  process.exit(1);
}

const definitions = catalogue();
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let addedDefinitions = 0;
let addedOptions = 0;
let addedLinks = 0;
/** @type {string[]} */
const missingHeadings = [];

try {
  await client.query("begin");

  /** @type {Map<string, string>} */
  const definitionIds = new Map();
  /** @type {Field[]} */
  const everyField = Array.from(definitions.values());
  for (const field of everyField) {
    const kind = KINDS[field.kind];
    if (kind === undefined) throw new Error(`UNKNOWN_KIND_${field.kind}`);
    const options = /** @type {string[]} */ (
      Array.isArray(field.spec) ? field.spec : []
    );
    const unit = Array.isArray(field.spec) ? null : field.spec;
    /*
     * `searchable` is set for every definition regardless of its flag letters.
     * The projection's `attribute_text` is what makes "16 gb ram laptop" find a
     * laptop, and a value withheld from it is a value a person can read on the
     * page and cannot search for — which reads as the search being broken. The
     * letters decide the two properties that change what a *surface* offers.
     */
    const inserted = /** @type {{ rowCount: number }} */ (
      await client.query(
        `insert into attribute_definition
           (stable_key, name, value_kind, unit, searchable, filterable,
            comparable, required_for_publication, active)
         values ($1,$2,$3::"AttributeValueKind",$4,true,$5,$6,false,true)
         on conflict (stable_key) do nothing`,
        [
          field.key,
          field.name,
          kind,
          unit,
          // Text is never filterable: `US-PLT-F09-001` refuses it, and a `true`
          // here would be refused by the same rule one layer down.
          field.flags.includes("f") && kind !== "TEXT",
          field.flags.includes("c")
        ]
      )
    );
    if (inserted.rowCount === 1) addedDefinitions += 1;

    const found = /** @type {{ rows: { id: string }[] }} */ (
      await client.query(
        `select id from attribute_definition where stable_key = $1`,
        [field.key]
      )
    );
    const definitionId = found.rows[0]?.id;
    if (definitionId === undefined)
      throw new Error(`NO_DEFINITION_${field.key}`);
    definitionIds.set(field.key, definitionId);

    // Indexed rather than `.entries()`: the lint pass type-checks this file
    // against a lib without the iterator helpers, and an `any` there would
    // travel silently into the insert.
    for (let index = 0; index < options.length; index += 1) {
      const label = options[index];
      if (label === undefined) continue;
      const { rowCount } = /** @type {{ rowCount: number }} */ (
        await client.query(
          `insert into attribute_option
             (attribute_definition_id, stable_key, label, sort_order, active)
           values ($1,$2,$3,$4,true)
           on conflict (attribute_definition_id, stable_key) do nothing`,
          [definitionId, optionKey(label), label, index]
        )
      );
      if (rowCount === 1) addedOptions += 1;
    }
  }

  for (const [slug, fields] of Object.entries(FIELDS)) {
    /*
     * The heading is found by stable key across every Domain, because a slug is
     * unique only within one and this file is written per heading rather than
     * per sector. A slug that matches nothing is reported rather than skipped
     * silently: it means the taxonomy and this file have drifted apart, which
     * is the one failure a second run would otherwise hide.
     */
    const category = /** @type {{ rows: { id: string }[] }} */ (
      await client.query(
        `select id from category
         where stable_key = any($1::text[]) and active = true
         limit 1`,
        [
          [
            "YAZILIM_YAPAY_ZEKA",
            "FINANS_KRIPTO",
            "SIGORTA",
            "REAL_ESTATE",
            "TECHNOLOGY",
            "EGITIM",
            "SAGLIK_KOZMETIK",
            "OYUN_ESPOR",
            "EV_BAHCE",
            "MOBILITY",
            "SEYAHAT"
          ].map((domain) => categoryKey(domain, slug))
        ]
      )
    );
    const categoryId = category.rows[0]?.id;
    if (categoryId === undefined) {
      missingHeadings.push(slug);
      continue;
    }

    const fieldList = /** @type {Field[]} */ (fields);
    for (let index = 0; index < fieldList.length; index += 1) {
      const field = fieldList[index];
      if (field === undefined) continue;
      const definitionId = definitionIds.get(field.key);
      if (definitionId === undefined) throw new Error(`NO_ID_${field.key}`);
      const { rowCount } = /** @type {{ rowCount: number }} */ (
        await client.query(
          `insert into category_attribute
             (category_id, attribute_definition_id, sort_order)
           values ($1,$2,$3)
           on conflict (category_id, attribute_definition_id) do nothing`,
          [categoryId, definitionId, index]
        )
      );
      if (rowCount === 1) addedLinks += 1;
    }
  }

  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

if (missingHeadings.length > 0)
  process.stderr.write(
    `No active Category for: ${missingHeadings.join(", ")}\n` +
      "Run `npm run seed:taxonomy` first.\n"
  );

process.stdout.write(
  `Attributes: ${String(definitions.size)} definition(s) in the catalogue, ` +
    `${String(addedDefinitions)} added, ${String(addedOptions)} option(s) added, ` +
    `${String(addedLinks)} heading link(s) added.\n`
);
process.exitCode = missingHeadings.length > 0 ? 1 : 0;
