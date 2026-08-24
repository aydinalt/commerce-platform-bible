/**
 * The Frozen domain terms, in Turkish, in one place.
 *
 * The application was bilingual by accident: `<html lang="tr">` at the root,
 * Home and Discovery in Turkish, and **eighteen surfaces declaring `lang="en"`
 * and written in English** — the Business Dashboard, every Admin screen, and
 * all of authentication. A Turkish marketplace whose owners managed their
 * listings in English.
 *
 * The Owner's sequencing decision of 2026-08-21 is to consolidate on Turkish
 * first and take the multi-language decision after, so the surfaces are
 * translated one Frozen document at a time.
 *
 * **This file exists so that does not produce three vocabularies.** Translating
 * three areas independently is three chances to call an Offering something
 * different, and a person who reads *ilan* on one screen and *teklif* on the
 * next has been given two products. Single Information Owner applies to words
 * as much as to values.
 *
 * The choices here are anchored to what the already-Turkish surfaces say rather
 * than invented: Discovery, Compare and the Decision flow have said `ilan` and
 * `kategori` since I4, and those are kept.
 *
 * **Capitalised terms are Frozen concepts, not ordinary nouns.** `Offering`,
 * `Business` and `Category` carry exact definitions in PRD-0001 and the Feature
 * Registries. The Turkish keeps that weight — `İlan` in a heading is the
 * concept, not "an advertisement".
 */

/**
 * The six nouns the whole product is built from.
 *
 * Deliberately not a `Record` keyed by an English string: this is not a
 * translation table to be looked up at run time, it is the vocabulary a
 * developer reaches for while writing a screen. When i18n arrives, the message
 * catalogue replaces the *usage* of these, and the terms themselves are what
 * the Turkish catalogue is written from.
 */
export const TERMS = {
  admin: "Yönetici",
  /**
   * `Yönlendirme adresi`, not `İş ortağı bağlantısı`.
   *
   * An Affiliate Destination is the address an Offering hands a person off to,
   * and the owner's screen is about *where it goes* rather than about a
   * commercial arrangement. Naming the arrangement would also promise one the
   * platform does not model: nothing here tracks commission.
   */
  affiliateDestination: "Yönlendirme adresi",
  attribute: "Nitelik",
  business: "İşletme",
  category: "Kategori",
  /** The platform asking an owner to change something (PRD-0006). */
  correctionNotice: "Düzeltme bildirimi",
  /**
   * `Alan`, the V1 grouping of Offerings — Mobility, Real Estate, Technology.
   *
   * Admin is the first surface to name it: Home receives the Domain grouping
   * from the API and flattens it, so no Turkish screen has had to say the word
   * until now. `Sektör` was the alternative and is rejected because it claims
   * an industry classification the platform does not have — three values chosen
   * by PRD-0001 are not sectors.
   */
  domain: "Alan",
  /** A General Moderation case (PRD-0006). */
  moderationCase: "Moderasyon vakası",
  offering: "İlan",
  user: "Kullanıcı"
} as const;

/**
 * The three V1 Domains, as PRD-0001 fixes them.
 *
 * `Ulaşım` for Mobility rather than `Vasıta`. Turkish listing sites use
 * *vasıta* and it would read as familiar — but it names the vehicle, and
 * Mobility is the grouping, which will hold more than vehicles the moment
 * PRD-0001 says so. Translating the label narrower than the concept is how a
 * grouping quietly acquires a boundary nobody decided on.
 */
export const DOMAINS = {
  MOBILITY: "Ulaşım",
  REAL_ESTATE: "Emlak",
  TECHNOLOGY: "Teknoloji"
} as const;

/**
 * The two contexts a person can enter (UX-0008 §5).
 *
 * `Bağlam` rather than `mod` or `görünüm`, because entering one is a change of
 * standing rather than a change of view: what a person may *do* changes, and
 * the API re-evaluates it on every read.
 */
export const CONTEXTS = {
  admin: "Yönetici bağlamı",
  business: "İşletme bağlamı"
} as const;

/**
 * The Offering lifecycle, exactly as PRD-0001 names it.
 *
 * Four states and no fifth. `Arşivlenmiş` rather than `Silinmiş`, because
 * nothing in this platform deletes an Offering — retirement is a transition to
 * a state that is still readable by an Admin, and calling it deletion would
 * describe a capability that does not exist.
 */
export const LIFECYCLE = {
  ARCHIVED: "Arşivlenmiş",
  DRAFT: "Taslak",
  HIDDEN: "Gizli",
  PUBLISHED: "Yayında"
} as const;

/**
 * Moderation standing (PRD-0006).
 *
 * `Kısıtlı` rather than `Yasaklı` or `Askıda`: a Restricted Business keeps its
 * Offerings and keeps managing its information — the restriction is bounded and
 * the word has to be bounded with it.
 */
export const MODERATION = {
  RESTRICTED: "Kısıtlı",
  UNRESTRICTED: "Kısıtlama yok"
} as const;

/**
 * What the platform calls the person's own credentials.
 *
 * `Parola` rather than `şifre` throughout. Both are current Turkish; `parola`
 * is the term TDK and Turkish platform interfaces use for an account secret,
 * and picking one and holding it is the point of this file.
 */
export const CREDENTIALS = {
  email: "E-posta adresi",
  password: "Parola"
} as const;
