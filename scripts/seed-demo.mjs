#!/usr/bin/env node
/**
 * A catalogue you can look at (I57).
 *
 * **This is the step that proves the affiliate model without writing any of the
 * ingestion for it.** The Owner's model is that partner firms' prices arrive by
 * API and every listing hands the person off to the partner's own page. None of
 * that needs a feed to be demonstrated: a partner is a `Business`, its price for
 * one product is an `Offering` carrying an `amount` and an
 * `AffiliateDestination`, and the several partners selling one product are the
 * Offerings that share a `productKey` (PRD-0001 v4.0 §5.12).
 *
 * So this script does by hand exactly what a feed will later do on a schedule.
 * If the site works with this data, the feed is an automation problem rather
 * than a design problem — and if it does not, that is far cheaper to find out
 * here than after building the pipeline.
 *
 * **Everything goes through the real API.** Writing Offerings straight into the
 * database would skip `composePublicEligibility` and `PROJECT_OFFERING`, and the
 * rows would sit there invisible to Discovery — a catalogue that exists in
 * `psql` and nowhere else. The one thing written directly is the Admin grant,
 * because `US-IDN-F08-001` AC-3 puts that outside the product layer on purpose
 * and `scripts/admin.mjs` is the precedent.
 *
 *   npm run build && npm run seed:taxonomy && npm run seed:demo
 *
 * Idempotent by Business slug: a second run finds the Businesses already there
 * and stops rather than duplicating a catalogue.
 */
import { randomUUID } from "node:crypto";

import { Client } from "pg";

import { OutboxProcessor } from "../apps/worker/dist/outbox.processor.js";

const ORIGIN = process.env["PUBLIC_WEB_URL"] ?? "http://localhost:3000";
const PASSWORD = "correct horse battery staple";

if (process.env["DATABASE_URL"] === undefined) {
  process.stderr.write("DATABASE_URL is unset.\n");
  process.exit(1);
}

/* ────────────────────────────────────────────────────────────── the content */

/**
 * Seven partner firms, in the three shapes the Owner's analysis separates.
 *
 * The names are invented and the addresses are `example.test`, which does not
 * resolve. Nothing here is a claim about a real company, and no Affiliate
 * Destination points anywhere a person could actually be sent.
 */
/** @type {{ name: string; short: string; slug: string }[]} */
const PARTNERS = [
  {
    name: "Teknoloji Deposu",
    slug: "teknoloji-deposu",
    short: "Elektronik ve bilgisayar perakendecisi."
  },
  {
    name: "Vitrin Elektronik",
    slug: "vitrin-elektronik",
    short: "Çevrimiçi elektronik mağazası."
  },
  {
    name: "Anadolu Bilişim",
    slug: "anadolu-bilisim",
    short: "Yetkili teknoloji satıcısı."
  },
  {
    name: "Hostwell",
    slug: "hostwell",
    short: "Barındırma ve alan adı hizmetleri."
  },
  {
    name: "Sunucu Market",
    slug: "sunucu-market",
    short: "Sunucu ve bulut altyapı sağlayıcısı."
  },
  {
    name: "Marmara Sigorta Aracılık",
    slug: "marmara-sigorta",
    short: "Sigorta acentesi."
  },
  {
    name: "Meridyen Tur",
    slug: "meridyen-tur",
    short: "Tur ve konaklama operatörü."
  }
];

/**
 * Six products, each sold by more than one partner.
 *
 * `productKey` is the only thing that groups them, and it is a matching hint
 * rather than an identity — §5.12.3 forbids inferring the same product from
 * similar titles, similar attributes or similar prices, so the key is stated
 * explicitly on every row that belongs to one.
 *
 * The two On Request rows are the point of that Pricing Kind: an insurance
 * policy is priced after the risk is described, and the platform earns on the
 * handoff to the quote form rather than on a sale it never sees.
 */
/**
 * @typedef {object} Offer
 * @property {string} [amount]
 * @property {string | null} [delivery]
 * @property {string} partner
 * @property {string | null} [prior]
 * @property {"IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN"} stock
 */
/**
 * @typedef {object} Product
 * @property {string} category
 * @property {string} key
 * @property {Offer[]} offers
 * @property {boolean} [onRequest]
 * @property {string} summary
 * @property {string} title
 * @property {Record<string, unknown>} [values] the heading's own fields, by
 *   the name a person reads on the form (I66)
 */
