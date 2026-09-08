#!/usr/bin/env node
/**
 * The sector taxonomy, as an operator runs it (I57).
 *
 * `first-run.mjs` states the bootstrap problem exactly: *"Nothing can be
 * published until Categories exist, no Category exists until an Admin makes
 * one."* Making a hundred and thirty of them by hand through the Admin screen
 * is not a bootstrap, it is a data-entry project — and one that would be redone
 * from memory on every fresh environment.
 *
 * **Why this writes SQL rather than calling the Admin API.** The API path needs
 * a confirmed account, an Admin grant and an entered Admin context, which is
 * three operator steps before the first Category exists. `admin.mjs` already
 * set the precedent for the case where a governed record has to be provisioned
 * before the product layer can be used, and `i53`'s own test provisions a
 * Domain the same way. The rules being bypassed are worth naming so nobody
 * assumes they are being enforced here:
 *
 * - **Two levels, and only two.** Each sector Domain gets one root Category
 *   carrying the sector's name, and the headings are its children. A cycle
 *   needs a parent that is already a descendant, and a child written here has
 *   a parent written moments earlier in the same transaction, so the rule
 *   cannot be reached rather than being trusted.
 * - **The children are leaves**, which is what `assignable()` requires before
 *   an Offering may be filed under one, and the roots are branches, which is
 *   what makes them navigation rather than result pages.
 * - **The root exists so Home stays readable.** Home lists active root
 *   Categories flat, as UX-0001 §8.1 requires and the API's Domain grouping
 *   allows. A hundred and twenty-seven roots would be a wall; eleven sector
 *   names is the same list the Owner's analysis opens with.
 * - Uniqueness is left to the database: `domain_id, slug` and `stable_key` are
 *   unique, and `on conflict do nothing` makes a second run a no-op rather than
 *   a failure. Running this twice changes nothing; running it after adding a
 *   heading below adds only that heading.
 *
 *   npm run seed:taxonomy
 *
 * The shape is the Owner's affiliate analysis: eleven sectors, each a Domain
 * (`20260901000100_sector_domains`), and the headings under them the level at
 * which a person actually shops — and at which a commission band, a quote form
 * and a partner landing page exist.
 */
import { Client } from "pg";

/**
 * Three headings here are **not** in the Owner's list and are marked `EK:`.
 *
 * They exist because the catalogue has things the list has no heading for, and
 * filing a workplace policy under "Ev (Konut) Sigortası" because it is the
 * nearest phrase makes the Offering wrong twice: absent where it belongs and
 * misleading where it landed. Kept separate so they are easy to remove.
 */
