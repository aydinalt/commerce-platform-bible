<!--
Owner:        Architecture Owner
Status:       Draft — a description of what exists, not a specification
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# Surface inventory — every screen, section, field, action and state

**Extracted from the code at `eed2a0c`, not designed here.** Every Turkish
string below is a verbatim literal from `apps/web/src`; every field name comes
from `generated/openapi.json`; every action comes from a contract enum. Nothing
in this document is aspirational.

## How to read it

- **Quoted Turkish** — the exact words on screen today. Change them in
  `copy.ts`, not in a design file.
- **`code`** — a field the API returns or a route the application serves.
- **[state]** — a screen state that exists in code and must be designed.
- **⚠︎** — something a designer will look for and **will not find**, because it
  is not built. Do not design around it as if it were.

There are **22 routes**: 9 public, 6 identity, 5 Business, 7 Admin (the account
page is counted once under identity). One shell wraps all of them.

---

# 0 — The shell, on every route

## 0.1 Header (`site-header`), 3.25rem tall

| Element | Content |
|---|---|
| Skip link | "İçeriğe geç" — hidden until keyboard focus, must be first |
| Brand | "İlanlar" — links to `/` from every page |
| Nav, signed out | "Giriş yap" · "Kayıt ol" |
| Nav, signed in | "Hesabım" |

**A hard rule from UX-0008 §5:** the header must **never** name the Admin or
Business context. Whether somebody is in a privileged context is invisible here,
deliberately — a header that said "Yönetici" would be a way of testing whether an
authorization exists. A test enforces this.

## 0.2 Footer (`site-footer`)

"İlanlar — bir ilan ve karar platformu"

## 0.3 Three states any route can show

| State | Heading | Body |
|---|---|---|
| Not found | "Bu sayfa bulunamadı" | + "Ana sayfaya dön" |
| Uncaught error | "Bir şeyler ters gitti" | "Beklenmedik bir sorun oldu ve bu sayfa çizilemedi." · "Kaydettikleriniz bundan etkilenmedi." · "Destek için not edin" *(Next.js digest)* · "Tekrar dene" · "Ana sayfaya dön" |
| Loading | "Yükleniyor" | "İstediğiniz sayfa hazırlanıyor." — **only on `/compare` and `/decision`** |
| Dependency unavailable | "Bu sayfa şu anda yüklenemedi" | + a retry link back to the same address |

⚠︎ There is no toast, no snackbar, no modal, no drawer and no tooltip anywhere
in the application. Every message is inline, in `role="alert"` or
`role="status"`.

---

# 1 — Public surfaces (no account needed)

## 1.1 `/` — Home

| Section | Content |
|---|---|
| Prompt | "Bugün ne yapmak istiyorsunuz?" |
| Search entry | one text input + button "Ara" |
| Divider | "Ya da bir kategoriden başlayın" |
| Category list | root Categories, grouped by Domain |
| [empty] | "Şu anda açık bir kategori yok." |
| [unavailable] | "Kategoriler şu anda getirilemedi. Arama kullanılabilir durumda." |

**The empty and the unavailable states say different things and must look
different.** The first is a fact about the catalogue; the second is a fact about
this request.

## 1.2 `/discovery` — Results (Browse and Search share it)

| Section | Content |
|---|---|
| Heading | "Sonuçlar" |
| Criteria row | the query, the Category path, applied Filters — always visible |
| Category navigation | "Üst kategoriler" / "Alt kategoriler" |
| Filters | one control per filterable Attribute; boolean shows "Farketmez" / "Var" / *(yok)* |
| Results | a grid of Listing Cards |
| [zero results] | "«{sorgu}» için uygun bir ilan bulunamadı." with the criteria **still shown** |
| [recovery] | a bounded set of actions only — no free-form suggestions |

### The Listing Card — `ListingCard`

`primaryVisualUrl` (cover image, may be absent) · `title` · `businessName` ·
`categoryName` · `publishedAt` · links to `/offerings/{slug}`

⚠︎ There is **no** price, no location, no rating, no favourite, no "new" badge
and no sort control. None of these exists in the datamodel. A card design that
shows a price will have nothing to fill it with.

## 1.3 `/offerings/{slug}` — Offering Presentation

