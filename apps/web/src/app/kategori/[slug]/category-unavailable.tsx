import { categoryPath } from "../../../seo";

/**
 * What a Category address shows when the API could not answer.
 *
 * **An outage is not an empty Category**, and §8A.3 makes the difference matter:
 * a Category with no eligible Offerings states that as a fact, so a failed read
 * presented the same way would be a false statement about the catalogue — at an
 * address a search engine indexes and then believes. UX-0002 §14 requires the
 * separation for Discovery; this is the same rule at a permanent address, where
 * the wrong answer is durable rather than momentary.
 *
 * **Retrying is a link to this same address**, where the Offering route's
 * equivalent needs a form. There the concern is an occurrence: re-fetching a
 * Presentation produces `Offering Presentation Open`, so a prefetched link
 * would record an open nobody performed. Here §8A.4 makes arrival record
 * nothing at all, so a link is both safe and honest — it is the address the
 * person already asked for.
 */
export function CategoryUnavailable({ slug }: { slug: string }) {
  return (
    <main>
      <section aria-labelledby="category-unavailable-heading">
        <h1 id="category-unavailable-heading">Kategori şu anda açılamadı</h1>

        {/* `role="status"` rather than `alert`: this is a temporary condition
            being reported, not a failure demanding attention — and the sentence
            says which of the two it is, because "bulunamadı" would claim the
            Category is empty. */}
        <p role="status">
          Bu kategori geçici olarak görüntülenemiyor. Birazdan tekrar
          deneyebilirsiniz.
        </p>

        <p>
          <a href={categoryPath(slug)}>Tekrar dene</a> ya da{" "}
          <a href="/">ana sayfaya dönün</a>.
        </p>
      </section>
    </main>
  );
}
