import Link from "next/link";

import { CATEGORIES, PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * The cross-sell card, under the specification highlights.
 *
 * **Three decisions here are not cosmetic, and each has a cost if reversed.**
 *
 * 1. **It is labelled.** A comparison site's entire product is that the
 *    ordering is honest; an unlabelled promotion inside a product page spends
 *    that trust to buy a click. The marker is small and calm — `İş birliği` —
 *    but it is always there, and it is not negotiable in the way the copy is.
 *    Turkish advertising rules require commercial communication to be
 *    identifiable as such; this is also simply the truth.
 * 2. **It links into our own category, not straight to a merchant.** The
 *    person came here to compare. Sending them off-site from a card they did
 *    not ask for skips the only thing this site does better than the merchant
 *    — and the commission is earned at the Handoff either way, so the honest
 *    path costs nothing. Where a direct partner deal exists, `href` is the one
 *    line to change.
 * 3. **It renders nothing when it has nothing to say.** No mapping for this
 *    category, or a paired category with no listings in it, and the card does
 *    not appear. An advert that leads to an empty page is worse than no advert
 *    — it teaches a person that this part of the screen is noise.
 *
 * Sized to the specification list beside it: 13 px body, 11 px label, the same
 * `rounded-lg`/`border-slate-200` the surrounding blocks use. It is a card in
 * the page's own language rather than a banner dropped into it.
 */

interface CrossSell {
  /** The category this points at. Must exist in `CATEGORIES`. */
  to: string;
  title: string;
  body: string;
  cta: string;
  icon: keyof typeof ICONS;
}

/**
 * The pairing table.
 *
 * Read it as *what does a person need **next**, having decided this* — not as
 * *what else do we sell*. The difference shows: a car needs cover, a new flat
 * needs an alarm, a hosting plan needs the skill to use it. Each pair is a
 * sentence that would make sense said out loud to the person.
 *
 * Insurance is the target four times, and that is not laziness — it is the
 * classic complement, because four of these categories create an asset that
 * can be lost.
 */
const CROSS_SELL: Record<string, CrossSell> = {
  automotive: {
    body: "En uygun kasko ve trafik sigortası tekliflerini saniyeler içinde karşılaştırın.",
    cta: "Teklif İste",
    icon: "shield",
    title: "Aracınızı Güvenceye Alın",
    to: "insurance"
  },
  beauty: {
    body: "Bakım rutininizi evde tamamlayan cihaz ve akıllı çözümleri inceleyin.",
    cta: "Fırsatları Gör",
    icon: "home",
    title: "Rutininizi Evde Tamamlayın",
    to: "home"
  },
  education: {
    body: "Öğrendiklerinizi uygulayacağınız yazılım ve yapay zekâ araçlarını karşılaştırın.",
    cta: "Araçları İncele",
    icon: "spark",
    title: "Öğrendiğinizi Uygulayın",
    to: "software"
  },
  electronics: {
    body: "Cihazınızı hasar ve hırsızlığa karşı koruyan poliçeleri karşılaştırın.",
    cta: "Teklif İste",
    icon: "shield",
    title: "Cihazınızı Koruma Altına Alın",
    to: "insurance"
  },
  finance: {
    body: "Yatırım kararlarınızı bilgiyle vermek için finans eğitimlerine göz atın.",
    cta: "Eğitimleri İncele",
    icon: "book",
    title: "Kararlarınızı Bilgiyle Verin",
    to: "education"
  },
  gaming: {
    body: "Oyun deneyiminizi yükseltecek ekran, kulaklık ve çevre birimlerini karşılaştırın.",
    cta: "Donanımı Gör",
    icon: "chip",
    title: "Donanımınızı Yükseltin",
    to: "electronics"
  },
  home: {
    body: "Yangın, hırsızlık ve su baskınına karşı konut sigortası tekliflerini karşılaştırın.",
    cta: "Teklif İste",
    icon: "shield",
    title: "Evinizi Güvenceye Alın",
    to: "insurance"
  },
  insurance: {
    body: "Poliçenizi tamamlayan periyodik bakım ve araç hizmetlerine göz atın.",
    cta: "Hizmetleri Gör",
    icon: "wrench",
    title: "Bakımı da Planlayın",
    to: "automotive"
  },
  realestate: {
    body: "Evinizin güvenliği için akıllı alarm ve yaşam sistemlerini inceleyin.",
    cta: "Fırsatları Gör",
    icon: "home",
    title: "Yeni Evinize Akıllı Çözümler",
    to: "home"
  },
  software: {
    body: "Bu aracı en iyi şekilde kullanmak için web geliştirme eğitimlerine göz atın.",
    cta: "Eğitimleri İncele",
    icon: "book",
    title: "Yazılım Becerilerinizi Geliştirin",
    to: "education"
  },
  travel: {
    body: "Gecikme, iptal ve sağlık masraflarını kapsayan seyahat sigortalarını karşılaştırın.",
    cta: "Teklif İste",
    icon: "shield",
    title: "Yolculuğunuzu Güvenceye Alın",
    to: "insurance"
  }
};

/**
 * Inline paths, not an icon package.
 *
 * Six shapes do not justify a dependency, and a promotional card is the last
 * place that should pull in a library — it is also the first place an ad
 * blocker looks. `currentColor` so the icon inherits the card's tone.
 */
const ICONS = {
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5.5A1.5 1.5 0 0 1 4 18.5v-13Zm2 .5v11h12V6H6Zm2 2h8M8 11h8M8 14h5",
  chip: "M8 8h8v8H8V8Zm-2-2h12v12H6V6Zm3-3v3m3-3v3m3-3v3M9 18v3m3-3v3m3-3v3M3 9h3m-3 3h3m-3 3h3m12-6h3m-3 3h3m-3 3h3",
  home: "M4 11.5 12 4l8 7.5M6 10.5V20h12v-9.5M10 20v-5h4v5",
  shield: "M12 3.5 5 6.2v5.1c0 4.3 2.9 8.2 7 9.2 4.1-1 7-4.9 7-9.2V6.2L12 3.5Zm-2.6 8.4 1.9 1.9 3.6-3.6",
  spark: "M12 3.5 13.8 9l5.7 1.9-5.7 1.9L12 18.3l-1.8-5.5L4.5 10.9 10.2 9 12 3.5ZM19 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z",
  wrench:
    "M15.5 4.5a4.5 4.5 0 0 0-4.1 6.3L4.6 17.6a1.5 1.5 0 0 0 2.1 2.1l6.8-6.8a4.5 4.5 0 0 0 5.7-5.7l-2.6 2.6-2.3-.6-.6-2.3 2.6-2.6a4.5 4.5 0 0 0-.8-.1Z"
} as const;

export function CrossSell({ product }: { product: Product }) {
  const pair = CROSS_SELL[product.categoryId];
  if (pair === undefined) return null;

  const target = CATEGORIES.find((category) => category.id === pair.to);
  if (target === undefined) return null;

  /*
   * Counted, not assumed. An advert that leads to an empty category teaches a
   * person that this part of the screen is noise, and they stop reading it —
   * including the times it is useful.
   */
  const listings = PRODUCTS.filter(
    (candidate) => candidate.categoryId === target.id
  ).length;
  if (listings === 0) return null;

  return (
    <aside
      aria-label="İş birliği içeriği"
      className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700 ring-1 ring-slate-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.7}
            viewBox="0 0 24 24"
          >
            <path d={ICONS[pair.icon]} />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          {/*
            The marker. Small, but never absent and never styled to disappear:
            a promotion a person cannot tell from the page's own content is the
            one thing this site cannot afford to ship.
          */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            İş birliği · {target.name}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-900">
            {pair.title}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
            {pair.body}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            {listings} ilan karşılaştırılıyor
          </p>

          <Link
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-sky-800"
            href={`/?kategori=${target.id}`}
          >
            {pair.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