`OfferingPresentation`: `title` · `description` · `visuals` (an ordered list;
the first is the cover) · `categoryPath` · `business` · `attributes` ·
`publishedAt`

| Section | Content |
|---|---|
| Attributes | label / value pairs. A value that no longer exists reads "Artık sunulmayan bir değer"; an unset one reads "Belirtilmemiş" |
| Business | public identity only — name, short description, logo |
| Decision entries | presented, **not executed**: two ways forward |
| [absent] | a `404` — says nothing about whether it was retired or moderated |
| [unavailable] | the dependency-unavailable panel |

⚠︎ No comments, no seller ratings, no "similar offerings", no share button, no
report button. The only report path is the platform's own moderation, which a
visitor cannot open.

## 1.4 `/compare` — Comparison

| State | Content |
|---|---|
| [no set] | "Henüz karşılaştırmaya bir ilan eklemediniz. Bir ilanı açıp karşılaştırmaya ekleyebilirsiniz." |
| [fewer than two] | "Karşılaştırma için en az iki ilan gerekiyor." + the members so far |
| [openable] | a table: first column "Özellik", one column per Offering |
| [ended] | "Karşılaştırma oturumunuz sona erdi. Yeniden başlayabilirsiniz." |
| [unavailable] | the dependency-unavailable panel |

A set holds Offerings from **one leaf Category only**. On a phone the table
stacks into per-Offering blocks rather than scrolling sideways.

## 1.5 `/decision` — the Decision flow

The densest screen in the product. Sections, in order:

| Section | Content |
|---|---|
| [invalid context] | "Devam edilemiyor" + one of: "Bu ilan artık yayında değil." / "Karşılaştırma artık geçerli değil." + bounded repairs: "Başka bir ilan seçin" · "Karşılaştırmayı düzeltin" · "Karardan çıkın" |
| Members | "Karar verdiğiniz ilan" *(one)* or "Karşılaştırdığınız ilanlar" *(several)* |
| Per member | title, business, and either "Bu ilanı seçin" or "Seçildi" + "Seçimi kaldırın" |
| Selection prompt | "Devam etmeden önce bir ilan seçin." |
| [selection lost] | "Seçtiğiniz ilan artık uygun değil, bu yüzden seçim kaldırıldı. Hiçbir işlem tamamlanmadı." |
| Chat | input "Sizin için önemli olan", plus two standing statements below |
| Chat boundary | "Sohbet ilandaki bilgileri açıklar ve karşılaştırmanıza yardım eder. Sizin yerinize seçim yapmaz, iletişimi başlatmaz ve ilanda yazmayan bir bilgiyi söylemez." |
| Chat memory | "Bu sohbet yalnızca şu anki karar akışına aittir. Kaydedilmez." |
| Handoff | "Nasıl devam etmek istersiniz?" → "İşletmenin sitesine gidin" · "İşletmeyle doğrudan iletişime geçin" |
| [no affiliate] | "Bu ilan için site üzerinden devam etme yolu şu anda kullanılabilir değil." |
| [no channel] | "Bu işletme doğrudan iletişim bilgisi paylaşmamış. Platformda mesaj gönderilebilecek bir yer yok." |
| [needs account] | "Doğrudan iletişim bilgisini görmek için giriş yapmanız gerekiyor. Giriş yaptıktan sonra tam olarak buraya dönersiniz." |
| [resumed] | "Kaldığınız yerden devam edebilirsiniz: seçtiğiniz iletişim yolu aşağıda hazır." |
| [completed — affiliate] | "Bu ilan için işletmenin sitesine yönlendirildiniz. Orada ne olduğunu platform bilmez." |
| [completed — contact] | "Bu ilan için iletişim bilgisi size gösterildi. İletişime geçip geçmediğinizi platform bilmez." |
| After either | "Karar yolculuğunuz burada bitiyor." |
| [expired] | "Bu karar akışının süresi doldu." |

Channels: "E-posta" · "Telefon" · "İnternet sitesi".

**Chat refusals are content, not errors** — design them as answers:
"Bu soru ilanda yazanlardan yanıtlanamadı. İlanda olmayan bir bilgiyi uydurmak
yerine söylememeyi seçiyoruz."

