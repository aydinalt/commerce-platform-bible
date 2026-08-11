import type {
  ComparisonRow,
  ComparisonViewResponse
} from "@commerce/contracts";

import { removeFromCompare } from "./comparison-actions";

/**
 * Compare (`US-DEC-F01-001`, UX-0004).
 *
 * A table of authoritative values and nothing else. There is no highlight for
 * the lower number, no badge on the newer Offering and no summary sentence at
 * the bottom — AC-10 forbids a winner, and the surest way not to imply one is
 * to give every member the same treatment and let the person read.
 */

/**
 * One cell.
 *
 * `Not provided` appears exactly where AC-8 puts it: the Attribute applies to
 * every member, this member supplied no value, and the absence is stated
 * rather than filled with a zero, a dash of ambiguous meaning or a guess.
 */
function cell(row: ComparisonRow, index: number): string {
  const value = row.values[index];
  if (!value) return "Belirtilmemiş";
  if (row.kind === "BOOLEAN") return value.boolean ? "Var" : "Yok";
  if (row.kind === "NUMBER")
    return row.unit === null
      ? String(value.number)
      : `${String(value.number)} ${row.unit}`;
  if (row.kind === "TEXT") return value.text ?? "Belirtilmemiş";
  return value.optionLabels.join(", ");
}

export function ComparisonTable({ view }: { view: ComparisonViewResponse }) {
  return (
    <main>
      <section>
        <h1>Karşılaştırma</h1>
        <p className="category-path">{view.categoryName}</p>

        <table className="comparison">
          <thead>
            <tr>
              <th scope="col">Özellik</th>
              {view.members.map((member) => (
                <th key={member.offeringId} scope="col">
                  <a href={`/offerings/${member.slug}`}>{member.title}</a>
                  <span className="comparison-business">
                    {member.businessName}
                  </span>
                  {/* AC-5. Removing is explicit and reaches the server, which
                      is the only place that knows what the set becomes. */}
                  <form action={removeFromCompare}>
                    <input
                      name="offeringId"
                      type="hidden"
                      value={member.offeringId}
                    />
                    <button type="submit">Çıkar</button>
                  </form>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={row.attributeId}>
                <th scope="row">{row.name}</th>
                {view.members.map((member, index) => (
                  <td key={member.offeringId}>{cell(row, index)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {view.rows.length === 0 ? (
          // Every member shares one leaf, so this means the Category defines no
          // comparable Attribute — not that these Offerings cannot be compared.
          <p role="status">
            Bu kategoride karşılaştırılabilir olarak işaretlenmiş bir özellik
            yok.
          </p>
        ) : null}
      </section>
    </main>
  );
}
