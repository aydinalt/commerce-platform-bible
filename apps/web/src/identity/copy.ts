import { CONTEXTS, CREDENTIALS, TERMS } from "../vocabulary";

/**
 * Every word UX-0008's six surfaces say, in Turkish, in one module.
 *
 * These screens were written in English and marked `lang="en"` while the root
 * document declared `lang="tr"` and the public journey was Turkish — so a
 * person who searched for a listing in Turkish and then signed in changed
 * language mid-journey, which reads as having left the platform.
 *
 * **Extracted rather than inlined, and that is the point.** §9.2 of the design
 * foundation says real multi-language support needs "every user-visible string
 * extracted, across 22 routes". Doing the extraction *as* the translation means
 * i18n later swaps what this module returns instead of touching every route a
 * second time. Following `decision/copy.ts`, which established the shape.
 *
 * **Nothing here decides anything.** These are words for outcomes the API
 * already determined; a sentence in this file cannot grant or refuse access.
 */

/** Page titles, which are also what a browser tab and a bookmark show. */
export const TITLES = {
  account: "Hesabınız",
  confirm: "Hesabınızı tamamlayın",
  login: "Giriş yapın",
  recover: "Parolanızı sıfırlayın",
  register: "Hesap oluşturun",
  reset: "Yeni parola belirleyin"
} as const;

/**
 * The two credential fields, named from the shared vocabulary so they cannot
 * drift between the register form and the recovery form.
 */
export const FIELDS = CREDENTIALS;

/**
 * Submit labels, and the one word shown while a submission is in flight.
 *
 * `Gönderiliyor…` rather than a spinner alone: I9 established that a state a
 * person cannot hear is a state they do not have, and a button whose label
 * changes is announced.
 */
export const ACTIONS = {
  createAccount: "Hesap oluştur",
  enterAdmin: `${CONTEXTS.admin}na gir`,
  login: "Giriş yap",
  logout: "Çıkış yap",
  manage: (business: string) => `${business} işletmesini yönet`,
  pending: "Gönderiliyor…",
  sendLink: "Bağlantı gönder",
  setPassword: "Yeni parolayı kaydet"
} as const;

/**
 * The sentences that move a person between the six screens.
 *
 * Each names where it goes rather than saying "buraya tıklayın", because a link
 * whose text is its destination is the one a screen reader can read out of
 * context.
 */
export const LINKS = {
  alreadyRegistered: "Zaten hesabınız var mı?",
  newHere: "İlk defa mı geliyorsunuz?",
  register: "Hesap oluşturun",
  registerAgain: "yeniden kayıt olabilirsiniz",
  rememberedIt: "Hatırladınız mı?",
  requestNewLink: "yeni bir bağlantı isteyin",
  reset: "Sıfırlayın",
  forgot: "Parolanızı mı unuttunuz?",
  login: "Giriş yapın"
} as const;

/**
 * What the account screen offers (UX-0008 §8.1).
 *
 * The first option is *doing nothing*, stated rather than implied: a person who
 * signed in is not obliged to enter any context, and a screen that only listed
 * ways in would be pressing.
 */
export const ACCOUNT = {
  adminHeading: "Platform yönetimi",
  baselineHeading: "Gezinmeye devam edin",
  businessesHeading: `${TERMS.business}leriniz`,
  inAdminContext: `${CONTEXTS.admin}ndasınız.`,
  /* Split because the sentence wraps a link. Both halves live here so the
     whole sentence can be re-worded — or translated — without opening the
     page. */
  keepBrowsingBefore: "Giriş yaptınız. Başka bir bağlama girmeden",
  noBusiness: `Sahibi olduğunuz bir ${TERMS.business} yok.`,
  publicSite: "herkese açık siteyi kullanmaya devam edebilirsiniz"
} as const;

/**
 * What is said after a submission the API accepted.
 *
 * Both are deliberately non-committal about whether an account exists. The
 * recovery sentence says "if that address has an account" because confirming
 * one would let anybody test an address against the platform, and the
 * registration sentence tells a person the work is not finished — the most
 * common way an account is lost is somebody assuming it is.
 */
export const SENT = {
  recovery:
    "Bu adrese ait bir hesap varsa, yeni parola belirleme bağlantısı yola çıktı.",
  registration:
    "E-postanızı kontrol edin. Gönderdiğimiz bağlantıyı açmadan kayıt tamamlanmaz."
} as const;

/**
 * The refusals.
 *
 * Each says what happened and what did **not** change, because the second half
 * is what stops a person guessing. A failed context entry leaving the account
 * untouched is UX-0008 §14's requirement, and saying so is how they learn it.
 */
export const REFUSALS = {
  contextRefused: "Bu bağlama girilemedi. Hiçbir şey değişmedi.",
  linkUnusable: "Bu bağlantı artık kullanılamıyor.",
  tokenUnusable: "Bu onay bağlantısı artık kullanılamıyor."
} as const;