/** @type {Product[]} */
const PRODUCTS = [
  {
    category: "TECHNOLOGY__CEP_TELEFONLARI",
    /*
     * I66. The fields the heading defines, filled in.
     *
     * Written as `stable key → value` and resolved to identifiers at write
     * time, because the identifiers are generated and this file has to survive
     * a fresh database. A key the heading does not define is reported rather
     * than skipped: it means the demo and the catalogue have drifted apart.
     */
    values: {
      "Ağ desteği": ["5G", "Wi-Fi 6E", "eSIM"],
      "Arka kamera çözünürlüğü": 50,
      "Batarya kapasitesi": 5000,
      Depolama: "256 GB",
      "Ekran boyutu": 6.7,
      "Ekran teknolojisi": "AMOLED",
      "Garanti süresi": "24 ay",
      RAM: "12 GB",
      Renk: "Siyah",
      "Tazeleme hızı": "120 Hz"
    },
    key: "NOVA-X7-PRO-256",
    summary:
      "6,7 inç AMOLED ekran, 120 Hz tazeleme, 256 GB depolama ve 5000 mAh batarya. Kutu içeriği şarj adaptörü içermez.",
    title: "Nova X7 Pro 5G 256 GB",
    offers: [
      {
        partner: "teknoloji-deposu",
        amount: "42990.00",
        prior: "45990.00",
        delivery: "0.00",
        stock: "IN_STOCK"
      },
      {
        partner: "vitrin-elektronik",
        amount: "43750.00",
        prior: null,
        delivery: "149.90",
        stock: "IN_STOCK"
      },
      {
        partner: "anadolu-bilisim",
        amount: "44200.00",
        prior: null,
        delivery: "0.00",
        stock: "OUT_OF_STOCK"
      }
    ]
  },
  {
    category: "TECHNOLOGY__LAPTOP",
    values: {
      Ağırlık: 1.24,
      Çözünürlük: "2560×1600",
      Depolama: "512 GB",
      "Ekran boyutu": 14,
      "Ekran kartı": "Dahili",
      "Garanti süresi": "24 ay",
      İşlemci: "Apple M serisi",
      "İşletim sistemi": "macOS",
      RAM: "16 GB"
    },
    key: "AURORA-BOOK-AIR-14-M3",
    summary:
      "14 inç, 16 GB bellek, 512 GB SSD. Sessiz soğutma, 18 saate kadar pil ömrü. Türkçe klavye.",
    title: "Aurora Book Air 14 M3 512 GB",
    offers: [
      {
        partner: "anadolu-bilisim",
        amount: "61900.00",
        prior: null,
        delivery: "0.00",
        stock: "IN_STOCK"
      },
      {
        partner: "teknoloji-deposu",
        amount: "62450.00",
        prior: "64900.00",
        delivery: "0.00",
        stock: "IN_STOCK"
      }
    ]
  },
  {
    category: "TECHNOLOGY__KULAKLIK",
    values: {
      Bağlantı: "Bluetooth",
      "Garanti süresi": "24 ay",
      "Gürültü engelleme": "Aktif (ANC)",
      "Kullanım süresi": 30,
      "Kulaklık tipi": "Kulak içi",
      Mikrofon: true,
      "Suya dayanıklılık": "IPX4"
    },
    key: "SONARE-AIR-PRO-3",
    summary:
      "Aktif gürültü engelleme, 30 saate kadar kullanım, kablosuz şarj kutusu. IPX4 suya dayanıklılık.",
    title: "Sonare Air Pro 3 Kulaklık",
    offers: [
      {
        partner: "vitrin-elektronik",
        amount: "4290.00",
        prior: "4990.00",
        delivery: "0.00",
        stock: "IN_STOCK"
      },
      {
        partner: "teknoloji-deposu",
        amount: "4450.00",
        prior: null,
        delivery: "79.90",
        stock: "IN_STOCK"
      }
    ]
  },
  {
    category: "YAZILIM_YAPAY_ZEKA__WEB_BARINDIRMA",
    values: {
      "Aylık trafik": "1 TB",
      "Barındırma tipi": "Bulut",
      "Çalışma süresi taahhüdü": "%99,9",
      Destek: "7/24 telefon",
      "Disk alanı": 80,
      "Veri merkezi": "İstanbul",
      "Yönetim paneli": "cPanel"
    },
    key: "HOSTWELL-BASLANGIC-1Y",
    summary:
      "Yıllık paylaşımlı barındırma: 10 GB NVMe alan, sınırsız trafik, ücretsiz SSL ve günlük yedek.",
    title: "Başlangıç Barındırma — 1 Yıl",
    offers: [
      {
        partner: "hostwell",
        amount: "1490.00",
        prior: "1990.00",
        delivery: null,
        stock: "IN_STOCK"
      },
      {
        partner: "sunucu-market",
        amount: "1620.00",
        prior: null,
        delivery: null,
        stock: "IN_STOCK"
      }
    ]
  },
  {
    category: "SIGORTA__KASKO",
    values: {
      "Hasarsızlık indirimi korunur": true,
      "İkame araç": 15,
      Muafiyet: "Muafiyetsiz",
      "Onarım yeri": "Yetkili servis",
      "Ödeme seçeneği": ["Peşin", "9 taksit"],
      "Poliçe süresi": "12 ay",
      Teminatlar: ["Çarpma", "Hırsızlık", "Doğal afet"]
    },
    key: "KASKO-BINEK-YILLIK",
    onRequest: true,
    summary:
      "Binek araçlar için yıllık tam kasko. Prim; araç, kullanım ve hasarsızlık bilgisine göre teklif sonrası belirlenir.",
    title: "Tam Kasko Poliçesi — Binek Araç (Yıllık)",
    offers: [{ partner: "marmara-sigorta", stock: "UNKNOWN" }]
  },
  {
    category: "SEYAHAT__OTEL_REZERVASYONU",
    values: {
      "İptal koşulu": "Ücretsiz iptal",
      "Kişi sayısı": 2,
      Konsept: "Her şey dâhil",
      "Oda tipi": "Deniz manzaralı",
      Olanaklar: ["Havuz", "Spa", "Otopark", "Wi-Fi"],
      Yıldız: "5 yıldız"
    },
    key: "KAPADOKYA-2-GECE-BUTIK",
    summary:
      "Kapadokya'da 2 gece 3 gün butik otel konaklaması, kahvaltı dâhil. Ulaşım pakete dâhil değildir.",
    title: "Kapadokya 2 Gece Butik Otel — Kahvaltı Dâhil",
    offers: [
      {
        partner: "meridyen-tur",
        amount: "3450.00",
        prior: "4200.00",
        delivery: null,
        stock: "IN_STOCK"
      }
    ]
  }
];

