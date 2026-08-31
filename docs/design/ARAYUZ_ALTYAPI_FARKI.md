<!--
Owner:        Architecture Owner
Status:       Draft — Owner kararı bekliyor
Maintenance Mode: Living
Version:      0.1
Last Updated: 2026-08-31
-->

# Prototip arayüz ile kurulu altyapı arasındaki fark

Bu belge, 2026-08-31 tarihli prototipin ekranda gösterdiği her şeyi kurulu
sisteme karşı tek tek ölçer ve **neyin eklenmesi gerektiğini** sıralar.

Ölçüm iddiaya değil depoya dayanır: 39 tablo, 87 API operasyonu, 22 web rotası,
`packages/contracts/src/index.ts` ve `packages/database/prisma/schema.prisma`
okunarak çıkarıldı.

---

## Özet — üç cümle

**Prototipin altında sanılandan çok daha fazla şey var.** Arama, kategori
gezinme, nitelik filtreleri, ilan sayfası, karşılaştırma tablosu, yönlendirme
adresi ve tıklama kaydı, kimlik ve moderasyon — hepsi yazılmış ve test edilmiş
durumda.

**Eksik olan tek bir şey değil, iki tanesi.** Birincisi: bir ürünün **birden
çok satıcısı** yok — I52 fiyatı İlan'a verdi ama bir İlan hâlâ tek bir fiyat
taşıyor, oysa prototipin bütün fiyat listesi bir üründe sekiz satır gösteriyor.
İkincisi: **sosyal katman hiç yok** — puan, yorum, favori, editoryal inceleme.

**Ve bir çelişki var:** PRD-0001 v4.0 Alan kümesini açtı, ama sözleşmelerdeki
`V1_DOMAINS` hâlâ üç değerlik kapalı bir enum. Bu, dün onayladığınız belgeyle
kodun aynı fikirde olmadığı tek nokta ve ilk kapatılması gereken yer.

---

## 1. Olduğu gibi çalışan — prototipin bedavaya aldıkları

| Prototipteki | Altyapıda karşılığı | Durum |
|---|---|---|
| Arama kutusu ve sonuç listesi | `US-DSC-F02..F04`, `OfferingSearchProjection`, eşleşme seviyesi, sıralama | **Hazır** |
| Kategori açılır menüsü | `Category` ağacı, kırıntı, kardeş/alt kategori gezinme | **Hazır** |
| Sonuç kartı (başlık, işletme, kategori, görsel, tarih) | `listingCardSchema` — yedi alanın yedisi de var | **Hazır** |
| İlan sayfası (açıklama, görseller, nitelik tablosu) | `offeringPresentationSchema` | **Hazır** |
| Karşılaştırma tablosu (satır satır nitelik) | `comparisonRowSchema` — beş değer türünü de taşır | **Hazır** |
| "Güncel Fiyatı İncele" → satıcıya çıkış | `AffiliateDestination` + `AffiliateHandoff` kaydı | **Hazır** |
| Giriş / Kayıt / Çıkış | `US-IDN-F01..F09`, oturum çerezi, parola kurtarma, throttle | **Hazır** |
| Sonuç yok durumu | `zeroResultsSchema`, sınırlı kurtarma eylemleri | **Hazır** |
| Kesinti ve hata yüzeyleri | 22 rotada, sıfır ile erişilemezlik ayrımıyla | **Hazır** |

**Bu tablonun anlamı:** prototipin görünen yüzeyinin yaklaşık yarısı, bugün
gerçek API'ye bağlanabilir. Yalnızca `fetch` çağrıları ve tip dönüşümü işi.

---

## 2. Alanı var ama yüzeye çıkmıyor — küçük iş

I52 bu alanları veritabanına ve sahibin okumasına ekledi, **kamusal yüzeye
kasıtlı olarak eklemedi.**

