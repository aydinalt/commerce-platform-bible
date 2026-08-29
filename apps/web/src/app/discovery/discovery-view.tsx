import type {
  BrowseViewResponse,
  SearchViewResponse
} from "@commerce/contracts";

import type { AppliedFilterInput } from "@commerce/contracts";

import type { PreparationContext } from "../../discovery/entry";
import {
  leavePreparation,
  narrowSearch,
  selectCategory,
  widenSearch
} from "../actions";

import { FilterControls } from "./filter-controls";
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
    // Named, because a page may hold two of these — children and ancestors —
    // and a landmark list of two unlabelled "navigation" entries tells
    // somebody moving by landmark nothing about which is which.
    <nav aria-labelledby={`category-nav-${heading}`} className="entry-nav">
      <h2 id={`category-nav-${heading}`}>{heading}</h2>
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

/**
 * Narrowing a Search through the active Category hierarchy (UX-0002 §7.2).
 *
 * Offered when the API says the query reaches more than one leaf, which is the
 * only condition under which narrowing means anything. Each choice is a
 * submission for the reason every Discovery control here is: a Category chosen
 * by being linked to could be chosen by a prefetch.
 *
 * §6 makes this explicitly *not* a Browse Discovery Start, and the action keeps
 * the path identifier so it does not become one.
 */
function SearchNarrowing({
  categories,
  narrowed
}: {
  categories: { id: string; name: string }[];
  narrowed: boolean;
}) {
  if (categories.length === 0 && !narrowed) return null;
  return (
    <nav aria-labelledby="search-narrowing" className="entry-nav">
      <h2 id="search-narrowing">Kategoriye göre daralt</h2>
      <form action={narrowSearch}>
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
      {narrowed ? (
        <form action={widenSearch}>
          <button type="submit">Kategori daraltmasını kaldır</button>
        </form>
      ) : null}
    </nav>
  );
}

export function SearchResultsView({
  applied = [],
  view
}: {
  applied?: readonly AppliedFilterInput[];
  view: SearchViewResponse;
}) {
  return (
    <main>
      <section>
        <h1 className="results-heading">“{view.query}” için sonuçlar</h1>

        <SearchNarrowing
          categories={view.narrowing}
          narrowed={view.categoryId !== null}
        />

        {/* §9.1 again, and `US-DSC-F04-001` AC-6 is the gate: Filters become
            available once the Search is narrowed to one active leaf. Before
            that the API offers none and there is nothing to show. */}
        <FilterControls applied={applied} filters={view.filters} />

        {view.results.length === 0 ? (
          <NothingMatched query={view.query} />
        ) : (
          <ListingCards cards={view.results} />
        )}
      </section>
    </main>
  );
}

/**
 * The Compare-preparation return, stated rather than implied
 * (`US-DSC-F10-001`).
 *
 * A person who arrived this way is looking for a second Offering inside one
 * leaf, and the page says so: the constraint is visible, and so is the way out
 * of it. AC-7 makes leaving clear the context, which is why the exit is a
 * submission and not a link back.
 *
 * Nothing here adds a member to a Comparison Set or claims Compare Start —
 * AC-6 — and there is no control through which it could.
 */
function PreparationNotice({
  preparation
}: {
  preparation: PreparationContext;
}) {
  return (
    <section className="preparation-notice">
      <p role="status">
        Karşılaştırma için bu kategoriden ikinci bir ilan seçiyorsunuz.
      </p>
      <form action={leavePreparation}>
        <input name="categoryId" type="hidden" value={preparation.categoryId} />
        <button type="submit">Karşılaştırma hazırlığından çık</button>
      </form>
    </section>
  );
}

export function BrowseResultsView({
  applied = [],
  preparation,
  view
}: {
  applied?: readonly AppliedFilterInput[];
  preparation?: PreparationContext | undefined;
  view: BrowseViewResponse;
}) {
  return (
    <main>
      <section>
        <h1 className="results-heading">{view.category.name}</h1>

        {preparation === undefined ? null : (
          <PreparationNotice preparation={preparation} />
        )}

        {/* `US-DSC-F03-001` AC-5 and AC-7: a branch withholds Results rather
            than gathering its descendants', so what a person sees here is the
            way further down, not a summary of everything below.

            While a preparation return is in force, AC-2 constrains the context
            to that one leaf, so the ways out of it are withheld — not disabled
            and not hidden behind a refusal, simply not offered. */}
        {preparation === undefined ? (
          <CategoryChoices
            categories={view.children}
            heading="Alt kategoriler"
          />
        ) : null}

        {/* UX-0002 §9.1. Offered on a leaf and absent on a branch, which is a
            property of what the API returned rather than a decision made here.
            They stay available inside a preparation return: §9 does not except
            it, and narrowing a leaf is exactly what somebody looking for a
            second Offering to compare is doing. */}
        <FilterControls applied={applied} filters={view.filters} />

        {/* AC-8. Inside the constraint the ordinary rules still apply: the same
            eligibility, the same Listing Cards, the same ordering and the same
            Zero Results statement. Nothing about this view is special except
            what it leaves out. */}
        {view.results === null ? null : view.results.length === 0 ? (
          <NothingMatched query={null} />
        ) : (
          <ListingCards cards={view.results} />
        )}

        {preparation === undefined ? (
          <CategoryChoices
            categories={view.ancestors}
            heading="Üst kategoriler"
          />
        ) : null}
      </section>
    </main>
  );
}
