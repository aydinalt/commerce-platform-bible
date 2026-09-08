import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isApiUnavailable } from "../../api-error";
import { readFavourites } from "../../discovery/favourites";
import { AUTH_ROUTES, SESSION_COOKIE } from "../../identity/session";
import { handoffFromCard } from "../decision/actions";
import { ListingCards } from "../discovery/listing-card";
import { ServiceUnavailable } from "../service-unavailable";

import { NAV } from "../shell-copy";

import { keepFavourite, releaseFavourite } from "./actions";

import type { Metadata } from "next";

/*
 * The title is the same word the header entry carries, read from one place. I51
 * caught the failure this avoids: the same fact in two languages sixty lines
 * apart, because one of them was a literal nothing else read.
 */
export const metadata: Metadata = { title: NAV.favourites };

/// What a person kept changes whenever they keep something, so nothing here
/// may be prerendered.
export const dynamic = "force-dynamic";

/**
 * Favorilerim (I64).
 *
 * The header entry the Owner's prototype has carried since its first version,
 * with the page behind it.
 *
 * **The cards are drawn from today's cheapest seller of each kept product**,
 * not from the listing that happened to be on screen when the heart was
 * pressed. That is the whole point of keeping a product rather than a listing:
 * somebody who saved a phone at 45.000 and comes back to find it at 41.000 has
 * been told something useful, and one who is shown the old figure has been told
 * something false.
 *
 * `unavailable` is stated rather than hidden. A person who saved twelve things
 * and is shown ten deserves to know why, and "two of the things you saved are
 * not listed right now" is the honest sentence — the rows are still theirs, and
 * a listing published tomorrow brings them back.
 */
export default async function FavouritesPage() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  // A favourite is a fact about a person. There is nothing here for a Guest to
  // see, so they are sent to sign in rather than shown an empty page.
  if (session === undefined) redirect(AUTH_ROUTES.login);

  let kept;
  try {
    kept = await readFavourites(session);
  } catch (error) {
    /*
     * The Discovery failure surface is not reusable here: it re-offers the
     * criteria a person was searching with, and this page has none. The shell's
     * own unavailable state says the one true thing — the platform could not
     * answer — without inventing a Discovery context to recover into.
     */
    if (!isApiUnavailable(error)) throw error;
    return <ServiceUnavailable retryPath="/favourites" />;
  }

  const marks = new Set(
    kept.cards.map((card) => card.productKey ?? card.offeringId)
  );

  return (
    <main className="block">
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <h1 className="mb-6 border-b-2 border-border-strong pb-2 text-2xl font-semibold text-text">
          {NAV.favourites}
        </h1>

        {kept.cards.length === 0 ? (
          <section className="rounded-md border border-dashed border-border-strong p-6">
            <p role="status">Henüz favorilerinize bir ürün eklemediniz.</p>
            <p>
              İlanlardaki <span aria-hidden="true">♡</span> düğmesiyle
              beğendiklerinizi buraya ekleyebilirsiniz.
            </p>
          </section>
        ) : (
          <ListingCards
            cards={kept.cards}
            favourites={{
              from: "/favourites",
              keepAction: keepFavourite,
              kept: marks,
              releaseAction: releaseFavourite
            }}
            handoffAction={handoffFromCard}
          />
        )}

        {kept.unavailable === 0 ? null : (
          <p className="favourites-note">
            Kaydettiğiniz {kept.unavailable} ürün şu anda hiçbir satıcıda
            listelenmiyor. Kayıtlarınızdan silinmedi; yeniden listelendiğinde
            burada görünecek.
          </p>
        )}
      </section>
    </main>
  );
}
