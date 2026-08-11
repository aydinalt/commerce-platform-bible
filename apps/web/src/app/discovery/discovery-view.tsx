import type {
  BrowseViewResponse,
  SearchViewResponse
} from "@commerce/contracts";

import { selectCategory } from "../actions";

import { ListingCards } from "./listing-card";

/**
 * What Discovery shows once criteria have been submitted.
 *
 * The component is pure: everything it renders was decided by the API. It
 * performs no matching, no ordering and no eligibility judgement of its own,
 * which is what makes `US-DSC-F06-001` AC-1 hold here — Results contain what
 * the projection contained, and the projection only ever held Offerings whose
 * final Offering Public Eligibility is Eligible.
 *
 * It also reads no principal, so AC-8 holds the same way Home's does: there is
 * nothing in this markup that could differ by role.
 */

function CategoryChoices({
  categories,
  heading
}: {
  categories: { id: string; name: string }[];
  heading: string;
}) {
  if (categories.length === 0) return null;
  return (
    <nav>
      <h2>{heading}</h2>
      {/* Selecting stays a submission, exactly as it is on Home: a Category
          chosen by being linked to could be chosen by a prefetch. */}
      <form action={selectCategory}>
        <ul className="category-choices">
          {categories.map((category) => (
            <li key={category.id}>
              <button name="categoryId" type="submit" value={category.id}>
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </form>
    </nav>
  );
}

function NothingMatched({ query }: { query: string | null }) {
  return (
    <section className="zero-results">
      {/* `US-DSC-F08-001` AC-2 in the flesh: the statement is that nothing
          matched, and the criteria stay visible rather than being quietly
          dropped. AC-8 forbids filling the space with anything else, so the
          space stays empty. */}
      <p role="status">
        {query === null
          ? "Bu kategoride uygun bir ilan bulunamadı."
          : `“${query}” için uygun bir ilan bulunamadı.`}
      </p>
      <p>
        <a href="/">Ana sayfaya dönün</a> ya da başka bir kategori seçin.
      </p>
    </section>
  );
}

export function SearchResultsView({ view }: { view: SearchViewResponse }) {
  return (
    <main>
      <section>
        <h1>“{view.query}” için sonuçlar</h1>
        {view.results.length === 0 ? (
          <NothingMatched query={view.query} />
        ) : (
          <ListingCards cards={view.results} />
        )}
      </section>
    </main>
  );
}

export function BrowseResultsView({ view }: { view: BrowseViewResponse }) {
  return (
    <main>
      <section>
        <h1>{view.category.name}</h1>

        {/* `US-DSC-F03-001` AC-5 and AC-7: a branch withholds Results rather
            than gathering its descendants', so what a person sees here is the
            way further down, not a summary of everything below. */}
        <CategoryChoices categories={view.children} heading="Alt kategoriler" />

        {view.results === null ? null : view.results.length === 0 ? (
          <NothingMatched query={null} />
        ) : (
          <ListingCards cards={view.results} />
        )}

        <CategoryChoices
          categories={view.ancestors}
          heading="Üst kategoriler"
        />
      </section>
    </main>
  );
}
