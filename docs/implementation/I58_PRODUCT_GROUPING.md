# I58 — Bir ürün, birden çok satıcı

Status: Complete · 2026-09-01 · PRD-0001 v4.0 §5.12

## Neden

Üç partner aynı telefonu listelediğinde ekranda aynı başlığı taşıyan üç kart
çıkıyordu. Kişi onları tarayıp hangisinin ucuz olduğunu kendi bulmak zorundaydı —
yani bir fiyat karşılaştırma sitesinin *zaten yapmış olması gereken*
karşılaştırmayı.

Cevap donduğundan beri PRD-0001 v4.0 §5.12'de duruyordu: aynı Product Key'i
taşıyan Offering'ler **tek ürün olarak sunulur**. Burada yeni bir varlık
icat edilmedi — hâlâ `Product` satırı yok, `Merchant` satırı yok, §4 ikisini de
isim isim reddediyor. Değişen tek şey, bir sorgunun nihayet o sütunu okuması.

## Yapılan

| Katman | Değişiklik |
|---|---|
| Sözleşme | `listingCardSchema` → `productKey`, `sellerCount`. `offeringPresentationSchema` → `productKey`, `sellers[]`. Yeni `sellerOfferSchema`. |
| Kalıcılık | `offering-price.sql.ts` içinde `PRODUCT_GROUP_KEY`, `PRODUCT_GROUP_PICK`, `SELLER_COUNT_SQL` (pencere) ve `SELLER_COUNT_SCALAR`. Browse ve arama `distinct on` ile ürün başına tek satır döndürüyor; ilan sayfası kardeş satırları listeliyor. |
| Web | Kartta "N satıcı"; ilan sayfasında **"Bu ürünü satanlar"** fiyat listesi, en ucuz üstte, açık olan satır işaretli. |

**Grup anahtarı `coalesce(product_key, id)`.** Yalnızca `product_key` olsaydı
anahtarsız her satır `null` altında toplanır ve kataloğun yarısı tek karta
çökerdi. Anahtarsız bir Offering kendisinin tek satıcısıdır.

**Temsilci satır en ucuz olandır**, en yenisi ya da ilki değil. Fiyatı mevcut
en iyi fiyat olmayan bir karşılaştırma kartı, fiyatsız karttan kötüdür: kartın
sorduğu soruya yanlış cevap verir. §5.10.5 gereği tutarsız satırlar sıralamada
yer almaz, fiyatlı satırlardan sonra gelir.

**Sayım, sorgunun kabul ettiği satırlar üzerinden.** Bütçe bir satıcıyı elediyse
kart da o satıcıyı saymaz; aksi hâlde ekrandaki sayı, altındaki listeyle
çelişirdi.

## §5.12.3 korundu

"Benzer başlık, benzer nitelik ve benzer fiyat kanıt değildir." Test bunu bir
vaka olarak yazıyor: aynı başlığı taşıyan, aynı fiyattaki, anahtarsız iki ilan
**iki kart olarak kalıyor**. Bu bir kaçırılmış fırsat değil, doğru cevap.

## Doğrulama

`tests/i58-product-grouping.test.ts` — 5 vaka: üç partner tek kart olur ve kart
en ucuzdan çizilir; anahtarsız ikizler ayrı kalır; arama ile browse aynı şekilde
gruplar; ilan sayfası bütün satıcıları en ucuzdan sıralar (en *pahalı* satıcının
adresinden açılarak, listenin ürüne ait bir gerçek olduğu kanıtlanır); anahtarsız
ilan kendisinin tek satıcısıdır.

`tsc -b`, `eslint`, `prettier`, `depcruise`, `build` temiz ·
**124 dosya / 1143 test yeşil.**

Demo veriyle tarayıcıda: Cep Telefonları'nda üç ilan yerine **tek kart** —
"Cep Telefonları · Teknoloji Deposu · 3 satıcı — ₺45.990,00 ₺42.990,00 Stokta" —
ve ilan sayfasında üç satırlık satıcı fiyat listesi.

## Açık kalan: kart üstünden doğrudan yönlendirme

Prototipin kartında "Güncel Fiyatı İncele" düğmesi doğrudan partnere gidiyor.
Bugün gitmiyor ve bu bir eksiklik değil, bir **çakışma**:
`US-DSC-F06-001` AC-7 bir Listing Card'ın Presentation, Compare, Karar Sohbeti,
Yönlendirme veya Doğrudan İletişim *gerçekleştirmesini* yasaklıyor. Kartın
yönlendirme yapması bu donmuş kabul ölçütünü çiğner.

Üç yol var ve bu bir sahip kararıdır:
1. Prototipin düğmesini karttan kaldırıp yönlendirmeyi ilan sayfasında bırakmak.
2. `US-DSC-F06-001` AC-7'yi revize etmek.
3. Düğmeyi kartta tutup ilan sayfasına götürmek — görünüş korunur, davranış
   AC-7'ye uyar.

## Sıradaki

Prototipin görsel katmanının kart ve ilan sayfasına taşınması. Veri artık
prototipin çizdiği her şeyi (puan/yorum/editöryel hariç) besliyor.