/** @type {Record<string, [string, string][]>} */
const TAXONOMY = {
  YAZILIM_YAPAY_ZEKA: [
    ["web-barindirma", "Web Barındırma (Hosting)"],
    ["sunucu-cozumleri", "Sunucu (Server) Çözümleri"],
    ["alan-adi", "Alan Adı (Domain) Hizmetleri"],
    ["ai-icerik", "Yapay Zeka İçerik Üretim Araçları"],
    ["ai-gorsel-video", "Yapay Zeka Görsel/Video Araçları"],
    ["is-otomasyonu", "İş Otomasyonu Yazılımları"],
    ["b2b-saas", "B2B SaaS Platformları"],
    ["vpn", "VPN Hizmetleri"],
    ["siber-guvenlik", "Siber Güvenlik Yazılımları"],
    ["antivirus", "Antivirüs Yazılımları"],
    ["eticaret-altyapi", "E-Ticaret Altyapıları"],
    ["sanal-pos", "Sanal POS ve Ödeme Sistemleri"]
  ],
  FINANS_KRIPTO: [
    ["kredi-kartlari", "Kredi Kartları"],
    ["avantaj-puan", "Avantaj ve Puan Programları"],
    ["kripto-borsalari", "Kripto Para Borsaları"],
    ["dijital-cuzdan", "Dijital Cüzdanlar (E-Cüzdan)"],
    ["hisse-senedi", "Hisse Senedi Uygulamaları"],
    ["forex", "Forex Platformları"],
    ["mikro-yatirim", "Mikro Yatırım Uygulamaları"],
    ["bes", "Bireysel Emeklilik (BES)"],
    ["fon-yonetimi", "Fon Yönetimi Hizmetleri"],
    ["butce-planlama", "Bütçe Planlama Araçları"],
    ["kisisel-finans", "Kişisel Finans Uygulamaları"]
  ],
  SIGORTA: [
    ["kasko", "Kasko Sigortası"],
    ["trafik-sigortasi", "Zorunlu Trafik Sigortası"],
    ["tamamlayici-saglik", "Tamamlayıcı Sağlık Sigortası"],
    ["hayat-sigortasi", "Hayat Sigortası"],
    ["konut-sigortasi", "Ev (Konut) Sigortası"],
    ["dask", "DASK (Zorunlu Deprem Sigortası)"],
    ["seyahat-sigortasi", "Seyahat Sigortası"],
    ["vize-sigortasi", "Vize Sigortası"],
    ["pet-saglik", "Evcil Hayvan (Pet) Sağlık Sigortası"],
    // EK:
    ["isyeri-sigortasi", "İşyeri ve KOBİ Paket Sigortası"]
  ],
  REAL_ESTATE: [
    ["satilik-konut", "Satılık Konut"],
    ["satilik-proje", "Satılık Proje (Yeni Konut)"],
    ["satilik-isyeri", "Satılık İş Yeri"],
    ["satilik-ticari", "Satılık Ticari Gayrimenkul"],
    ["satilik-arsa", "Satılık Arsa"],
    ["satilik-arazi", "Satılık Arazi"],
    ["turistik-tesis", "Turistik Tesis"],
    ["gunluk-kiralik-ev", "Günlük Kiralık Ev"],
    ["emlak-danismanligi", "Emlak Danışmanlığı Hizmetleri"],
    ["online-ekspertiz", "Çevrimiçi Ekspertiz Hizmetleri"]
  ],
  TECHNOLOGY: [
    ["cep-telefonlari", "Cep Telefonları"],
    ["mobil-aksesuar", "Mobil Aksesuarlar (Kılıf, Şarj Cihazı)"],
    ["laptop", "Dizüstü Bilgisayarlar (Laptop)"],
    ["masaustu", "Masaüstü Bilgisayarlar"],
    ["donanim-parcalari", "Bilgisayar Donanım Parçaları"],
    ["televizyon", "Televizyonlar"],
    ["ev-sinema", "Ev Sinema Sistemleri"],
    ["akilli-saat", "Akıllı Saatler"],
    ["giyilebilir", "Giyilebilir Teknoloji Ürünleri"],
    ["fotograf-makinesi", "Fotoğraf Makineleri"],
    ["video-kamera", "Video Kameralar"],
    ["dron", "Dronlar"],
    // EK:
    ["kulaklik", "Kulaklıklar ve Kişisel Ses"]
  ],
  EGITIM: [
    ["yazilim-kodlama", "Yazılım ve Kodlama Kursları"],
    ["tasarim-egitimleri", "Tasarım Eğitimleri"],
    ["teknoloji-kurslari", "Teknoloji Kursları"],
    ["dijital-pazarlama", "Dijital Pazarlama Eğitimleri"],
    ["eticaret-egitimleri", "E-Ticaret Eğitimleri"],
    ["dil-ogrenme", "Yabancı Dil Öğrenme Uygulamaları"],
    ["sertifika-programlari", "Çevrimiçi Sertifika Programları"],
    ["kariyer-gelisimi", "Kariyer Gelişimi Eğitimleri"],
    ["cocuk-egitimleri", "Çocuklar İçin Çevrimiçi Eğitimler"]
  ],
  SAGLIK_KOZMETIK: [
    ["vitaminler", "Vitaminler"],
    ["besin-takviyeleri", "Besin Takviyeleri"],
    ["sporcu-beslenmesi", "Sporcu Beslenmesi (Protein Tozu vb.)"],
    ["cilt-bakimi", "Cilt Bakım Ürünleri"],
    ["yuz-bakimi", "Yüz Bakım Ürünleri"],
    ["anti-aging", "Anti-Aging (Yaşlanma Karşıtı) Ürünler"],
    ["parfum", "Parfümler"],
    ["deodorant", "Deodorantlar"],
    ["sac-bakimi", "Saç Bakım Ürünleri"],
    ["sac-sekillendirici", "Saç Şekillendiriciler"],
    ["diyet-programlari", "Diyet Programları"],
    ["fitness-uygulamalari", "Fitness Uygulamaları"],
    ["kilo-kontrolu", "Kilo Kontrolü Programları"]
  ],
  OYUN_ESPOR: [
    ["dijital-oyun", "Dijital Oyun Satışları"],
    ["oyun-abonelikleri", "Oyun Abonelikleri (Game Pass, PS Plus)"],
    ["oyun-ici-satin-alim", "Oyun İçi Satın Alımlar"],
    ["oyuncu-kulakliklari", "Oyuncu Kulaklıkları"],
    ["oyuncu-klavyeleri", "Oyuncu Klavyeleri"],
    ["oyuncu-mouselari", "Oyuncu Mouse'ları"],
    ["oyun-konsollari", "Oyun Konsolları"],
    ["konsol-aksesuarlari", "Konsol Aksesuarları"],
    ["espor-platformlari", "E-Spor Platformları"],
    ["igaming", "iGaming (Bahis/Casino) Platformları"],
    ["yayinci-ekipmanlari", "Yayıncı (Streamer) Ekipmanları"]
  ],
  EV_BAHCE: [
    ["robot-supurge", "Robot Süpürgeler"],
    ["kucuk-ev-aletleri", "Küçük Ev Aletleri"],
    ["akilli-ev", "Akıllı Ev Sistemleri"],
    ["guvenlik-kameralari", "Güvenlik Kameraları"],
    ["beyaz-esya", "Beyaz Eşyalar"],
    ["ankastre", "Ankastre Setler"],
    ["oturma-odasi", "Oturma Odası Mobilyaları"],
    ["yatak-odasi", "Yatak Odası Mobilyaları"],
    ["dekorasyon", "Ev Dekorasyon Ürünleri"],
    ["ergonomi", "Ergonomi Ürünleri (Çalışma Koltuğu vb.)"],
    ["evcil-mama", "Evcil Hayvan Mamaları"],
    ["evcil-aksesuar", "Evcil Hayvan Aksesuarları"],
    // EK:
    ["el-aletleri", "Elektrikli El Aletleri ve Bahçe"]
  ],
  MOBILITY: [
    ["arac-kiralama", "Araç Kiralama (Günlük Rent a Car)"],
    ["filo-kiralama", "Filo Kiralama (Uzun Dönem)"],
    ["oto-lastik", "Oto Lastikleri"],
    ["jant", "Otomobil Jantları"],
    ["dis-donanim", "Araç Dış Donanım Ürünleri"],
    ["arac-multimedya", "Araç İçi Multimedya Sistemleri"],
    ["oto-ici-aksesuar", "Oto İçi Aksesuarlar"],
    ["oto-bakim", "Oto Bakım Ürünleri"],
    ["oto-temizlik", "Oto Temizlik Ürünleri"],
    ["motor-yaglari", "Motor Yağları"],
    ["yedek-parca", "Oto Yedek Parça"],
    ["oto-ekspertiz", "Çevrimiçi Oto Ekspertiz Randevuları"]
  ],
  SEYAHAT: [
    ["ucak-bileti", "Uçak Bileti"],
    ["otobus-bileti", "Otobüs Bileti"],
    ["tren-bileti", "Tren Bileti"],
    ["otel-rezervasyonu", "Otel Rezervasyonu"],
    ["tatil-koyu", "Tatil Köyü Rezervasyonu"],
    ["gunluk-kiralik-konaklama", "Günlük Kiralık Konaklama (Airbnb vb.)"],
    ["yurtici-turlar", "Yurtiçi Turlar"],
    ["yurtdisi-turlar", "Yurtdışı Turlar"],
    ["havaalani-transfer", "Havaalanı Transfer Hizmetleri"],
    ["vip-ulasim", "VIP Ulaşım Hizmetleri"],
    ["kamp-ekipmanlari", "Kamp Ekipmanları"],
    ["karavan-ekipmanlari", "Karavan Ekipmanları"],
    ["doga-sporlari", "Doğa Sporları Ekipmanları"]
  ]
};