| Prototipteki | Altyapıdaki alan | Eksik olan |
|---|---|---|
| Kart ve sayfadaki fiyat | `Offering.amount`, `currency`, `pricingKind` | `listingCardSchema` ve `offeringPresentationSchema` bunları yayımlamıyor |
| Üstü çizili fiyat, `−%23` çipi | `Offering.priorAmount` | Aynı — yayımlanmıyor; yüzde sunumda türetilir, saklanmaz |
| "Ücretsiz kargo" / "Kargo 149 ₺" | `Offering.deliveryCost` | Aynı |
| "Stokta 3 adet" / "Stokta yok" | `Offering.stockState` | Aynı |
| "Son güncelleme: Bugün 14:20" | `Offering.amountSetAt` | Aynı |
| Kaynak rozeti (API / besleme / okuma) | `Offering.source` | Aynı — ayrıca bu **İlan'ın** kaynağı, satırın değil |
| Aynı ürünü gruplama | `Offering.productKey` | Sütun var; **onu kullanan sorgu ve yüzey yok** |

> **Bunlar bir sonraki artımın işi ve sırası bellidir**: kamusal okuma
> şekillerine fiyat eklenir, fiyat sıralaması `offering_price_order_idx`
> üzerinden yazılır, `productKey` ile gruplama sorgusu eklenir.

---

## 3. Sıfırdan gereken — ve biri diğerlerinden büyük

### 3.1 Bir ürünün birden çok satıcısı — **en büyük madde**

Prototipin fiyat listesi tek bir üründe sekiz satır gösteriyor: sekiz farklı
mağaza, sekiz fiyat, sekiz stok durumu, sekiz kargo bedeli, sekiz zaman damgası.

**Altyapıda bunun karşılığı yok.** Bir İlan bir İşletmeye aittir ve I52'den
sonra bir fiyat taşır. `productKey` iki İlan'ın aynı ürün olduğunu
*söyleyebilir*, ama:

- gruplanmış görünümü hesaplayan bir sorgu yok;
- "en ucuz" satırını seçen bir kural yok;
- mağazanın kendi ürün başlığı (`listingTitle`) diye bir alan yok;
- kargo süresi (`dispatch`), kampanya satırı (`promotion`) yok;
- **satıcı puanı ve "yetkili satıcı" rozeti yok** — İşletme'nin puanı yok.

İki yol var ve bu bir karardır:

| Yol | Ne yapar | Maliyet |
|---|---|---|
| **(a) `productKey` ile gruplama** | Aynı anahtarı taşıyan İlan'lar tek ürün gibi listelenir. PRD-0001 v4.0 §5.12 zaten buna izin veriyor | Bir sorgu, bir projeksiyon, bir yüzey. **Yeni varlık yok** |
| **(b) `Product` varlığı** | Ürün ayrı bir kayıt olur, İlan'lar ona bağlanır | Yeni tablo, yeni yaşam döngüsü, yeni moderasyon sorusu, **PRD-0001'i yeniden revize etmek** |

> **(a) öneriliyor.** v4.0 §5.12.1 açıkça "Product Key bir varlık yaratmaz"
> diyor; (b) dün onaylanan belgeyi yeniden açar. (a) ile prototipin görünümü
> aynen elde edilir.

### 3.2 Sosyal katman — puan, yorum, favori

| Prototipteki | Altyapıda | Gereken |
|---|---|---|
| Yıldız puanı ve ortalama | **Yok** — `rating` kelimesi sözleşmelerde ve şemada hiç geçmiyor | Yeni: `OfferingReview` tablosu; ortalama saklanmaz, türetilir |
| Yorum listesi, yorum yazma | **Yok** | Yeni: yazma yolu, **moderasyon bağlantısı** (yorum da içeriktir) |
| "Doğrulanmış yönlendirme" rozeti | Yarısı var — `AffiliateHandoff` kaydı zaten kim, hangi ilan, ne zaman tutuyor | Yorumu o kayda bağlayan sorgu |
| Faydalı bulma sayacı | **Yok** | Yeni, küçük |
| Kalp / favori listesi | **Yok** | Yeni: `UserFavourite` tablosu + `/favorilerim` rotası |
| Paylaş (WhatsApp, Facebook, X, e-posta) | **Yok** — ama sunucu tarafı gerektirmiyor | Yalnızca yüzey işi |

