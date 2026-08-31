"use client";

import { useState } from "react";

import { fullDate, stars } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Product, Review } from "@/lib/types";

/**
 * The reviews, and the form for writing one.
 *
 * **The distribution bar earns its place.** An average of 4.1 built from
 * mostly fives and a few ones is a different product from one built entirely
 * from fours, and the single number cannot say which. Amazon, Epey and Akakçe
 * all draw this for the same reason.
 *
 * Writing a review needs an account. That is not a gate for its own sake: an
 * anonymous review cannot be moderated, corrected or removed on request, and
 * the platform already has a moderation flow that assumes an author.
 */

function Distribution({ reviews }: { reviews: Review[] }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    count: reviews.filter((review) => review.rating === star).length,
    star
  }));
  const total = Math.max(1, reviews.length);

  return (
    <div className="space-y-1.5">
      {counts.map(({ count, star }) => (
        <div className="flex items-center gap-2 text-[12px]" key={star}>
          <span className="w-10 shrink-0 tabular-nums text-slate-600">
            {star} ★
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded bg-slate-100">
            <div
              className="h-full rounded bg-amber-400"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <span className="w-6 shrink-0 text-right tabular-nums text-slate-500">
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Reviews({ product }: { product: Product }) {
  const { account, openGate } = useSession();
  const [written, setWritten] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const all = [...written, ...product.reviews];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Yorumunuza bir başlık yazın.");
      return;
    }
    if (body.trim().length < 20) {
      setError("Yorum en az 20 karakter olmalı.");
      return;
    }
    setWritten((current) => [
      {
        author: account?.name ?? "Üye",
        body: body.trim(),
        date: "2026-08-31",
        helpful: 0,
        id: `new-${current.length}`,
        rating,
        title: title.trim(),
        /*
         * A review written here is not verified, and the badge says so. The
         * platform can only mark one verified where it saw a Handoff for that
         * person on that Offering, and it saw none.
         */
        verified: false
      },
      ...current
    ]);
    setTitle("");
    setBody("");
    setRating(5);
    setDone(true);
  };

  return (
    <div className="scroll-mt-44" id="yorumlar">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* ---------------------------------------------------- the summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="text-4xl font-bold tabular-nums text-slate-900">
            {product.rating.toFixed(1)}
          </div>
          <div className="mt-1 text-lg leading-none text-amber-500">
            {stars(product.rating)}
          </div>
          <p className="mt-2 text-[13px] text-slate-500">
            {product.reviewCount} değerlendirme
          </p>
          <div className="mt-4">
            <Distribution reviews={all} />
          </div>
        </div>

        {/* ------------------------------------------------------ the list */}
        <div className="min-w-0">
          <form
            className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
            noValidate
            onSubmit={submit}
          >
            <h3 className="text-base font-semibold text-slate-900">
              Bu ürünü değerlendirin
            </h3>

            {account === null ? (
              <>
                <p className="mt-1 text-sm text-slate-600">
                  Yorum yazmak için hesabınıza giriş yapın.
                </p>
                <button
                  className="mt-3 rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-800"
                  onClick={() => openGate("login")}
                  type="button"
                >
                  Giriş yap
                </button>
              </>
            ) : (
              <>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-slate-600">Puanınız:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      aria-label={`${star} yıldız`}
                      aria-pressed={rating === star}
                      className={`text-xl leading-none transition-colors ${
                        star <= rating ? "text-amber-500" : "text-slate-300"
                      }`}
                      key={star}
                      onClick={() => setRating(star)}
                      type="button"
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="yorum-baslik"
                  >
                    Başlık
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                    id="yorum-baslik"
                    onChange={(event) => setTitle(event.target.value)}
                    type="text"
                    value={title}
                  />
                </div>

                <div className="mt-3">
                  <label
                    className="mb-1 block text-sm font-medium text-slate-700"
                    htmlFor="yorum-metin"
                  >
                    Yorumunuz
                  </label>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                    id="yorum-metin"
                    onChange={(event) => setBody(event.target.value)}
                    value={body}
                  />
                </div>

                {error === null ? null : (
                  <p
                    className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                {!done || error !== null ? null : (
                  <p className="mt-2 text-sm text-emerald-700" role="status">
                    Yorumunuz yayımlandı.
                  </p>
                )}

                <button
                  className="mt-3 rounded-lg bg-orange-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-800"
                  type="submit"
                >
                  Yorumu gönder
                </button>
              </>
            )}
          </form>

          <ul className="space-y-4">
            {all.map((review) => (
              <li
                className="rounded-2xl border border-slate-200 bg-white p-5"
                key={review.id}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {review.author.slice(0, 1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {review.author}
                  </span>
                  {review.verified ? (
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      Doğrulanmış yönlendirme
                    </span>
                  ) : null}
                  <span className="ml-auto text-[12px] text-slate-400">
                    {fullDate(review.date)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    aria-label={`${review.rating} / 5`}
                    className="text-base leading-none text-amber-500"
                  >
                    {stars(review.rating)}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {review.title}
                  </h4>
                </div>

                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                  {review.body}
                </p>

                <p className="mt-3 text-[12px] text-slate-500">
                  {review.helpful} kişi bu yorumu faydalı buldu
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
