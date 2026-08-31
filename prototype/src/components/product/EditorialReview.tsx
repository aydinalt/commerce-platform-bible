import { fullDate } from "@/lib/format";
import type { Product } from "@/lib/types";

/**
 * The long-form review — the tab a search engine indexes.
 *
 * **The two dates are the point of the header.** A comparison site's editorial
 * content ages faster than anything else on it: prices move weekly and a
 * verdict written against last quarter's prices is wrong without looking
 * wrong. So the publication date and the revision date are both printed, in
 * full, above the prose rather than in small grey type at the bottom — and
 * they are separate values, because "written in March, checked last week" and
 * "written in March" are different claims.
 *
 * The structure — verdict, score, headed sections, an explicit pros and cons
 * list — is what makes this readable to a person scanning and parseable to a
 * crawler. Neither reads a wall of text.
 */
export function EditorialReview({ product }: { product: Product }) {
  const { editorial } = product;

  return (
    <article className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-500">
        <span>
          <span className="text-slate-400">Yayımlanma:</span>{" "}
          <time dateTime={editorial.publishedAt}>
            {fullDate(editorial.publishedAt)}
          </time>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>
          <span className="text-slate-400">Son güncelleme:</span>{" "}
          <time
            className="font-medium text-slate-700"
            dateTime={editorial.updatedAt}
          >
            {fullDate(editorial.updatedAt)}
          </time>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>{editorial.author}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-900 text-white">
          <span className="text-xl font-bold tabular-nums leading-none">
            {editorial.score.toFixed(1)}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-300">
            /10
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Editör görüşü
          </h3>
          <p className="mt-1 text-[17px] font-medium leading-snug text-slate-900">
            {editorial.verdict}
          </p>
        </div>
      </div>

      {editorial.video === null ? null : (
        <figure className="mt-6">
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-900">
            <div className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-2xl text-white"
              >
                ▶
              </span>
              <p className="mt-3 px-6 text-sm font-medium text-white">
                {editorial.video.title}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {editorial.video.duration}
              </p>
            </div>
          </div>
          <figcaption className="mt-2 text-[12px] text-slate-500">
            Video inceleme. Prototipte yer tutucudur; yayında gömülü oynatıcı
            gelir.
          </figcaption>
        </figure>
      )}

      {editorial.sections.map((section) => (
        <section className="mt-7" key={section.heading}>
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            {section.heading}
          </h3>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
            {section.body}
          </p>
        </section>
      ))}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Beğendiklerimiz
          </h3>
          <ul className="mt-3 space-y-2">
            {editorial.pros.map((entry) => (
              <li
                className="flex gap-2 text-[14px] leading-relaxed text-slate-700"
                key={entry}
              >
                <span aria-hidden="true" className="text-emerald-700">+</span>
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-rose-800">
            Eksileri
          </h3>
          <ul className="mt-3 space-y-2">
            {editorial.cons.map((entry) => (
              <li
                className="flex gap-2 text-[14px] leading-relaxed text-slate-700"
                key={entry}
              >
                <span aria-hidden="true" className="text-rose-700">−</span>
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-slate-500">
        Bu inceleme bağımsız olarak hazırlanmıştır. Sayfadaki satıcı
        bağlantılarından yapılan alışverişlerden komisyon kazanılabilir; bu,
        ürünün değerlendirmesini veya sıralamasını etkilemez.
      </p>
    </article>
  );
}
