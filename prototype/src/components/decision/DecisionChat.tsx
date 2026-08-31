"use client";

import { useState } from "react";
import Link from "next/link";

import { ageLabel } from "@/lib/filter";
import { lira, stars } from "@/lib/format";
import { categoryById } from "@/lib/products";
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
 * 1. **Exactly one Category.** The Decision Context is one leaf, so the chat
 *    cannot wander into another category mid-conversation and recommend
 *    something the criteria were never applied to.
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
 */

type Priority = "ucuz" | "yeni" | "puan" | "secenek";
type Urgency = "hemen" | "beklerim";

interface Answers {
  band: [number, number] | null;
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

/** Three price bands derived from the products actually in scope. */
function bands(products: Product[]): { label: string; range: [number, number] }[] {
  // Unpriced Offerings have no position in a price band, so they do not shape
  // one either — including a zero would drag every band's floor to nothing.
  const prices = products
    .filter((product) => product.pricingKind === "FIXED")
    .map((product) => product.lowestPrice)
    .sort((a, b) => a - b);
  const low = prices[0] ?? 0;
  const high = prices[prices.length - 1] ?? 0;
  const third = Math.round((high - low) / 3);
  if (third < 1) return [{ label: "Fark etmez", range: [0, Number.MAX_SAFE_INTEGER] }];
  return [
    { label: `${lira(low)} – ${lira(low + third)}`, range: [0, low + third] },
    {
      label: `${lira(low + third)} – ${lira(low + third * 2)}`,
      range: [low + third, low + third * 2]
    },
    { label: `${lira(low + third * 2)} ve üzeri`, range: [low + third * 2, high] }
  ];
}

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

export function DecisionChat({
  products,
  categoryId
}: {
  /** The results currently on screen — the chat narrows these, not the whole
   *  catalogue, so its answer and the list agree. */
  products: Product[];
  categoryId: string;
}) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Answers>({
    band: null,
    priority: null,
    urgency: null
  });

  const category = categoryById(categoryId);
  const scoped = products;
  const priceBands = bands(scoped);

  const reset = () => setAnswers({ band: null, priority: null, urgency: null });

  /*
   * The Decision Context is one Category. Offering the chat across "Tüm
   * kategoriler" would let it compare a monitor with a moisturiser, and the
   * shortlist it produced would be arithmetic rather than advice.
   */
  const contextMissing = categoryId === "all";

  const shortlist = (() => {
    if (answers.band === null || answers.priority === null || answers.urgency === null)
      return [];
    const [low, high] = answers.band;
    const candidates = scoped.filter((product) => {
      /*
       * A budget band cannot include or exclude something with no amount, so
       * an On Request Offering stays a candidate on every band — and its
       * reason line says why it has no figure beside it.
       */
      if (product.pricingKind === "FIXED") {
        if (product.lowestPrice < low || product.lowestPrice > high) return false;
      }
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
    answers.band !== null && answers.priority !== null && answers.urgency !== null;

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
            {contextMissing ? (
              /*
                Not a failure message — a missing precondition, named. The
                Decision Context is one Category, and the honest answer to
                "which should I buy?" across the whole catalogue is that the
                question has not been asked yet.
              */
              <p className="text-[15px] text-slate-700">
                Önce bir kategori seçin. Karar sohbeti tek bir kategori içinde
                çalışır — çünkü iki kategoriyi karşılaştıran bir öneri, aslında
                hiçbir şeyi karşılaştırmamış olur.
              </p>
            ) : (
              <>
                <p className="mb-4 text-[13px] text-slate-500">
                  <strong className="font-semibold text-slate-700">
                    {category?.name}
                  </strong>{" "}
                  içinde {scoped.length} ürün. Bu sohbet yalnızca bu oturum
                  içindir; hiçbir yanıtınız hesabınıza veya başka bir akışa
                  taşınmaz.
                </p>

                {/* ------------------------------------------- question one */}
                <div className="mb-4">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    1. Bütçeniz hangi aralıkta?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {priceBands.map((band) => {
                      const chosen =
                        answers.band?.[0] === band.range[0] &&
                        answers.band[1] === band.range[1];
                      return (
                        <button
                          aria-pressed={chosen}
                          className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                            chosen
                              ? "border-sky-600 bg-sky-700 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                          }`}
                          key={band.label}
                          onClick={() =>
                            setAnswers((current) => ({
                              ...current,
                              band: band.range
                            }))
                          }
                          type="button"
                        >
                          {band.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ------------------------------------------- question two */}
                <div className="mb-4">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    2. Sizin için hangisi daha önemli?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((key) => (
                      <button
                        aria-pressed={answers.priority === key}
                        className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                          answers.priority === key
                            ? "border-sky-600 bg-sky-700 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                        key={key}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, priority: key }))
                        }
                        type="button"
                      >
                        {PRIORITY_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ----------------------------------------- question three */}
                <div className="mb-5">
                  <p className="mb-2 text-[15px] font-medium text-slate-900">
                    3. Ne zaman lazım?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(URGENCY_LABELS) as Urgency[]).map((key) => (
                      <button
                        aria-pressed={answers.urgency === key}
                        className={`rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors ${
                          answers.urgency === key
                            ? "border-sky-600 bg-sky-700 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                        }`}
                        key={key}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, urgency: key }))
                        }
                        type="button"
                      >
                        {URGENCY_LABELS[key]}
                      </button>
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
                      Bütçeyi genişletmeyi ya da "hemen lazım" koşulunu
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
                      Ölçütlerinize göre{" "}
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
                  Bu öneriler yalnızca ekrandaki ürünler ve verdiğiniz üç yanıt
                  üzerinden hesaplanır. Sizin adınıza bir satın alma yapılmaz ve
                  hiçbir satıcıya öncelik tanınmaz.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
