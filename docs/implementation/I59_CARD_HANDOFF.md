# I59 — Karttan partnere

> **Durum:** tamamlandı. `US-DSC-F06-001 v1.1` 2 Eylül 2026'da sahibi tarafından
> onaylandı ve donduruldu (*"böyle kalsın"*); v1.0
> `-v1.0-superseded.md` olarak arşivlendi. Kod içindeki AC atıfları v1.1'e göre
> güncellendi.

## Neden

Platformun iş modeli affiliate: karttaki fiyat partnerin fiyatı, gelir de
müşterinin o partnere gitmesinden. Kart bu fiyatı gösterip üzerine hiçbir şey
yapamıyordu — `US-DSC-F06-001` AC-7 kart üzerinden Affiliate Handoff'u açıkça
yasaklıyordu. Sonuç: insan kartta gördüğü fiyata basıyor, tek işi kartın az önce
esirgediği düğmeyi sunmak olan bir sayfaya düşüyordu.

I56 fiyatı karta koyduğunda bu boşluk göründü; I58 üç satıcıyı tek karta
indirdiğinde daha da büyüdü. Bu artım kapatıyor.

## Yasağın gerekçesi düşürülmedi

AC-7 beş şeyi tek gerekçeyle yasaklıyordu: kart *sınırlı* bir temsildir, aşağı
akıştaki bir davranışı yürüten denetim kartı o davranışın sahibi hâline getirir.
Dördü (Presentation, Compare, Karar Sohbeti, Doğrudan İletişim) aynen duruyor.
Beşincisi için gerekçe üç kısıta çevrildi:

| Kısıt | Nerede | Ne yapıyor |
|---|---|---|
| Adres karta düşmez | AC-5 (değişmedi) + `HANDOFF_AVAILABLE_SQL` | Karta giden şey `handoffAvailable` boolean'ı; adres yok. |
| Handoff'un sahibi Decision'dır | `handoffFromCard` → `POST /decision/flows` → `PUT /selection` → `POST /affiliate-handoff` | `US-DEC-F05-001`'in tuttuğu kayıt karttan gelen tıklamada da tutulur. |
| Yapılamayacak şey sunulmaz | AC-10 + `handoffAvailable === false` | Onaylı hedefi olmayan kartta düğme *yok* (soluk değil). |

## Değişen dosyalar

**Sözleşme**
- `packages/contracts/src/index.ts` — `listingCardSchema.handoffAvailable: boolean`.
- `apps/api/src/openapi/generate-openapi.ts` + `generated/openapi.json` —
  `ListingCard` ve `SearchResult` şemaları.

**API**
- `apps/api/src/persistence/offering-price.sql.ts` — `HANDOFF_AVAILABLE_SQL`
  (`exists`, join değil: bir düğme sorusu kartın satır sayısını değiştiremez).
- `pg-discovery.repository.ts` (arama + gezinme), `pg-comparison.repository.ts`,
  `pg-decision.repository.ts` — beş kart üreticisinin hepsi alanı taşıyor.

**Web**
- `apps/web/src/app/decision/actions.ts` — `handoffFromCard`. Üç çağrı, üçü de
  platformun yeniden karar vermesi; reddedilirse insan ilan sayfasına gider,
  hata sayfasına değil.
- `apps/web/src/app/discovery/listing-card.tsx` — düğme bir **form**, bağlantı
  değil: bağlantıyı ön yükleme, tarayıcı botu veya orta tık izleyebilir ve
  kimsenin yapmadığı bir Completion kaydedilirdi. Eylem prop olarak geliyor,
  bileşen saf kalıyor.
- `discovery-view.tsx`, `globals.css`.

**Test** — `tests/i59-card-handoff.test.ts` (8): hedef varken/yokken kartın
cevabı, adresin karta hiç düşmemesi (kartın tamamı aranıyor), kaydın gerçekten
tutulması, hedef kapatılınca hem kartın hem tıklamanın reddi, aramanın gezinmeyle
aynı cevabı vermesi, ve üç render hâli.

Bekçi listeleri güncellendi: `i3-search` (anahtar listesi), `i49-public-surfaces`
(CSS sınıf listesi), `i42-contract-shapes` (OpenAPI), `i30`/`i4-*`/`i56`
(fixture'lar).

## Aynı artımda kapatılan iki ölçüm farkı

Prototiple gerçek veriyi yan yana koyunca çıkmıştı:

1. **Sıralama kargoyu saymıyordu.** `TOTAL_COST_SQL = amount + coalesce(delivery_cost, 0)`
   hem kartın çizildiği satıcıyı hem fiyat listesini sıralıyor. Belirtilmemiş
   kargo *sıfır sayılmıyor*: §5.10.5 `null` ile `0`'ı ayırır, satır olabileceği
   en düşük tutarda duruyor ve yüzey "belirtilmemiş" diyor. Kart ile listenin
   aynı ifadeyle sıralanması bilinçli — kartın çizildiği satıcı, altındaki
   listenin başında olmayan biri olsaydı platform tek tıkta kendiyle çelişirdi.
2. **Para biçimi.** `money()` kuruşu *varsa* gösteriyor. Prototipin yaptığı gibi
   yuvarlamıyor: `43.750,50` → `₺43.751` kimsenin vermediği bir fiyat olurdu.

## Doğrulama

`1.154` test yeşil (125 dosya), `tsc -b` temiz, `eslint .` temiz. Gerçek bir
yönlendirme çalışan API'de yapıldı: `affiliate_handoff` satırı ve
`GET /completion` cevabı `docs/` dışındaki gösterim sayfasında.

## Kapanış

- v1.1 Frozen; v1.0 `-v1.0-superseded.md` olarak arşivde, aday dosya silindi.
- Üst belgeler (PRD-0002 §11/§14/§17, UX-0002 §11/§16) tek tek okundu; hiçbiri
  revizyon gerektirmedi. Gerekçe donan belgenin §15'inde tabloyla yazılı.
- Dondurmadan sonra kod yorumlarındaki AC atıfları düzeltildi: kartın *açma*
  bağlantısını anlatan yorum artık handoff'u yasak saymıyor, `SellerPrices`'ın
  satırları dışarı çıkarmaması ise bir yasak değil bir tercih olarak yazıldı —
  v1.1 izin veriyor, liste yine de içeride kalıyor çünkü kart bir ürünün en iyi
  teklifini, satır ise birkaç satıcıdan birini yanıtlıyor.
- Doğrulama dondurma sonrası tekrarlandı: 1.154 test, `tsc -b`, `eslint .` — üçü
  de temiz.