⚠︎ Chat has no history, no thread list, no attachments, no streaming indicator.
It is one question and one answer, per flow.

---

# 2 — Identity (`auth` scope — one narrow column, one card)

Every one of these is a single short form. Shared field labels:
"E-posta adresi" · "Parola".

| Route | Title | Action | Links | States |
|---|---|---|---|---|
| `/login` | "Giriş yapın" | "Giriş yap" | "Parolanızı mı unuttunuz? Sıfırlayın" · "İlk defa mı geliyorsunuz? Hesap oluşturun" | refusal, throttled |
| `/register` | "Hesap oluşturun" | "Hesap oluştur" | "Zaten hesabınız var mı? Giriş yapın" | sent, refusal, throttled |
| `/register/confirm` | "Hesabınızı tamamlayın" | — | "yeniden kayıt olabilirsiniz" | "Bu onay bağlantısı artık kullanılamıyor." |
| `/recover` | "Parolanızı sıfırlayın" | "Bağlantı gönder" | "Hatırladınız mı? Giriş yapın" | sent, throttled |
| `/recover/reset` | "Yeni parola belirleyin" | "Yeni parolayı kaydet" | "yeni bir bağlantı isteyin" | "Bu bağlantı artık kullanılamıyor." |

**After registration:** "E-postanızı kontrol edin. Gönderdiğimiz bağlantıyı
açmadan kayıt tamamlanmaz."
**After recovery:** "Bu adrese ait bir hesap varsa, yeni parola belirleme
bağlantısı yola çıktı."

**Two security properties a design must not break.** The sign-in refusal names
neither the address nor the password. Recovery says *"bu adrese ait bir hesap
varsa"* whether or not one exists. Both messages are load-bearing — an
"e-posta bulunamadı" state would leak who has an account.

## 2.6 `/account` — "Hesabınız" (`workspace` scope)

The one screen that offers contexts. Sections:

| Section | Content |
|---|---|
| [refused] | "Bu bağlama girilemedi. Hiçbir şey değişmedi." |
| Baseline | "Gezinmeye devam edin" — "Giriş yaptınız. Başka bir bağlama girmeden **herkese açık siteyi kullanmaya devam edebilirsiniz**." |
| Businesses | one entry per owned Business, each an explicit button |
| Admin | "Platform yönetimi" — shown only where the authorization exists |
| Sign out | "Çıkış yap" |

**Entering a context is an act, never automatic.** Even somebody with exactly
one Business and Admin rights lands in neither until they press something.

---

# 3 — Business owner surfaces (`workspace` scope)

## 3.1 `/businesses/{id}` — Dashboard

`BusinessDashboard`: `business` + `inventory`.

| Section | Content |
|---|---|
| Header | the Business name, and its moderation state if restricted |
| Correction notices | any open notice, each linking to its bounded edit |
| Create | "İlan oluştur" — "Başlık", "Adres", button "Oluştur" |
| Inventory | grouped by lifecycle, in this order: **"Taslak" · "Yayında" · "Gizli" · "Arşivlenmiş"** |
| Per Offering | title, address, eligibility, and only the actions currently permitted |
| [empty group] | "Burada bir şey yok." |
| [restricted] | create is withheld; only Drafts may be edited |

**Publication feedback names shortfalls without redefining the minimum** — the
platform supplies the list of what is missing, and the screen relays it.

## 3.2 `/businesses/{id}/information` — Business Information

Two groups, and the split is the point:

| Group | Fields |
|---|---|
| "Herkese açık kimlik" | `name` · `shortDescription` · `logoUrl` |
| "Doğrudan iletişim" | `contactEmail` · `contactTelephone` · `contactUrl` |

Submit "Kaydet". The contact group is **never public** — it is revealed only
through a Direct Contact completion, to a signed-in person, once.

## 3.3 `/businesses/{id}/offerings/{id}` — Offering content

`EditableOfferingContent`: `title` · `summary` · `attributes` ·
`applicableAttributes` · `visuals` · `status` · `version`

