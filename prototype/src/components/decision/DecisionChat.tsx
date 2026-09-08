"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ageLabel } from "@/lib/filter";
import { lira, stars } from "@/lib/format";
import { categoryById, subcategoryById } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * The Decision Chat, on the results page.
 *
 * **This is the one capability the platform already has that a price
 * comparison site normally does not.** Filters answer *which of these is
 * cheapest*; nothing else on the page answers *which of these do I need* — and
 * that is the question a person actually arrives with. Akakçe and Epey both
 * leave it unanswered.
 *
 * Three rules from PRD-0004 are visible in this component rather than only
 * true of it, because they are the rules that make it trustworthy:
 *
 * 1. **The Category is chosen before the chat starts.** The Decision Context is
 *    established by the filter bar above — or by the address, on a category
 *    page — and the chat then narrows *inside* it. It cannot wander into
 *    another category mid-conversation and recommend something the criteria
 *    were never applied to.
 * 2. **The chat executes nothing.** It narrows and explains; the person
 *    selects. There is no path from a reply straight to a merchant, which is
 *    the difference between a guide and an advertisement.
 * 3. **This conversation only.** No profile, no earlier session, nothing
 *    carried between flows — and the panel says so, because a person deciding
 *    how candid to be deserves to know what is being kept.
 *
 * **Scripted, not a model.** The shipped version calls the vendor-agnostic
 * chat port; this one is a decision tree over the products actually on screen,
 * so the shape can be judged without an API key and without spending anything.
 * Every answer below is computed from the catalogue, never written by hand.
 *
 * ## Where the first question comes from
 *
 * The Category is a precondition, not a question. Once it is set, **this panel
 * asks nothing about it — it reads the Category's headings and offers exactly
 * those.** Choosing "Sigorta Hizmetleri" above means question one is already a
 * list of kasko, trafik, DASK and the rest; there is no second place to pick a
 * category and therefore no way for the two to disagree.
 *
 * That is also why the taxonomy lives on the Category (`Category.children`)
 * rather than in this file. A heading list written here would be a second copy
 * of the catalogue's own structure, and the copy is the thing that goes stale.
 *
 * ## Why question one is no longer the budget
 *
 * It used to be "Bütçeniz hangi aralıkta?", which asked a second time for
 * something the page had already been told. **The budget is set in the filter
 * bar above, and the products handed to this component have already been
 * narrowed by it** — so a band chosen here could only ever agree with the bar
 * or contradict it, and there is no useful version of contradicting it. A
 * control that cannot disagree with another control is not a question; it is a
 * duplicate. The bar's budget now flows straight through, and the panel says
 * so rather than re-asking.
 *
 * What the question became instead is the one the catalogue could not answer
 * before: **which heading.** A Category is a section of the market — nobody
 * buys "Sigorta Hizmetleri". They buy a kasko policy, or a DASK policy, and
 * those two have nothing in common except the section they are filed under.
 * Ranking them against each other by rating and stock was arithmetic dressed
 * as advice. With headings in the catalogue the Decision Context is a leaf,
 * and the shortlist is finally a comparison of things that compete.
 */

type Priority = "ucuz" | "yeni" | "puan" | "secenek";
type Urgency = "hemen" | "beklerim";

interface Answers {
  subcategoryId: string | null;
  priority: Priority | null;
  urgency: Urgency | null;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  puan: "Kullanıcı memnuniyeti",
  secenek: "Satıcı çeşitliliği",
  ucuz: "En düşük fiyat",
  yeni: "En güncel model"
};

const URGENCY_LABELS: Record<Urgency, string> = {
  beklerim: "Birkaç gün bekleyebilirim",
  hemen: "Hemen lazım, stokta olmalı"
};

/** Why a candidate is in the shortlist, in the person's own criteria. */
function reason(product: Product, priority: Priority): string {
  if (product.pricingKind === "ON_REQUEST")
    return "Fiyat, talebinize göre belirlenir — bütçeyle karşılaştırılamaz.";
  if (priority === "ucuz")
    return `Ölçütlerinize uyan en düşük fiyat: ${lira(product.lowestPrice)}.`;
  if (priority === "yeni")
    return `${product.releaseYear} çıkışlı — ${ageLabel(product.releaseYear).toLocaleLowerCase("tr")}.`;
  if (priority === "puan")
    return `${product.rating.toFixed(1)} ortalama, ${product.reviewCount} değerlendirme.`;
  return `${product.offerCount} satıcı fiyat veriyor; en düşüğü ${lira(product.lowestPrice)}.`;
}