> **Yorum moderasyonsuz açılamaz.** Moderasyon altyapısı kurulu (7 eylem, vaka
> kuyruğu, yeniden inceleme) ve hedef türü `ModerationTargetType` bir enum —
> yoruma genişletmek küçük bir iş. Ama **atlanırsa** ilk spam dalgasında
> kaldırılacak bir düğme kalmaz.

### 3.3 Editoryal inceleme (Detaylı İnceleme sekmesi)

| Prototipteki | Altyapıda | Gereken |
|---|---|---|
| Verdict, 0–10 puan, başlıklı bölümler | **Yok** | Yeni: `OfferingEditorial` — ya da Admin'in yazdığı uzun içerik alanı |
| Artı / eksi listesi | **Yok** | Aynı kayıt |
| Yayımlanma ve **son güncelleme tarihi** | Yarısı var — `Offering.publishedAt` var, incelemenin kendi tarihi yok | İncelemenin kendi iki tarihi |
| Video | **Yok** — medya boru hattı hiç yok | Ayrı karar; en azından bir gömme adresi alanı |

### 3.4 Fiyat ve taksit filtreleri

| Prototipteki | Altyapıda | Gereken |
|---|---|---|
| Bütçe çubuğu | `availableFilterSchema` yalnızca **Nitelik** filtreleri taşır | Fiyat, Nitelik değil — ayrı bir filtre türü |
| Taksit süresi ve aylık tutar | **Yok** | Aşağıdaki uyarıya bakın |

> **Taksit için bir uyarı.** PRD-0001 §4 "kredi başvurusu, ödeme, komisyon"u
> kapsam dışında bırakıyor. Aylık taksit tutarı göstermek bir **finansal
> sunum**dur ve faizsiz varsayımıyla hesaplanırsa yanlış olabilir. Prototipte
> tutuldu çünkü ekranda görülmesi istendi; **yayına almadan önce bunun bir
> ürün ve hukuk kararı olduğunu kayda geçiriyorum.**

### 3.5 Katalog ve besleme

| Prototipteki | Altyapıda | Gereken |
|---|---|---|
| 7 kategori (analize göre sektör kırılımı) | 3 Alan seed'li: `MOBILITY`, `REAL_ESTATE`, `TECHNOLOGY` | Yeni Alan kayıtları + sözleşme sabiti (§4'e bakın) |
| Kategorinin besleme modeli ve komisyon bandı | **Yok** | `Domain` veya `Category` üzerinde iki alan — yönetim bilgisi, kamusal değil |
| Epey usulü gruplu nitelik tablosu | `AttributeDefinition`'da **`group` alanı yok** | Tek sütun; prototipteki 12 grup buna dayanıyor |
| 19 ürün, 149 ₺ – 61.900 ₺ | **Katalog boş** | Besleme altyapısı (`FeedSource`/`FeedRun`/`FeedItem`) ya da Admin elle giriş ekranı |
| Ürün görselleri | `OfferingVisual` var, **yükleme yolu yok** | Beslemede adres gelir; elle girişte yükleme gerekir |

---

## 4. Çelişki — önce bu kapatılmalı

**`V1_DOMAINS` hâlâ kapalı bir enum.**

```ts
// packages/contracts/src/index.ts:1109
export const V1_DOMAINS = ["MOBILITY", "REAL_ESTATE", "TECHNOLOGY"] as const;
```

PRD-0001 **v4.0 §E** dün şunu söyledi: *"A Domain is a governed record; the set
is open and extended by Platform administration."*

Bu sabit üç yerde kullanılıyor — kategori oluşturma, Admin katalog yönetimi ve
`searchViewSchema.domain`. **Yani bugün dördüncü bir Alan eklenirse, o Alan'daki
bir kategoriye yapılan arama sözleşme doğrulamasında reddedilir.**