| Section | Content |
|---|---|
| Heading | "İlan içeriği" |
| Visuals | "Görsel adresleri" — "Her satıra bir adres. İlk satır, ilanın kapak görselidir." |
| Attributes | "Nitelikler" — one control per applicable Attribute, typed by its value kind |
| [no summary] | "Özet yok." |
| Saved | "Kaydedildi." |
| Refusals | e.g. "Bu değişiklik kaydedilmedi: ilanı yayında kalmak için gerekenlerin altında bırakırdı." · "Bu ilan arşivlendi ve artık düzenlenemiyor." |

⚠︎ Visuals are **addresses typed into a textarea**. There is no upload, no
drag-and-drop, no image picker and no crop. Designing an uploader would design a
capability that does not exist.

## 3.4 `/businesses/{id}/offerings/{id}/destination` — Affiliate Destination

`AffiliateDestination`: `reference` · `status` · `validationResult` ·
`validationReason` · `handoffEligibility` · `version`

| Field | Label |
|---|---|
| Address | "Adres" |
| Status | "Durum" |
| Validation | "Kontrol" — "Bu adresi henüz kimse denetlemedi." / "Denetlendi ve geçerli. Açılabilir." |
| Handoff | "Yönlendirme" — "Denetim bekliyor" / "Açılmaya hazır" |

Saved: "Kaydedildi. Karar yeniden platformundur." An Archived Offering's
destination is **view-only** — a record, not a control.

## 3.5 `/businesses/{id}/corrections/{id}` — answering a correction

| Content |
|---|
| "Bu bildirim ilanın tek bir bölümünü soruyor ve burada yalnızca o bölüm değiştirilebilir." |
| The one editable area, and nothing else |
| Saved: "Kaydedildi. Vaka açık kalır ve platform yeniden inceler." |
| "Bu değişikliği yapmak vakayı kapatmaz. Platform yeniden inceler." |
| [none] "Düzeltme bildiriminiz yok." |
| [stale] "Bu düzeltme artık buradan yanıtlanamıyor. Geri dönüp bildirimi yeniden açın." |

---

# 4 — Admin surfaces (`workspace` scope)

Reached only through `/account` → "Platform yönetimi", and only with an Admin
context explicitly entered. Without it the API answers `403`.

## 4.1 `/admin` — Panel

| Section | Content |
|---|---|
| Title | "Platform yönetimi" |
| Functions | "Burada yapabilecekleriniz" — only those the person actually holds |
| Analytics | "İnsanlar ne yaptı" |
| Period | "Analitik dönemi": "Bugün" · "Son 7 gün" · "Son 30 gün" · "Tüm zamanlar" |
| Sign out | "Oturumu kapat" |

**Functions**: "İlan moderasyonu" · "İşletme moderasyonu" · "Hesap erişimi" ·
"Düzeltme iste" · "Moderasyon vakaları" · "Yönlendirme adresleri" ·
"Kategoriler" · "Nitelik tanımları" · "İlan geçmişi"

**Six core-flow indicators**, each broken down by Domain (Emlak · Ulaşım ·
Teknoloji) and an "Genel" total:

| Indicator |
|---|
| "Keşif başlatıldı" |
| "İlan açıldı" |
| "Karşılaştırma başlatıldı" |
| "Karar Sohbeti başlatıldı" |
| "Adrese yapılan devir" |
| "İletişim bilgisi gösterildi" |

Plus "Açık vakalar, hedefe göre". Empty: "Kayda geçen bir şey yok."
Unavailable: an analytics failure must **not** take the whole panel down.

⚠︎ There are no charts. Analytics is counts in a table, by design — the
datamodel holds no time series.

## 4.2 `/admin/moderation-cases` — Queue

| Element | Content |
|---|---|
| Title | "Moderasyon vakaları" |
| Filter | "Vaka durumu": "Açık" / "Kapalı" |
| Grouping | "Şu anda eylem bekleyenler" and an informational group |
| Per case | target type, "açılış" date, status |
| [empty] | "Bu filtreye uyan vaka yok." |
| [unavailable] | "Vakalar yüklenemedi." |

Targets: "İlan" · "İşletme" · "Kullanıcı hesabı".

## 4.3 `/admin/moderation-cases/{id}` — One case

**The seven actions, and only these seven** (`MODERATION_ACTION_VALUES`):