/**
 * The stable key, composed rather than hand-written.
 *
 * `DOMAIN__SLUG` in upper case. Composed so that two headings with the same
 * slug in different sectors — `seyahat-sigortasi` under Sigorta and a future
 * one under Seyahat — cannot collide, and so that reading a key tells you where
 * the Category lives without a join.
 */
/**
 * @param {string} domain
 * @param {string} slug
 * @returns {string}
 */
const stableKey = (domain, slug) =>
  // `split`/`join` rather than `replaceAll`: this file is linted against the
  // default project, whose lib does not resolve the newer method.
  `${domain}__${slug.split("-").join("_").toUpperCase()}`;

/**
 * The sector's own name and slug, read from the Domain record.
 *
 * Not written a second time here. `20260901000100_sector_domains` owns what a
 * sector is called, and a copy in this file would be the copy that goes stale
 * the first time one is renamed.
 */
const ROOT_SLUG_SUFFIX = "";

if (process.env["DATABASE_URL"] === undefined) {
  process.stderr.write("DATABASE_URL is unset.\n");
  process.exit(1);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

let added = 0;
let existing = 0;
/** @type {string[]} */
const missingDomains = [];

try {
  await client.query("begin");
  for (const [domain, headings] of Object.entries(TAXONOMY)) {
    const found =
      /** @type {{ rows: { id: string; name: string; slug: string }[] }} */ (
        await client.query(
          `select id, name, slug from domain where stable_key = $1 and active = true`,
          [domain]
        )
      );
    const sector = found.rows[0];
    if (sector === undefined) {
      // Named rather than created. A Domain is a governed record and
      // `20260901000100_sector_domains` owns the set; inventing one here would
      // put a second author on the same fact.
      missingDomains.push(domain);
      continue;
    }
    /*
     * The sector root, upserted before its headings so the children always have
     * a parent inside the same transaction. `returning` is empty on a conflict,
     * so the id is read back rather than assumed.
     */
    const rootKey = `${domain}__ROOT`;
    const root = /** @type {{ rowCount: number; rows: { id: string }[] }} */ (
      await client.query(
        `insert into category (domain_id, parent_id, stable_key, slug, name, active)
         values ($1, null, $2, $3, $4, true)
         on conflict (stable_key) do nothing
         returning id`,
        [sector.id, rootKey, sector.slug + ROOT_SLUG_SUFFIX, sector.name]
      )
    );
    if (root.rowCount === 1) added += 1;
    else existing += 1;
    const already = /** @type {{ rows: { id: string }[] }} */ (
      await client.query(`select id from category where stable_key = $1`, [
        rootKey
      ])
    );
    const rootId = root.rows[0]?.id ?? already.rows[0]?.id;
    if (rootId === undefined) throw new Error(`NO_ROOT_FOR_${domain}`);

    for (const [slug, name] of headings) {
      const { rowCount } = /** @type {{ rowCount: number }} */ (
        await client.query(
          `insert into category (domain_id, parent_id, stable_key, slug, name, active)
           values ($1, $2, $3, $4, $5, true)
           on conflict do nothing`,
          [sector.id, rootId, stableKey(domain, slug), slug, name]
        )
      );
      if (rowCount === 1) added += 1;
      else existing += 1;
    }
  }
  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  await client.end();
}

if (missingDomains.length > 0)
  process.stderr.write(
    `Missing Domains, their headings were skipped: ${missingDomains.join(", ")}\n` +
      "Run the migrations first.\n"
  );

process.stdout.write(
  `Taxonomy: ${String(added)} heading(s) added, ${String(existing)} already present.\n`
);
process.exitCode = missingDomains.length > 0 ? 1 : 0;