/* ─────────────────────────────────────────────────────────────── the driver */

const pool = new Client({ connectionString: process.env.DATABASE_URL });
await pool.connect();

/** @type {{ body: string; recipient: string }[]} */
const delivered = [];
const capturing = {
  /** @param {{ body: string; recipient: string }} message */
  deliver: (message) => {
    delivered.push(message);
    return Promise.resolve();
  }
};

/**
 * @typedef {object} Injected
 * @property {string} body
 * @property {{ name: string; value: string }[]} cookies
 * @property {() => Record<string, string>} json
 * @property {number} statusCode
 */
/** @typedef {{ inject: (options: Record<string, unknown>) => Promise<Injected>; close: () => Promise<void> }} Injectable */

const { createApiApp } = await import("../apps/api/dist/bootstrap.js");
const app = /** @type {Injectable} */ (
  /** @type {unknown} */ (await createApiApp({ logLevel: "fatal" }))
);

const { Pool } = await import("pg");
const workerPool = new Pool({ connectionString: process.env.DATABASE_URL });
const processor = new OutboxProcessor({
  dispatcher: capturing,
  logger: { debug: () => {}, error: () => {}, info: () => {}, warn: () => {} },
  pool: workerPool,
  publicWebUrl: ORIGIN
});

/**
 * @param {"GET" | "POST" | "PUT"} method
 * @param {string} url
 * @param {{ body?: unknown; cookie?: string }} [options]
 * @returns {Promise<Injected>}
 */
const send = (method, url, { body, cookie } = {}) =>
  app.inject({
    ...(body === undefined ? {} : { body }),
    headers: { origin: ORIGIN, ...(cookie === undefined ? {} : { cookie }) },
    method,
    url: `/api/v1${url}`
  });

/**
 * One confirmed account, through registration and the emailed link.
 *
 * The token is minted at delivery and only its digest is stored, so there is no
 * shortcut here that does not also weaken the real thing. This runs the same
 * processor the worker runs, with a dispatcher that keeps the message.
 */
const signUp = async () => {
  const email = `demo-${randomUUID()}@example.test`;
  await send("POST", "/auth/registrations", {
    body: { email, password: PASSWORD }
  });
  await processor.processBatch();
  const message = delivered.find((m) => m.recipient === email);
  if (!message) throw new Error(`NO_MESSAGE_FOR_${email}`);
  const link = /https?:\/\/\S+/u.exec(message.body)?.[0];
  if (link === undefined) throw new Error(`NO_LINK_FOR_${email}`);
  const confirmed = await send("POST", "/auth/registrations/confirmations", {
    body: { token: new URL(link).searchParams.get("token") }
  });
  const jar = confirmed.cookies.find((c) => c.name === "commerce_session");
  return {
    cookie: `commerce_session=${jar?.value ?? ""}`,
    email,
    userId: confirmed.json().userId
  };
};