| Action | Label | What it does |
|---|---|---|
| `REQUEST_CORRECTION` | "Düzeltme iste" | "Hiçbir durum değişmez. İşletmeden bir şeyi düzeltmesi istenir ve vaka açık kalır." |
| `HIDE_OFFERING` | "Bu İlanı gizle" | "Yayında durumu Gizli olur." |
| `RESTORE_OFFERING` | "Bu İlanı yeniden yayına al" | "Gizli durumu Yayında olur." |
| `RESTRICT_BUSINESS` | "Bu İşletmeyi kısıtla" | "«Kısıtlama yok» durumu Kısıtlı olur." |
| `RESTORE_BUSINESS` | "Bu İşletmenin kısıtlamasını kaldır" | "Kısıtlı durumu «Kısıtlama yok» olur." |
| `SUSPEND_USER` | "Bu hesabı askıya al" | "Etkin hesap askıya alınır." |
| `REINSTATE_USER` | "Bu hesabı geri getir" | "Askıya alınmış hesap yeniden etkinleşir." |

Only the actions **valid for this target right now** are offered. When none is:
"Bu hedefe şu anda uygulanabilecek bir Genel Moderasyon eylemi yok."

| Section | Content |
|---|---|
| Actions | "Yapabilecekleriniz" |
| Record | "Kaydedilenler" — what has been applied, in order |
| Correction form | "Ne düzeltilmeli" · "Onlara ne söylenecek" · "Belirli bir bölüm değil" |
| Correction targets | "İlan içeriği" · "İşletme bilgileri" · "Doğrudan iletişim bilgileri" · "Yönlendirme adresi ayarları" |
| Content areas | "Başlık" · "Özet" · "Nitelikler" |
| No-action | "Yapılacak bir şey olmadığına karar ver" + "Neden" |
| Re-review | "Yeniden inceleme kaydet" |
| Close | "Bu vakayı kapat" |
| [closure refused] | "Bu vakada uygulanmış bir eylem ve kayda geçmiş bir işlem-yapılmadı kararı yok, bu yüzden açık kalıyor." |
| [empty] | "Henüz bir şey kaydedilmedi." |

## 4.4 `/admin/destinations` — Affiliate Destination governance

**Five actions:**

| Label | What it does |
|---|---|
| "İnceleme kaydet" | "Hiçbir şeyi değiştirmez. Birinin baktığını kaydeder." |
| "Geçerli işaretle" | "Geçerli sonucunu kaydeder. Durum olduğu yerde kalır." |
| "Geçersiz işaretle" | "Geçersiz sonucunu kaydeder. Durum olduğu yerde kalır." |
| "Aç" | "Açık duruma geçer ve devir alabilir. Geçerli bir sonuç gerektirir." |
| "Kapat" | "Kapalı duruma geçer ve devir alamaz. Denetim sonucu olduğu gibi kalır." |

Fields: "Adreste ne yanlış" · "Not (isteğe bağlı)". Unavailable:
"İş yükü yüklenemedi."

## 4.5 `/admin/categories` — Category and Domain management

| Action | Fields |
|---|---|
| "Kategori oluştur" | "Ad" · "Adres" · "Kalıcı anahtar" · "Şunun altında" (or "Hiçbiri — bu bir kök") · "Alan (yalnızca kökler)" |
| "Yeniden adlandır" | "Yeni ad" |
| "Taşı" | "Yeni üst kayıt" (or "Hiçbiri — kök yap") |
| "Kaldır" | — |

Refusals: "O üst kayıt kaldırıldı, altına yeni bir şey yerleştirilemez.
Hiyerarşi değişmedi." Unavailable: "Katalog yüklenemedi."

## 4.6 `/admin/attributes` — Attribute definitions

| Field | Label |
|---|---|
| Name | "Ad" |
| Label | "Etiket" |
| Stable key | "Kalıcı anahtar" |
| Value kind | "Değerin türü": "Serbest metin" · "Sayı" · "Evet ya da hayır" · "Listeden biri" · "Listeden birkaçı" |
| Unit | "Birim (yalnızca sayı)" |
| Options | "İzinli değerler (yalnızca listeden seçmeli türler)" + "İzinli değer ekle" |
| Applies to | "Şunlara uygulanır" |
| Properties | "Özellikler": "Yayın için zorunlu" · "Üzerinden filtrelenebilir" · "Karşılaştırmada görünür" |

