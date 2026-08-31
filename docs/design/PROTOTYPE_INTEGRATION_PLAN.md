<!--
Owner:        Architecture Owner
Status:       Draft — awaiting Owner decision
Maintenance Mode: Living
Version:      0.1
Last Updated: 2026-08-30
-->

# Prototipi altyapıya bağlamak — ölçülmüş plan

Prototip ile kurulu platform **aynı ürün değil.** Bu belge, farkın tam olarak
nerede olduğunu sayarak gösterir ve bağlamanın iki yolunu ayırır.

Her rakam `generated/openapi.json`, `packages/contracts` ve
`packages/database/prisma/migrations` taranarak ölçüldü.

## 1. Bugün ne var

| | |
|---|---|
| API operasyonu | **87** — Platform 32, Decision 14, Offering 13, Identity 12, Business 10, Discovery 3, Health 2, Catalog 1 |
| Web rotası | **22**, hepsi Türkçe, hepsi test edilmiş |
| Test | 118 dosya / 1073 test |
| Migration | **32** |
| Fiyat / satıcı içeren migration | **0** |

## 2. Alan alan eşleme

Prototipin `Product` tipindeki her alan, API'nin yayınladığı şemalarda arandı.

| Prototip alanı | API alanı | Durum |
|---|---|---|
| `id` | `offeringId` | **Var** — ListingCard, OfferingPresentation |
| `slug` | `slug` | **Var** — ikisinde de |
| `name` | `title` | **Var** — ikisinde de |
| `listedAt` | `publishedAt` | **Var** — ikisinde de |
| `description` | `description` | **Var** — OfferingPresentation |
| `gallery` | `visuals[]` | **Var** — OfferingPresentation |
| `gallery` (kartta) | `primaryVisualUrl` | **Var** — ListingCard (tek görsel) |
| `specs` | `attributes[]` | **Var** — OfferingPresentation |
| `brand` | — | **Yok** |
| `lowestPrice` | — | **Yok** |
| `listPrice` | — | **Yok** |
| `offerCount` | — | **Yok** |
| `offers[]` | — | **Yok** |
| `popularity` | — | **Yok** |
| `heat` | — | **Yok** |
| `reviewCount` | — | **Yok** |

**Sekiz alan var, sekiz alan yok.** Ve olmayan sekizin yedisi tek bir eksikten
doğuyor: **fiyat ve satıcı kavramı datamodelde hiç yok.**

### Beklenmedik iyi haber

`description` ve `visuals[]` **zaten var** — prototipin en çok emek isteyen iki
görsel unsuru, ürün açıklaması ve galeri, uydurulmuş değil; API bunları
`OfferingPresentation` üzerinde yayınlıyor. `SURFACE_INVENTORY.md` §7 bunları
yoklar listesine koymamıştı ve haklıydı.

### Kayda değer bir uyumsuzluk

`PresentedAttribute` şu alanları taşıyor: `attributeId, boolean, kind, name,
number, optionLabels, supplied, text, unit`.

`optionLabels` bir dizi — yani **Epey'in çip mantığı zaten destekleniyor.**
Eksik olan tek şey **grup**: `Attribute` şemasında `group` benzeri bir alan
**yok**, dolayısıyla "EKRAN / BATARYA / KAMERA" başlıkları bugün üretilemiyor.
Altmış satırlık düz bir tablo, gruplu tablonun okunabilirliğini vermez.

## 3. İki yol

### Yol A — Sunumu bağla, modeli değiştirme

Prototipin **görsel katmanını** mevcut API'ye bağlamak. Bugün çalışır, backend
değişikliği gerektirmez.

Bu yolla çalışacaklar:

- Arama ve kategori gezinme (`POST /discovery/search`, `GET /discovery/browse`)
- Sonuç kartları: başlık, kategori, işletme, görsel, yayın tarihi
- Ürün sayfası: galeri, **açıklama**, nitelik tablosu, kategori yolu, işletme
- Nitelik filtreleri — `AvailableFilter` zaten yayınlanıyor