/** The shared chip, so a selected heading and a selected priority look alike. */
function Chip({
  children,
  count,
  disabled = false,
  onClick,
  selected
}: {
  children: React.ReactNode;
  /** Shown when the chip stands for a set of products; omitted otherwise. */
  count?: number;
  disabled?: boolean;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
        selected
          ? "border-sky-600 bg-sky-700 text-white"
          : disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      {count === undefined ? null : (
        <span
          className={`tabular-nums text-[11px] ${
            selected ? "text-sky-100" : "text-slate-400"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function DecisionChat({
  products,
  categoryId,
  amount,
  maxAmount
}: {
  /** The results currently on screen — the chat narrows these, not the whole
   *  catalogue, so its answer and the list agree. */
  products: Product[];
  categoryId: string;
  /** The budget ceiling from the bar above, reported rather than re-asked. */
  amount: number;
  /** The ceiling's ceiling, so "set" can be told from "not narrowed". */
  maxAmount: number;
}) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    priority: null,
    subcategoryId: null,
    urgency: null
  });

  const scoped = products;

  /*
   * The Decision Context is one Category, and it is set before the chat opens.
   * Offering the chat across "Tüm kategoriler" would let it compare a monitor
   * with a moisturiser, and the shortlist it produced would be arithmetic
   * rather than advice.
   */
  const contextMissing = categoryId === "all";

  /**
   * The Category whose headings question one offers.
   *
   * Read from the catalogue by the id the bar above holds — **not stored here
   * and not chosen here.** A second selector inside this panel would be two
   * controls over one fact, and on a category page it would also be a control
   * that can disagree with the URL.
   */
  const category = useMemo(
    () => (contextMissing ? null : (categoryById(categoryId) ?? null)),
    [categoryId, contextMissing]
  );

  /**
   * How many of the products on screen sit under each heading.
   *
   * Counted from `scoped`, which is the budget-narrowed list — so a heading
   * reading `0` is telling the truth about *this* budget, not about the
   * catalogue. That is the whole reason the budget is not asked for again: it
   * is already inside every number on this panel.
   */
  const headingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of scoped) {
      if (product.subcategoryId === null) continue;
      counts[product.subcategoryId] = (counts[product.subcategoryId] ?? 0) + 1;
    }
    return counts;
  }, [scoped]);

  /**
   * The chosen heading, but only while it still belongs to the Category.
   *
   * **Derived rather than cleared in an effect.** Changing the Category in the
   * bar above leaves `answers.subcategoryId` holding a heading from the old
   * one; filtering on it would find nothing and the panel would say "bu
   * ölçütlere uyan ürün yok" — a wrong answer, and a confident one, to a
   * question the person had not finished asking. Reading the answer through
   * the current Category makes the stale value unreachable instead of
   * racing an effect to erase it.
   */
  const heading =
    category?.children.some((child) => child.id === answers.subcategoryId) ===
    true
      ? answers.subcategoryId
      : null;

  const reset = () =>
    setAnswers({ priority: null, subcategoryId: null, urgency: null });

  const budgetSet = amount < maxAmount;

  const shortlist = (() => {
    if (heading === null || answers.priority === null || answers.urgency === null)
      return [];
    const candidates = scoped.filter((product) => {
      /*
       * One heading, and only that heading. This is the leaf the criteria are
       * applied to, and it is the line that makes the shortlist a comparison
       * rather than a ranking of unrelated things that share a section.
       */
      if (product.subcategoryId !== heading) return false;
      if (answers.urgency === "hemen")
        return product.offers.some((offer) => offer.stock !== null);
      return true;
    });
    const order: Record<Priority, (a: Product, b: Product) => number> = {
      puan: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      secenek: (a, b) => b.offerCount - a.offerCount,
      /*
       * Unpriced Offerings go last under "cheapest", never first. §5.10.5:
       * they have no position in a price ordering and are not silently placed
       * at either end — and a `0` would place them at the cheap end.
       */
      ucuz: (a, b) => {
        const unpricedA = a.pricingKind === "ON_REQUEST" ? 1 : 0;
        const unpricedB = b.pricingKind === "ON_REQUEST" ? 1 : 0;
        return unpricedA - unpricedB || a.lowestPrice - b.lowestPrice;
      },
      yeni: (a, b) => b.releaseYear - a.releaseYear
    };
    return [...candidates].sort(order[answers.priority]).slice(0, 3);
  })();

  const answered =
    heading !== null && answers.priority !== null && answers.urgency !== null;

  const chosenHeading = heading === null ? null : subcategoryById(heading);

  /** Headings with nothing under them right now, so the panel can say so. */
  const emptyHeadings =
    category === null
      ? 0
      : category.children.filter((child) => (headingCounts[child.id] ?? 0) === 0)
          .length;

  return (
    <section
      aria-labelledby="karar-sohbeti-baslik"
      className="mx-auto mt-6 max-w-7xl px-4"
    >
      <div className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/50">
        <button
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-sky-50"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-700 text-sm font-bold text-white"
          >
            ?
          </span>
          <span className="min-w-0 flex-1">
            <span
              className="block text-[15px] font-semibold text-slate-900"
              id="karar-sohbeti-baslik"
            >
              Hangisini almalıyım?
            </span>
            <span className="block text-[13px] text-slate-600">
              Üç soruyla, ekrandaki ürünler içinden size uyanları daraltalım.
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>

        {!open ? null : (
          <div className="border-t border-sky-200 px-5 py-5">
            {contextMissing || category === null ? (
              /*
                Not a failure message — a missing precondition, named. The
                Decision Context is one Category, and the honest answer to
                "which should I buy?" across the whole catalogue is that the
                question has not been asked yet.
              */
              <p className="text-[15px] text-slate-700">
                Önce yukarıdan bir kategori seçin. Karar sohbeti tek bir
                kategori içinde çalışır — çünkü iki kategoriyi karşılaştıran bir
                öneri, aslında hiçbir şeyi karşılaştırmamış olur. Kategoriyi
                seçtiğinizde o kategorinin başlıkları buraya kendiliğinden
                gelir.
              </p>
            ) : (
              <>
                <p className="mb-4 text-[13px] text-slate-500">
                  <strong className="font-semibold text-slate-700">
                    {category.name}
                  </strong>{" "}
                  içinde {scoped.length} ürün
                  {budgetSet ? (
                    <>
                      , yukarıdaki{" "}
                      <strong className="font-semibold text-slate-700">
                        {lira(amount)} bütçe sınırı
                      </strong>{" "}
                      uygulanmış hâlde.{" "}
                    </>
                  ) : (
                    <> — bütçe sınırı uygulanmıyor. </>
                  )}
                  Bütçeyi yukarıdaki çubuktan değiştirdiğinizde bu panel de,
                  aşağıdaki liste de birlikte değişir; burada ikinci kez
                  sorulmamasının sebebi bu. Bu sohbet yalnızca bu oturum
                  içindir; hiçbir yanıtınız hesabınıza veya başka bir akışa
                  taşınmaz.
                </p>

                {/* ------------------------------------------- question one */}
                <div className="mb-4">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    1. Hangi başlıkta ürünü görmek istersin?
                  </p>

                  {/*
                    A labelled group, not a bare row of buttons.

                    Three sets of chips sit in this panel and they answer three
                    different questions. Without the labels a screen reader
                    reads them as one long run of toggles, and the count on a
                    heading chip — which only means something as "how many
                    listings are under this heading" — becomes a loose number
                    beside a word.
                  */}
                  <div
                    aria-label="Başlıklar"
                    className="flex flex-wrap gap-2"
                    role="group"
                  >
                    {category.children.map((child) => {
                      const count = headingCounts[child.id] ?? 0;
                      return (
                        <Chip
                          count={count}
                          disabled={count === 0}
                          key={child.id}
                          onClick={() =>
                            setAnswers((current) => ({
                              ...current,
                              subcategoryId: child.id
                            }))
                          }
                          selected={heading === child.id}
                        >
                          {child.name}
                        </Chip>
                      );
                    })}
                  </div>

                  {/*
                    An empty heading is shown rather than hidden, and the count
                    says why. Hiding it would make the taxonomy look smaller
                    than it is and leave a person unable to tell "no listings
                    yet" apart from "we do not cover this" — which are opposite
                    answers to the question they came with.
                  */}
                  {emptyHeadings === 0 ? null : (
                    <p className="mt-2 text-[12px] text-slate-500">
                      Soluk görünen {emptyHeadings} başlıkta{" "}
                      {budgetSet
                        ? "bu bütçe sınırında listelenecek ilan yok"
                        : "henüz ilan yok"}
                      . Başlık duruyor, altı boş — kapsam dışı olduğu için
                      değil.
                    </p>
                  )}
                </div>

                {/* ------------------------------------------- question two */}
                <div className="mb-4">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    2. Sizin için hangisi daha önemli?
                  </p>
                  <div
                    aria-label="Öncelikler"
                    className="flex flex-wrap gap-2"
                    role="group"
                  >
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((key) => (
                      <Chip
                        key={key}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, priority: key }))
                        }
                        selected={answers.priority === key}
                      >
                        {PRIORITY_LABELS[key]}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* ----------------------------------------- question three */}
                <div className="mb-5">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    3. Ne zaman lazım?
                  </p>
                  <div
                    aria-label="Aciliyet"
                    className="flex flex-wrap gap-2"
                    role="group"
                  >
                    {(Object.keys(URGENCY_LABELS) as Urgency[]).map((key) => (
                      <Chip
                        key={key}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, urgency: key }))
                        }
                        selected={answers.urgency === key}
                      >
                        {URGENCY_LABELS[key]}
                      </Chip>
                    ))}
                  </div>
                </div>

                {/* ------------------------------------------- the shortlist */}
                {!answered ? (
                  <p className="text-[13px] text-slate-500">
                    Üç soruyu da yanıtlayın; öneriler burada görünecek.
                  </p>
                ) : shortlist.length === 0 ? (
                  /*
                    Zero candidates is an answer, and it keeps the criteria on
                    screen rather than clearing them — the same rule the Zero
                    Results surface follows.
                  */
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[15px] text-slate-800">
                      Bu ölçütlere uyan ürün yok.
                    </p>
                    <p className="mt-1 text-[13px] text-slate-600">
                      Yukarıdaki bütçe sınırını genişletmeyi, başka bir başlık
                      seçmeyi ya da &ldquo;hemen lazım&rdquo; koşulunu
                      kaldırmayı deneyin.
                    </p>
                    <button
                      className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={reset}
                      type="button"
                    >
                      Yanıtları temizle
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3 text-[15px] text-slate-800">
                      <strong className="font-semibold">
                        {category.name} › {chosenHeading?.name}
                      </strong>{" "}
                      başlığında ölçütlerinize göre{" "}
                      <strong className="font-semibold">
                        {shortlist.length} ürün
                      </strong>{" "}
                      öne çıkıyor. Seçim sizin — aşağıdaki hiçbir düğme sizin
                      yerinize bir şey satın almaz.
                    </p>
                    <ul className="space-y-2">
                      {shortlist.map((product, index) => (
                        <li
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                          key={product.id}
                        >
                          <span
                            aria-hidden="true"
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-[12px] font-bold text-white"
                          >
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[15px] font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-[13px] text-slate-600">
                              {reason(product, answers.priority!)}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-slate-500">
                              <span aria-hidden="true" className="text-amber-500">
                                {stars(product.rating)}
                              </span>
                              <span className="tabular-nums">
                                {product.rating.toFixed(1)}
                              </span>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span>{product.releaseYear} modeli</span>
                              <span aria-hidden="true" className="text-slate-300">
                                ·
                              </span>
                              <span>{product.offerCount} satıcı</span>
                            </p>
                          </div>
                          <Link
                            className="shrink-0 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 sm:w-40"
                            href={`/urun/${product.slug}`}
                          >
                            Bu ürünü incele
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      onClick={reset}
                      type="button"
                    >
                      Yanıtları temizle
                    </button>
                  </div>
                )}

                <p className="mt-4 border-t border-sky-200 pt-3 text-[12px] leading-relaxed text-slate-500">
                  Bu öneriler yalnızca ekrandaki ürünler, yukarıdaki bütçe sınırı
                  ve verdiğiniz üç yanıt üzerinden hesaplanır. Sizin adınıza bir
                  satın alma yapılmaz ve hiçbir satıcıya öncelik tanınmaz.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