/**
 * @param {Injected} response
 * @param {string} what
 * @returns {Injected}
 */
const ok = (response, what) => {
  if (response.statusCode >= 400)
    throw new Error(
      `${what} → ${String(response.statusCode)} ${response.body}`
    );
  return response;
};

/**
 * Turns `field name → value` into the shape the write path takes (I66).
 *
 * Keyed on the **display name** rather than on the catalogue's stable key,
 * because the name is what the read publishes and what a person editing this
 * file recognises. A name the heading does not apply, or an option the
 * definition does not offer, is thrown rather than dropped: a silently skipped
 * attribute produces a demo that looks right and filters nothing.
 *
 * @param {{ id: string, name: string, options: { id: string, label: string }[], valueKind: string }[]} applicable
 * @param {Record<string, unknown>} values
 * @param {string} slug
 */
function attributeValues(applicable, values, slug) {
  const byName = new Map(
    applicable.map((definition) => [definition.name, definition])
  );
  const written = [];
  for (const [name, value] of Object.entries(values)) {
    const definition = byName.get(name);
    if (definition === undefined)
      throw new Error(
        `NO_SUCH_ATTRIBUTE "${name}" for ${slug}; applicable: ` +
          applicable.map((one) => one.name).join(", ")
      );
    if (definition.valueKind === "NUMBER")
      written.push({
        attributeId: definition.id,
        kind: "NUMBER",
        number: value
      });
    else if (definition.valueKind === "BOOLEAN")
      written.push({
        attributeId: definition.id,
        boolean: value,
        kind: "BOOLEAN"
      });
    else if (definition.valueKind === "TEXT")
      written.push({ attributeId: definition.id, kind: "TEXT", text: value });
    else {
      const labels = Array.isArray(value) ? value : [value];
      const optionIds = labels.map((label) => {
        const option = definition.options.find(
          (candidate) => candidate.label === label
        );
        if (option === undefined)
          throw new Error(
            `NO_SUCH_OPTION ${name}=${String(label)} for ${slug}`
          );
        return option.id;
      });
      written.push({ attributeId: definition.id, kind: "SELECT", optionIds });
    }
  }
  return written;
}

