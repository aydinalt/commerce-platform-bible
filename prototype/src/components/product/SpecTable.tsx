import type { Spec } from "@/lib/types";

/**
 * The Epey half: the full specification, grouped, with values as chips.
 *
 * **Chips rather than sentences**, which is Epey's real idea and the one most
 * often missed when people copy the look. `Sensörler: İvmeölçer, Jiroskop,
 * Pusula` is a sentence a person reads once; five chips are five things the
 * catalogue could filter on, and drawing them as chips is what makes the
 * table look like data instead of prose.
 *
 * **Groups come from the data**, so a Product with a group nobody anticipated
 * renders correctly instead of losing rows.
 *
 * **A rule per row, not a grid.** Epey draws a full grid and it is legible but
 * heavy; a single hairline under each row gives the eye the same horizontal
 * track at a fraction of the ink.
 */
export function SpecTable({ specs }: { specs: Spec[] }) {
  const groups = [...new Set(specs.map((spec) => spec.group))];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {groups.map((group) => (
        <section
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          key={group}
        >
          <h3 className="border-b border-slate-200 bg-slate-100 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-700">
            {group}
          </h3>
          <dl className="divide-y divide-slate-100">
            {specs
              .filter((spec) => spec.group === group)
              .map((spec) => (
                <div
                  className="grid grid-cols-[minmax(0,11rem)_1fr] gap-3 px-4 py-2.5"
                  key={spec.label}
                >
                  <dt className="text-[13px] text-slate-500">{spec.label}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {spec.chips.map((chip) => (
                      <span
                        className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[13px] font-medium text-slate-800"
                        key={chip}
                      >
                        {chip}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/**
 * The summary strip Epey puts above the table: the rows marked `key`.
 *
 * A sixty-row table is unreadable until somebody has said which six rows
 * matter, and that judgement belongs to the data rather than to this
 * component — so it renders what is marked and marks nothing itself.
 */
export function SpecHighlights({ specs }: { specs: Spec[] }) {
  const keys = specs.filter((spec) => spec.key).slice(0, 6);
  if (keys.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {keys.map((spec) => (
        <div
          className="rounded-lg border border-slate-200 bg-white px-3 py-2"
          key={spec.label}
        >
          <dt className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500">
            {spec.label}
          </dt>
          <dd className="mt-0.5 text-[13px] font-semibold leading-snug text-slate-900">
            {spec.chips.join(", ")}
          </dd>
        </div>
      ))}
    </dl>
  );
}
