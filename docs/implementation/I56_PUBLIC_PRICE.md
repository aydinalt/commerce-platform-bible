# I56 — Fiyat public yüzeye çıkıyor

Status: Complete · 2026-09-01 · PRD-0001 v4.0 §5.10

## Neden

I52 her Offering'e bir fiyat verdi: yedi sütun, dört veritabanı kısıtı, eksik
bir Fixed fiyatı reddeden bir sözleşme ve işletmenin yazacağı bir form.
**Hiçbiri ziyaretçiye ulaşmıyordu.** `listingCardSchema` yedi alan taşıyordu ve
tutar yoktu; `offeringPresentationSchema` on alan taşıyordu ve tutar yoktu; bu
ikisini kuran SQL sorguları sütunları seçmiyordu bile.

Bir işletme fiyat yazıyor, veritabanı saklıyor, her public yüzey saklıyordu.
Bir fiyat karşılaştırma platformunda kapatılabilecek en geniş açık buydu ve iki
uçtan da görünmüyordu.

## Ne yapıldı

| Katman | Değişiklik |
|---|---|
| Sözleşme | `listingCardSchema` ve `offeringPresentationSchema`'ya `pricing: offeringPriceSchema`. Aynı şema nesnesi, iki yerde referansla — Discovery ile Presentation'ın fiyat konusunda ayrışması yapısal olarak imkânsız. |
| Kalıcılık | Yeni `apps/api/src/persistence/offering-price.sql.ts`: tek `OFFERING_PRICE_SQL` parçası, tek `composePrice`, tek `withPrice`. Beş sorgu, dört depo aynı kuralı kullanıyor. `pg-offering-content` içindeki kopya kaldırıldı. |
| Okuma yolları | Browse, Search, Comparison üyesi, Decision seçimi ve Presentation. |
| Web | Yeni `apps/web/src/discovery/price.tsx`: `CardPrice` (kart) ve `PresentationPrice` (ilan sayfası). Sekiz CSS sınıfı. |
| Sözleşme dokümanı | `generated/openapi.json` yeniden üretildi; `ListingCard`, `SearchResult`, `OfferingPresentation`. |

**Projeksiyona yazılmadı.** `offering_search_projection` Search'ün eşleştiği
alanları denormalize eder ve her denormalize alan bir tazeleme borcu doğurur.
Fiyat en sık değişen ve bayatlığı en görünmez olan alan — dünkü tutarı gösteren
bir kart, bugünkünü gösteren bir karta birebir benziyor. `offering` join'i zaten
her sorguda var, sütunlar bedava.

## Korunan ayrım

§5.10.1'in üç durumu üç durum olarak kaldı. Bu artımın asıl işi buydu:

- **Fixed** — tutar var, gösterilir.
- **On Request** — şeyin doğası gereği tutarı yok. "Fiyat bilinmiyor" demek,
  olmayan bir başarısızlığı bildirmek olurdu.
- **Unknown** — platform henüz bir tutar okumadı. "Teklif alın" demek,
  ilanın hiç sunmadığı bir düzeni uydurmak olurdu.

Aynı titizlik `deliveryCost` için de geçerli: `null` "belirtilmemiş", `0`
"ücretsiz". Yüzey ikisini ayrı cümlelerle söylüyor; "0,00 ₺ teslimat" yazmıyor.

`priorAmount` üstü çizili gösteriliyor ve **yüzde hesaplanmıyor**. §5.10.4
indirim yüzdesini saklamayı reddediyor çünkü bağımsız değişen iki tutardan
türetilebilir; onu son anda hesaplayıp göstermek aynı ikinci kopyayı üretmek
olurdu. İki tutar da ekranda.

## Doğrulama

- `tsc -b` temiz, `eslint` temiz, `prettier --check` temiz, `depcruise` ihlal yok.
- **123 dosya / 1138 test yeşil** (taban 122 / 1126; bu artım 12 test ekledi).
- `tests/i56-public-price.test.ts`: sözleşme, iki bileşen ve uçtan uca iki
  bütünleşme durumu — bir tutarın Browse, Search ve Presentation'da aynı
  çıktığı, ve On Request'in tutarsız bir durum olarak taşındığı.
- `npm run build` başarılı.

## Açık kalan

- **Feed için dar bir fiyat güncelleme yolu yok.** Fiyat bugün yalnızca
  `EditOffering` ile yazılabiliyor: tam-değiştirme ve `version` optimistic lock.
  Saatte bir fiyat yazan bir partner beslemesi bu yoldan geçerse içeriği ezer ve
  version çakışır. `source=FEED` kayıtları için yalnızca fiyat ve stok yazan
  ayrı bir uç gerekiyor.
- **Fiyat sıralaması ve bütçe filtresi yok.** Browse `published_at desc`,
  arama eşleşme düzeyi + tarih ile sıralıyor. Fiyata göre sıralama ve bütçe
  tavanı, projeksiyonda bir fiyat sütunu ve `appliedFilterSchema`'da yeni bir
  filtre türü istiyor.
- **Fiyat değişince projeksiyon yeniden yazılmıyor** — bugün yalnızca yayınlama
  anında yazılıyor. Sıralama fiyata dayandığı an bu bir doğruluk sorunu olur.
