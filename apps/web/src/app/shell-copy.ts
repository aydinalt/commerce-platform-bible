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
 * **`ScorBurn`, and it is a literal on purpose.** This used to read
 * `${TERMS.offering}lar` — the domain word for a listing, pluralised — with a
 * note saying that naming the product here would be this file deciding what it
 * is called. That was right while the platform had no name. The Owner gave it
 * one on 2026-09-03, so the name is now recorded rather than derived: a product
 * name is not a description of its contents, and deriving it from the
 * vocabulary would rename the company every time the vocabulary moved.
 *
 * The distinction matters in `FOOTER`, where some sentences meant *the company*
 * and others meant *listings*. They looked identical while the two words were
 * the same and had to be told apart when they stopped being.
 */
export const BRAND = {
  home: "Ana sayfa",
  name: "ScorBurn",
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
  /// I64. The Owner's prototype has had this entry in the header since its
  /// first version; offered only to somebody signed in, because a favourite is
  /// a fact about a person and a Guest has none.
  favourites: "Favorilerim",
  label: "Ana gezinme",
  login: "Giriş yap",
  register: "Kayıt ol"
} as const;

/**
 * The footer.
 *
 * ~~Deliberately almost empty~~ — **it says what the platform is not
 * responsible for**, on the Owner's instruction of 2026-09-03.
 *
 * A comparison platform that prints somebody else's price has to say who is
 * answerable for it, and the four notes below are each a limit rather than a
 * decoration: the information is gathered with care and is not guaranteed, the
 * seller is the authority on price and specification, an error here does not
 * make this platform a party to what follows, and nobody trading on this name
 * is connected to it.
 *
 * **The wording is ours.** The Owner supplied a competitor's notice as the
 * shape he wanted; a disclaimer copied verbatim would name that company's
 * obligations and its business, which is both wrong and a claim about somebody
 * else's legal position.
 *
 * **The links still go nowhere, and that is stated rather than hidden.** R4 of
 * the release criteria names the KVKK documents and none is written. A footer
 * that linked to an absent privacy policy would make exactly the promise this
 * footer exists to avoid, so the pages are *named* as pending and the KVKK note
 * says what is true today: personal data is processed for the service and the
 * document that explains it is on its way. When those pages exist, the names
 * here become links and nothing else changes.
 */
export const FOOTER = {
  /**
   * The obligations, in the order a person meets them: what the information is
   * worth, who to check it with, what happens if it is wrong, and who is not us.
   */
  notes: [
    "Sitemizdeki bilgiler özenle derlenir; yine de tüm bilgilerin eksiksiz ve güncel olduğu garanti edilemez.",
    `Fiyatlar ve ürün özellikleri satıcı tarafından belirlenir ve değişebilir; satın almadan önce satıcının sayfasından doğrulayın. ${TERMS.offering} listelerinde her satıcı yer almayabilir.`,
    `${BRAND.name}, içerikteki eksik veya hatalı bilgilerden ve bunlara dayanarak yapılan işlemlerden doğabilecek zararlardan sorumlu tutulamaz. Alışveriş, satıcı ile aranızdaki bir işlemdir.`,
    `${BRAND.name} adını veya logosunu kullanarak kampanyalı satış yaptığını öne süren site, ilan ve mesajların bu platformla ilişkisi yoktur.`,
    "Kişisel verileriniz 6698 sayılı KVKK kapsamında yalnızca hizmetin sunulması amacıyla işlenir. Aydınlatma metni hazırlanmaktadır; yayımlandığında bu bölümden ulaşabileceksiniz."
  ],
  /** Named rather than linked: see the note above. */
  pending:
    "Hazırlanıyor: KVKK Aydınlatma Metni · Gizlilik Politikası · Çerez Politikası · Kullanım Koşulları",
  /**
   * The year range is fixed text rather than a computed one: a computed year
   * differs between the server render and the client, which React reports as a
   * mismatch, and a copyright line is not worth a hydration error.
   */
  rights: `Copyright © 2014-2026 ${BRAND.name}. Tüm hakları saklıdır.`
} as const;
