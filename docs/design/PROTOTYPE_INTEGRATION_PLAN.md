<!--
Owner:        Architecture Owner
Status:       Draft — two decisions taken, one still open
Maintenance Mode: Living
Version:      0.2
Last Updated: 2026-08-31
-->

## Owner kararı — 2026-08-31

**Yol A seçildi.** Owner'ın gerekçesi: PRD-0001 v4.0 daha üç gün önce, 30
Ağustos'ta donduruldu ve `Product` ile `Merchant` varlıklarını Revision
Note'unda açıkça reddetti. Yol B, sözleşmeleri ve veri modelini o karara karşı
büyütmek demek — arka uçta geniş bir yeniden yazım. Prototipin görsel katmanını
bugünkü sağlam API'ye bağlamak en güvenli ilerleyiş.

**Tailwind `apps/web` içine alınacak.** §5'in üç seçeneğinden birincisi.

> **Bu kararın ölçülmüş bedeli, kabul edilmiş sayılır:** `i26`, `i32`, `i33`,
> `i48`, `i49` ve `i50` `globals.css`'i baştan sona okuyor. Altısı da yeniden
> yazılacak. Bu, seçeneğin bir yan etkisi değil, ta kendisidir — plan onu
> "en hızlı yol, en çok test değişimi" diye adlandırmıştı.

### §5'in ikinci engeli yanlış yazılmıştı — düzeltmesi

> **Düzeltme (2026-08-31).** Bu belgenin §5'i şunu iddia ediyordu: *"Frozen
> `US-DSC-F06-001` bir Discovery Start'ı kasıtlı bir olay sayıyor ve prefetch ya
> da yer imiyle tetiklenmesini yasaklıyor."* **İddianın üç parçası da yanlıştı**
> ve hiçbiri bir belgeye karşı doğrulanmamıştı:
>
> - `US-DSC-F06-001` **Listing Card'larla ilgilidir.** Sekiz kabul kriterinin
>   hiçbiri Discovery Start'tan söz etmez.
> - **"prefetch" ve "bookmark" kelimeleri** hiçbir Story, PRD veya UX belgesinde
>   **geçmez.** Öyle bir yasak yok.
> - Çatışma, tarif edilenden çok daha dardır — aşağıda.

Kuralın gerçek sahibi **Frozen `PRD-0002-discovery.md` v2.1 §5.10**:

> The bounded product occurrence when a person:
> - **submits** a valid Search query; or
> - **selects** the first active Category that begins a Browse path.

Ve onu tüketen Story, Frozen `US-DSC-F02-001` v1.0 **AC-1**: *"whenever a person
**explicitly submits** a valid non-empty Search query."*

**Bu ayrım, çatışmayı ikiye böler ve yarısını yok eder:**

| Prototipin davranışı | Frozen kuralla çatışır mı |
|---|---|
| Kategori açılırından seçim — anlık filtreler | **Hayır.** §5.10 Browse için *"selects"* der, *"submits"* değil. Bir tıklama zaten bir seçimdir. |
| Serbest metin aramada yazdıkça filtreleme | **Evet** — ve yalnızca tek bir kelimede: *"submits"* / *"explicitly submits"*. |

Yani prototipin en görünür akıcılığı olan kategori seçimi için **hiçbir Frozen
belgeye dokunmaya gerek yok.** Yol A'nın o kısmı bugün engelsiz ilerleyebilir.

### Owner kararı — 2026-08-31 (düzeltilmiş kapsamla)

**Revizyon yazılacak, ama `US-DSC-F06-001`'e değil.** Owner, düzeltilmiş ölçümü
gördükten sonra gerçek sahipleri seçti: **PRD-0002 §5.10** ve onu tüketen
**US-DSC-F02-001 AC-1**. Her ikisi de Frozen, dolayısıyla her biri
`DOCUMENT_LIFECYCLE.md` §7 uyarınca kendi Draft adayını alır — yerinde
düzenlenmez.

Kaydedilen tanım:

> Bir Search Discovery Start, bir Discovery yolunda **en fazla bir kez** oluşur
> ve o yolda **ilk geçerli boş olmayan sorgunun sunucuya ulaştığı anda** oluşur
> — ister açık bir gönderimle, ister debounce sonrası. Aynı yol içindeki sonraki
> daraltmalar Start üretmez.

**"İlk karakter girildiğinde" tanımı bilerek alınmadı**, ve gerekçe kayda değer:
tek harf yazıp vazgeçen herkes bir Start sayılırdı, ve Start sayıları bugüne
kadar kaydedilenlerle kıyaslanamaz hâle gelirdi. "Yolda tek Start" kavramı ise
kodda zaten var — `i3-browse` testi *"creates no further Start for descendants
of the same path"* diye adlandırılmış — dolayısıyla bu tanım yeni bir kavram
getirmiyor, mevcut olanı serbest metin aramasına da uyguluyor.

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