Bu, kodun onaylanmış belgeyle çeliştiği tek nokta ve düzeltilmesi küçük bir iş:
Alan artık bir kayıt olduğuna göre sabit bir `stableKey` dizesine dönüşmeli.

---

## 5. Prototipte olmayan ama altyapıda olan

Bunlar **kaybolmuş** olabilir ve bu bir karardır:

| Altyapıdaki | Prototipte | Soru |
|---|---|---|
| **Karar Sohbeti** (`DecisionChatTurn`, sağlayıcı bağımsız port) | Yok | Yazılmış, test edilmiş bir yetenek. Bu yönde yeri neresi? |
| **Doğrudan İletişim** (telefon/e-posta/URL açığa çıkarma) | Yok | Affiliate modelinde bunun yeri var mı? |
| **Karşılaştırma 2–5 ürün** (Karar akışında) | Sayfada 2 ürün | İkisi aynı şey mi, iki ayrı şey mi? |
| **İşletme paneli** (envanter, yayın, düzeltme akışı) | Yok — Faz 2 | Faz 1'de gizli mi kalacak? |
| **Admin paneli** (moderasyon, katalog, analitik) | Yok | Faz 1'de ürün girişi buradan yapılacak |

---

## 6. Sıralı plan

| # | Artım | Bağımlılık | Boyut |
|---|---|---|---|
| 1 | **`V1_DOMAINS`'i aç** — sabit enum yerine kayıt anahtarı | — | Küçük |
| 2 | **Fiyatı kamusal yüzeye çıkar** — kart, ilan sayfası, arama | I52 | Orta |
| 3 | **Fiyata göre sıralama ve bütçe filtresi** | 2 | Orta |
| 4 | **`productKey` ile gruplama** — bir üründe N satıcı listesi | 2 | **Büyük** |
| 5 | **`Attribute.group`** — Epey usulü gruplu tablo | — | Küçük |
| 6 | **Alanları çoğalt + kategori/nitelik kataloğu** | 1 | Orta (içerik işi) |
| 7 | **Sistem işletmesi + Admin elle ürün girişi** | 6 | Orta |
| 8 | **Görsel yükleme** | 7 | Orta |
| 9 | **Favori listesi** | — | Küçük |
| 10 | **Yorum + puan + moderasyon bağlantısı** | — | Orta |
| 11 | **Editoryal inceleme** | — | Orta |
| 12 | **Besleme altyapısı + ilk bağlayıcı** | 4, 7 | **Büyük** |
| 13 | Paylaşım düğmeleri | — | Yüzey işi |

**1–3 arası prototipin fiyat gösteren her parçasını gerçek veriye bağlar.**
4 Akakçe görünümünü verir. 9–11 sosyal katmanı açar. 12 otomatiğe bağlar.

---

## 7. Hâlâ duran, kod olmayan engeller

Bunlar değişmedi:

- Vercel projesi ve Supabase örneği **oluşturulmadı**
- Worker cron sıklığı kararı — beslemeler için artık daha kritik
- Postmark ve Anthropic anahtarları
- **KVKK / gizlilik / kullanım koşulları — 0 sayfa.** Yorum ve favori
  eklendiğinde kişisel veri işlemenin kapsamı genişler; bu sayfalar
  yayından önce zorunlu
- Yedekleme, geri yükleme provası, alarm
- Katalog içeriği

---

## 8. Söylememem yanlış olur

**En büyük iki madde 4 ve 12** ve ikisi de aynı şeye bakıyor: bir ürünün
birden çok satıcısını bilmek ve o fiyatları düzenli olarak tazelemek. Kurulu
platform bunu yapmıyor ve yapmak için tasarlanmadı — ama **topladığınız fiyatı
gösterecek her şeye sahip.**

Geri kalan on bir maddenin toplamı, bu ikisinin yanında küçüktür.
