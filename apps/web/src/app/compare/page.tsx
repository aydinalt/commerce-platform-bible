import { cookies } from "next/headers";

import {
  COMPARISON_SET_COOKIE,
  currentComparison,
  openComparison,
  readComparisonSetId
} from "../../decision/comparison";

import { ComparisonTable } from "./comparison-table";

/**
 * The Compare route.
 *
 * Opening it is what produces Compare Start, so it is never prerendered and
 * never prefetched — the same discipline the Presentation route needs, for the
 * same reason.
 *
 * A set that is not yet openable is not an error. AC-2's floor is two members,
 * and a person who has chosen one is part-way through something rather than
 * doing something wrong.
 */
export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const jar = await cookies();
  const comparisonSetId = readComparisonSetId(
    jar.get(COMPARISON_SET_COOKIE)?.value
  );

  if (comparisonSetId === null)
    return (
      <main>
        <section>
          <h1>Karşılaştırma</h1>
          <p role="status">
            Henüz karşılaştırmaya bir ilan eklemediniz. Bir ilanı açıp
            karşılaştırmaya ekleyebilirsiniz.
          </p>
        </section>
      </main>
    );

  const view = await openComparison(comparisonSetId);
  if (view) return <ComparisonTable view={view} />;

  // Not openable, or gone. The two are told apart because the second has
  // nothing left to describe.
  const set = await currentComparison(comparisonSetId);
  return (
    <main>
      <section>
        <h1>Karşılaştırma</h1>
        <p role="status">
          {set === null
            ? "Karşılaştırma oturumunuz sona erdi. Yeniden başlayabilirsiniz."
            : "Karşılaştırma için en az iki ilan gerekiyor."}
        </p>
        {set === null ? null : (
          <ul className="listing-cards">
            {set.members.map((member) => (
              <li className="listing-card" key={member.offeringId}>
                <h3>
                  <a href={`/offerings/${member.slug}`}>{member.title}</a>
                </h3>
                <p className="listing-card-facts">
                  <span>{member.businessName}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
