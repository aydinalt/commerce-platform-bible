import { TERMS } from "../vocabulary";

/**
 * What the site itself says, as opposed to what a page says (I33).
 *
 * **Twenty-two routes existed and there was no site.** No header, no
 * navigation, no footer, no brand mark — every page a bare `<main>`, correct in
 * every rule it enforced and belonging to nothing. The Owner said so twice
 * before the measurement was taken, and was right both times: what had been
 * built was the *behaviour* of an interface, not a product surface.
 */

/**
 * The brand.
 *
 * **A word, not a mark.** There is no logo, and inventing one would be design
 * work nobody asked for on an asset that has to be right. A wordmark set in the
 * platform's own type is the honest placeholder: it identifies the site, it
 * links home from every page, and it is trivially replaced by an image when one
 * exists.
 *
 * `İlanlar` rather than a made-up name, because the platform has none. Naming
 * it here would be this file deciding what the product is called.
 */
export const BRAND = {
  home: "Ana sayfa",
  name: `${TERMS.offering}lar`,
  /** WCAG 2.4.1: a way past the header, for somebody arriving by keyboard. */
  skip: "İçeriğe geç"
} as const;

/**
 * What the document says about itself (I51).
 *
 * **The tab was never part of the Turkish consolidation.** The root layout
 * declared `title: "Commerce Platform"` and
 * `description: "Decision-completion marketplace"`, so a site whose header says
 * `İlanlar` on every page said something else in every browser tab, every
 * bookmark and every search result — and the description is the sentence a
 * search engine shows underneath the link.
 *
 * The name is not restated here. `BRAND.name` is the product's name and the
 * document title is the same name, so it is referenced rather than spelled a
 * second time: a platform with two names is what "Commerce Platform" in the tab
 * and `İlanlar` in the header already was.
 *
 * `description` is a translation of the Frozen phrase rather than a new
 * positioning claim. *Decision-completion marketplace* is what PRD-0001 calls
 * this; deciding here that it is something more appealing would be this file
 * deciding what the product promises.
 */
export const SITE = {
  description: "Kararın tamamlandığı bir ilan platformu.",
  /**
   * `%s — İlanlar`, so a page's own title comes first.
   *
   * A tab is truncated from the right, and the part that identifies *which*
   * page is the part worth keeping. The site's name second is also what makes
   * `Karar` legible among twenty open tabs.
   */
  titleTemplate: `%s — ${BRAND.name}`
} as const;

/**
 * The header's navigation, which changes with who is looking.
 *
 * **Two states and no third.** A person is either signed in or not; the header
 * does not know whether they own a Business or hold Admin authorization,
 * because finding out costs an API call on every page and the answer can change
 * between two of them. `Hesabım` leads to the one screen that does know.
 *
 * That is also the safe direction: a header that offered `Yönetici` would be
 * telling anybody who saw the markup that this account holds Admin
 * authorization, which UX-0008 §5 keeps behind an explicit context entry.
 */
export const NAV = {
  account: "Hesabım",
  label: "Ana gezinme",
  login: "Giriş yap",
  register: "Kayıt ol"
} as const;

/**
 * The footer.
 *
 * **Deliberately almost empty.** A footer is where links to pages that do not
 * exist accumulate — terms, privacy, about, help — and every one of those would
 * be a promise the platform cannot keep today. R4 of the release criteria names
 * the KVKK documents and none has an owner, so the footer says what is true and
 * links to nothing that is not there.
 */
export const FOOTER = {
  /** No year: a hard-coded one goes stale, and a computed one differs between
      the server render and the client, which React reports as a mismatch. */
  rights: `${TERMS.offering}lar — bir ilan ve karar platformu`
} as const;