Refusals: "Bu, bu alanın kabul ettiği bir değer değil. Hiçbir şey değişmedi." ·
"Bu değişiklik yapılamadı. Son onaylanmış tanım olduğu gibi duruyor."

## 4.7 Offering history

Reached from a case rather than as its own route: an Admin's read of an
Offering's past, including Archived ones.

---

# 5 — The vocabulary a designer will need as chips, badges and labels

| Set | Values |
|---|---|
| Entities | "Yönetici" · "Yönlendirme adresi" · "Nitelik" · "İşletme" · "Kategori" · "Düzeltme bildirimi" · "Alan" · "Moderasyon vakası" · "İlan" · "Kullanıcı" |
| Domains | "Emlak" · "Ulaşım" · "Teknoloji" |
| Offering lifecycle | "Taslak" · "Yayında" · "Gizli" · "Arşivlenmiş" |
| Moderation | "Kısıtlı" · "Kısıtlama yok" |
| Case status | "Açık" · "Kapalı" |
| Eligibility | "Uygun" · "Uygun değil" |
| Destination status | "Etkin" · "Kapalı durumda" |
| Validation | "Geçerli" · "Geçersiz" · "Denetlenmedi" |
| Account | "Askıda" · "Henüz belirlenmedi" · "Görünümden çıkarıldı" |
| Contexts | "Yönetici bağlamı" · "İşletme bağlamı" |

**Three states and no more.** The palette carries one accent and exactly two
state colours — attention (`--notice`) and refusal (`--critical`). There is no
success green. A design that adds one is adding a fourth thing the product does
not say.

Submit buttons always have a working label: "Ekle/Ekleniyor…" ·
"Oluştur/Oluşturuluyor…" · "Kaydet/Kaydediliyor…" · "Taşı/Taşınıyor…" ·
"Tanımla/Tanımlanıyor…" · "Yeniden adlandır/Kaydediliyor…" ·
"Gönder/Gönderiliyor…"

---

# 6 — Constraints a design must not break

These are enforced by tests; a design that violates one cannot be built without
failing the suite.

- **Contrast**: AA for every text pairing; **3:1** for any border that bounds a
  control.
- **Controls**: `min-height: 2.75rem` on button, input, select and textarea.
  Density comes from spacing and the grid, never from the tap target.
- **Focus**: a visible ring, never removed.
- **Lines, not shadows.** No `box-shadow` anywhere except the focus ring.
- **No animation.** No transitions, no keyframes.
- **Three breakpoints only**: 768px and 1120px, plus 767px as the phone side of
  the first.
- **Body text 1rem** — the size below which a phone zooms a focused input.
- **Tables stack on a phone** rather than scrolling sideways.
- **One `main` landmark per page**, and the skip link first.
- **Every page is Turkish**, `<html lang="tr">`, with no exceptions.

---

# 7 — What does not exist, so nobody designs it

⚠︎ Measured absences, not opinions:

- No **messaging** between a visitor and a Business. Direct Contact reveals a
  channel and the platform steps out.
- No **favourites**, no saved searches, no browsing history, no notifications.
- No **price**, **location**, **rating** or **review** anywhere in the datamodel.
- No **image upload** — visuals are URLs typed into a textarea.
- No **payment**, **order**, **basket** or **delivery**. Nothing is transacted.
- No **charts** in analytics; counts only.
- No **user management screen** — establishing and removing Admin authorization
  is outside the application entirely.
- No **settings page** for anything, deliberately: every governed thing has a
  Story that owns it, and a settings area is where ungoverned switches gather.
- No **legal pages** — privacy, terms and cookies do not exist as routes, and
  that is an open gap rather than a decision.
- No **dark mode**, no theme switch, no language switch.

---

# 8 — Honest boundaries of this document

- **It describes what is built, not what should be.** Several absences above are
  gaps rather than decisions; the release criteria name which.
- **The words are current as of `eed2a0c`.** They live in `copy.ts` files and a
  test asserts the site speaks one language, so a design that hard-codes them
  will drift.
- **Nobody has seen these screens rendered.** The visual layer is asserted by
  tests, not reviewed by eye.
- **The public surfaces carry component classes; the seventeen management
  surfaces got their visual system only in I48**, which is one increment old.
