import { retryDiscovery } from "../../actions";

import { retryOffering } from "./actions";

/**
 * What an opened Listing Card shows when its Presentation could not be fetched.
 *
 * UX-0002 §14, *Listing Card open error*: "Discovery context remains; Offering
 * Presentation Open does not occur; the person may retry or choose another
 * result." UX-0003 §16 says the same from the other side and adds that "entered
 * or previously selected Decision context is not silently invented".
 *
 * **Discovery context remains by this route never writing it.** The carrier
 * cookie is read on the way in and left exactly as found, so a person who
 * cannot open an Offering still has the Results they left — which is
 * `US-DSC-F09-001` AC-7, and the page it lives on already says AC-7 "matters
 * most in the case where the Offering could not be opened at all". Until now
 * that case took the whole page down.
 *
 * **`Offering Presentation Open` does not occur**, because the API produces it
 * at the moment an eligible complete Presentation is composed. Nothing was
 * composed, so there is nothing to suppress here — and nothing on this surface
 * asks again on its own.
 *
 * **No Decision or Compare action is offered**, per UX-0003 §16. Offering them
 * over an absent Presentation would be starting a Decision about an Offering
 * this application could not read.
 */
export function PresentationUnavailable({ slug }: { slug: string }) {
  return (
    <main>
      <section aria-labelledby="offering-unavailable-heading">
        <h1 id="offering-unavailable-heading">İlan şu anda açılamadı</h1>

        <p role="status">
          Sonuçlarınız korundu. Birazdan tekrar deneyebilir ya da başka bir
          sonuç seçebilirsiniz.
        </p>

        {/*
         * Both recoveries are submissions rather than links, and for two
         * different occurrences.
         *
         * A prefetched link back to this Offering would ask the API to compose
         * a Presentation, producing `Offering Presentation Open` for somebody
         * who never opened anything. A prefetched link to Discovery would
         * record a Discovery Start the same way. Neither may begin by being
         * followed.
         */}
        <form action={retryOffering}>
          <input name="slug" type="hidden" value={slug} />
          <button type="submit">Tekrar dene</button>
        </form>

        <form action={retryDiscovery}>
          <button type="submit">Sonuçlara dön</button>
        </form>
      </section>
    </main>
  );
}