Bu yolla **çalışmayacaklar**: fiyat, bütçe kaydırıcısı, taksit şeridi, indirim
yüzdesi, satıcı listesi, "En yeni / Yükselenler / Popüler" sekmelerinden üçü
(yalnız *En yeni* `publishedAt`'ten türetilebilir), alternatif ürün algoritması
(fiyat bandına dayanıyor).

**Yani arayüzün gövdesi durur, fiyatla ilgili her şey düşer.**

### Yol B — Modeli büyüt

Fiyat karşılaştırmasını gerçekten yapmak için sözleşmelerin ve veritabanının
büyümesi gerekiyor. Prototipin `src/lib/types.ts` dosyası bu şekli **gerçekmiş
gibi** yazıyor; onaylanırsa taşınacak tipler oradadır.

Gereken yeni varlıklar:

1. **`Product`** — İlan'dan ayrı. Bugün bir İlan tek bir İşletmeye ait; "aynı
   ürünü satan farklı kaynaklar" için Ürün ile İlan ayrışmalı. Bu, PRD-0001'i
   değiştiren bir karardır, kod işi değil.
2. **`Merchant`** — satıcı, puanı ve yetkili satıcı durumu.
3. **`PriceOffer`** — fiyat, kargo, stok, kargo süresi, satıcının kendi başlığı,
   son okunma zamanı.
4. **`Attribute.group`** — Epey usulü gruplu tablo için.
5. **Popülerlik ve hareket sayaçları** — sekmeler için.

## 4. Yapılması gerekenler, sırayla

| # | İş | Bağımlılık | Büyüklük |
|---|---|---|---|
| 1 | **Karar: Yol A mı, Yol B mi** | Owner | — |
| 2 | Tailwind'in `apps/web`'e girip girmeyeceğine karar ver | Owner | — |
| 3 | `Attribute`'a `group` alanı ekle (migration + sözleşme + Admin ekranı) | — | 1 artım |
| 4 | Nitelik tablosunu gruplu ve çipli hâle getir | 3 | 1 artım |
| 5 | Discovery ve Offering yüzeylerini yeni tasarıma geçir | 2 | 2 artım |
| 6 | `Product` / `Merchant` / `PriceOffer` datamodeli | 1 = Yol B | 3–4 artım |
| 7 | Fiyat okuma işi (satıcı sitelerinden fiyat toplama) | 6 | Ayrı sistem |
| 8 | Bütçe/taksit filtreleri ve alternatif algoritması | 6 | 1 artım |

## 5. Kod tarafında iki teknik engel

### Tailwind ile mevcut CSS bir arada yaşayamaz (kolayca)

`apps/web` 1045 satırlık token'lı düz CSS kullanıyor ve **altı test dosyası
`globals.css`'i baştan sona okuyor**: `i26`, `i32`, `i33`, `i48`, `i49`, `i50`.
Tailwind'i o uygulamaya eklemek bu altısının hepsini etkiler.

Üç seçenek var ve bu bir Owner kararı:

- **Tailwind'i ekle**, altı test dosyasını yeniden yaz — en hızlı yol, en çok
  test değişimi.
- **Prototipin tasarımını düz CSS'e çevir** — testler korunur, iş daha uzun.
- **Prototipi ayrı bir uygulama olarak tut** — iki kod tabanı, iki tasarım.

### Prototipte filtreleme anlık, kurulu üründe gönderim

Kurulu uygulamada bir Kategori seçmek **form gönderimidir**; `US-DSC-F06-001`
bir Discovery Start'ı kasıtlı bir olay sayıyor ve prefetch ya da yer imiyle
tetiklenmesini yasaklıyor. Prototipin yazdıkça filtrelemesi **hiçbir olay
kaydetmiyor**. Bu iki davranış bir arada duramaz; ya Frozen kural değişir ya
prototipin etkileşimi gönderime döner.

## 6. Bunun dışında hâlâ duran engeller

Bunların hiçbiri arayüzle ilgili değil ve hepsi yayına çıkmayı engelliyor:

- Vercel projesi ve Supabase örneği **oluşturulmadı**
- Worker cron sıklığı — Hobby planında günde 1 kez, yani **kimse üye olamaz**
- Postmark ve Anthropic anahtarları yok — production açılmıyor
- KVKK / gizlilik / kullanım koşulları — **0 sayfa**
- Yedekleme, geri yükleme provası, alarm — **0 yapılandırma**
- Katalog içeriği — boş

## 7. Önerim

**Yol A'yı önce yapın.** Fiyat toplama ayrı ve büyük bir sistemdir; onu
beklemeden arayüzün gövdesi bugünkü API ile ayağa kalkabilir ve gerçek veriyle
görülebilir. Fiyat geldiğinde eklenecek şey satırlara birkaç alan ve bir
bölümdür, yeniden tasarım değil.

**Ve sırayı bozmayın:** görsel öncelikli kart, içerik gelmeden inerse her kart
boş bir gri kutu gösterir — bugünkünden kötü olur.