let created = 0;
try {
  /* ── the operator, who is also the Admin ───────────────────────────────── */
  const operator = await signUp();
  await pool.query(
    `insert into admin_authorization (user_id, granted_by)
     values ($1, 'seed-demo') on conflict (user_id) do nothing`,
    [operator.userId]
  );
  ok(
    await send("PUT", "/auth/me/admin-context", { cookie: operator.cookie }),
    "admin context"
  );

  /* ── the leaf Categories, by the stable keys the taxonomy seed wrote ────── */
  /** @type {string[]} */
  const wanted = [...new Set(PRODUCTS.map((product) => product.category))];
  const categories = /** @type {{ rows: { id: string; key: string }[] }} */ (
    await pool.query(
      `select stable_key as key, id from category where stable_key = any($1)`,
      [wanted]
    )
  );
  /*
   * Built by a loop rather than by `Object.fromEntries`, which widens to `any`
   * under typed linting and would take the whole lookup with it.
   */
  /** @type {Record<string, string>} */
  const categoryId = {};
  for (const row of categories.rows) categoryId[row.key] = row.id;
  const missing = wanted.filter((key) => categoryId[key] === undefined);
  if (missing.length > 0)
    throw new Error(
      `Missing Categories: ${missing.join(", ")}. Run seed:taxonomy first.`
    );

  /* ── the partners ──────────────────────────────────────────────────────── */
  const existing = /** @type {{ rows: { slug: string }[] }} */ (
    await pool.query(`select slug from business where slug = any($1)`, [
      PARTNERS.map((partner) => partner.slug)
    ])
  );
  if (existing.rows.length > 0) {
    process.stdout.write(
      `Partners already present (${existing.rows.map((r) => r.slug).join(", ")}); nothing changed.\n`
    );
    process.exit(0);
  }

  /** @type {Record<string, { businessId: string; cookie: string }>} */
  const partner = {};
  for (const definition of PARTNERS) {
    const account = await signUp();
    const business = ok(
      await send("POST", "/businesses", {
        body: { name: definition.name, slug: definition.slug },
        cookie: account.cookie
      }),
      `business ${definition.slug}`
    ).json();
    ok(
      await send("PUT", "/auth/me/business-context", {
        body: { businessId: business.id },
        cookie: account.cookie
      }),
      "business context"
    );
    /*
     * The public identity trio PRD-0005 owns. Without a short description the
     * Offering page shows a name and nothing else, which is a thin page rather
     * than a wrong one — but a partner with no description is not what the
     * catalogue will look like, and a demo that flatters itself is not a demo.
     */
    ok(
      await send("PUT", `/businesses/${business.id}/information`, {
        body: { name: definition.name, shortDescription: definition.short },
        cookie: account.cookie
      }),
      "business information"
    );
    partner[definition.slug] = {
      businessId: business.id,
      cookie: account.cookie
    };
  }

  /* ── the offerings ─────────────────────────────────────────────────────── */
  for (const product of PRODUCTS) {
    for (const offer of product.offers) {
      const seller = partner[offer.partner];
      if (seller === undefined)
        throw new Error(`UNKNOWN_PARTNER_${offer.partner}`);

      const slug = `${product.key.toLowerCase()}-${offer.partner}`;
      const draft = ok(
        await send("POST", `/businesses/${seller.businessId}/offerings`, {
          body: {
            categoryId: categoryId[product.category],
            slug,
            title: product.title
          },
          cookie: seller.cookie
        }),
        `draft ${slug}`
      ).json();

      const pricing = product.onRequest
        ? { kind: "ON_REQUEST", stockState: offer.stock }
        : {
            amount: offer.amount,
            currency: "TRY",
            deliveryCost: offer.delivery,
            kind: "FIXED",
            priorAmount: offer.prior,
            stockState: offer.stock
          };

      /*
       * I66. The heading's own fields, resolved from stable keys to the
       * identifiers the write path takes.
       *
       * The applicable set is read back from the draft rather than assumed,
       * which is what `editableOfferingContentSchema` exists for: the
       * definitions that apply and the options they offer are answered at one
       * instant against one Category, so a form — or a script — cannot supply a
       * value for a definition that stopped applying between two requests.
       */
      const editable = ok(
        await send(
          "GET",
          `/businesses/${seller.businessId}/offerings/${draft.id}/content`,
          { cookie: seller.cookie }
        ),
        `applicable ${slug}`
      ).json();
      const attributes = attributeValues(
        editable.applicableAttributes,
        product.values ?? {},
        slug
      );

      ok(
        await send(
          "PUT",
          `/businesses/${seller.businessId}/offerings/${draft.id}/content`,
          {
            body: {
              attributes,
              categoryId: categoryId[product.category],
              pricing,
              productKey: product.key,
              summary: product.summary,
              title: product.title
            },
            cookie: seller.cookie
          }
        ),
        `content ${slug}`
      );

      ok(
        await send(
          "POST",
          `/businesses/${seller.businessId}/offerings/${draft.id}/publication`,
          { cookie: seller.cookie }
        ),
        `publish ${slug}`
      );

      /*
       * The Affiliate Destination, and the three Admin acts that make a handoff
       * eligible. `composeHandoffEligibility` needs `ENABLED` *and* `VALID`, so
       * authoring an address is not enough — a demo that skipped the review
       * would show a button that cannot be pressed.
       */
      ok(
        await send(
          "POST",
          `/businesses/${seller.businessId}/offerings/${draft.id}/affiliate-destination`,
          {
            body: {
              reference: `https://${offer.partner}.example.test/urun/${product.key.toLowerCase()}`
            },
            cookie: seller.cookie
          }
        ),
        `destination ${slug}`
      );
      const admin = `/admin/offerings/${draft.id}/affiliate-destination`;
      ok(
        await send("POST", `${admin}/review`, {
          body: { note: "Demo verisi." },
          cookie: operator.cookie
        }),
        "review"
      );
      ok(
        await send("POST", `${admin}/validation`, {
          body: { result: "VALID" },
          cookie: operator.cookie
        }),
        "validation"
      );
      ok(
        await send("POST", `${admin}/enablement`, { cookie: operator.cookie }),
        "enablement"
      );

      created += 1;
      process.stdout.write(`  ${product.title} — ${offer.partner}\n`);
    }
  }

  process.stdout.write(
    `\nDemo: ${String(PARTNERS.length)} partner, ${String(PRODUCTS.length)} ürün, ` +
      `${String(created)} yayımlanmış ilan.\n` +
      `Operator: ${operator.email} / ${PASSWORD}\n`
  );
} finally {
  await app.close();
  await workerPool.end();
  await pool.end();
}
