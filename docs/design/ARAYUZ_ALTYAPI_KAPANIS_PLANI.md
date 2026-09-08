# Arayüz–Altyapı Kapanış Planı

Sürüm 1.0 · 2026-09-01 · Ölçüm tabanlı, iddia tabanlı değil.

Ölçüldüğü yer: `packages/contracts/src/index.ts`, `packages/database/prisma/schema.prisma`
(976 satır, 30 model, 20 enum), `apps/api/src` (88 uç), `apps/web/src` (22 rota),
`modules/*/src`, `tests/` (~942 test), `prototype/src` (36 dosya).
Bu doküman `ARAYUZ_ALTYAPI_FARKI.md`'nin yerini alır; o dokümanın bayat kalan
maddeleri §6'da tek tek işaretlenmiştir.

---

## 1. Baştaki yanlış varsayımı düzeltelim

Altyapı bir iskelet değil. Çalışan bir sistem: 88 HTTP ucu, 22 sunucu-render
rotası, 30 migration, boot anında veritabanı zaman aşımlarını doğrulayıp
uymuyorsa **açılmayı reddeden** bir API, gerçek bir Anthropic sağlayıcısı,
transactional outbox ile e-posta işçisi, denetim kaydı, moderasyon iş akışı,
admin paneli, CI. Prototipin "yeni" gibi görünen parçalarının çoğu ya zaten
var ya da bir katman uzakta.

Asıl mesele şu: **altyapı bir ilan/karar platformu olarak bitmiş durumda,
prototip ise bir fiyat karşılaştırma sitesi çiziyor.** Aradaki fark birkaç
eksik alan değil; üç farklı türden fark var ve karıştırılırsa plan yanlış
çıkar:

| Tür | Ne demek | Kaç madde |
|---|---|---|
| **A — Bağlanmamış** | Veri var, public sözleşmeye çıkmıyor. Kod işi, küçük. | 7 |
| **B — Yapısal** | Model bunu taşımıyor, ama PRD'ye aykırı değil. Kod işi, büyük. | 6 |
| **C — Kapsam dışı** | Donmuş PRD açıkça yasaklıyor. Önce **karar**, sonra kod. | 4 |

---

## 2. Tür A — Veri var, yüzeye çıkmıyor

### A1. Fiyat hiçbir public sözleşmede yok  ← **en büyük ve en ucuz madde**

`Offering` fiyatı taşıyor: `pricingKind` (FIXED/ON_REQUEST/UNKNOWN), `amount`
`Decimal(12,2)`, `currency`, `amountSetAt`, `priorAmount`, `deliveryCost`,
`stockState` — `schema.prisma:728-750`, I52 ile geldi. İşletme tarafında yazma
formu da var (`apps/web/.../content-form.tsx`, `business/copy.ts:113`).

Ama:

- `listingCardSchema` **7 alan** taşıyor ve fiyat yok — `contracts/src/index.ts:1602-1624`.
- `offeringPresentationSchema`'da fiyat yok — `contracts/src/index.ts:1687-1700`.
- `listing-card.sql.ts` ve `pg-presentation.repository.ts` fiyat sütunlarını
  **seçmiyor bile**.

Yani bir fiyat karşılaştırma platformunun hiçbir public yüzeyinde fiyat yok.
İşletme fiyatı giriyor, veritabanı saklıyor, ziyaretçi göremiyor.

**İş:** iki şema + iki SQL + iki bileşen. Yeni tablo yok, migration yok.
Prototipin fiyat rozeti, üstü çizili `priorAmount`, "Fiyat sorulduğunda
belirlenir" durumu ve teslim ücreti satırının hepsi bu tek işle karşılanır.

### A2. Prototipin ölçtüğü diğer mevcut alanlar

`stockState` (stok etiketi), `amountSetAt` (fiyatın tazeliği — prototipteki
`seenAt`'ın karşılığı), `source` MANUAL/FEED/BUSINESS (prototipteki kaynak
rozetinin karşılığı), `productKey` (gruplama anahtarı, sorgusu yok),
`OfferingVisual.url` + `position=0` (kart görseli — prototip renk gradyanı
kullanıyor çünkü görsel yok, ama alan **var**).

---

## 3. Tür B — Model taşımıyor, ama PRD yasaklamıyor

### B1. Sıralama: yalnızca tarih var

Browse `published_at desc`, arama `matchLevel` sonra `published_at`
(`pg-discovery.repository.ts:444,525`). Prototipin dört sekmesinden:

| Sekme | Durum |
|---|---|
| En yeni | **Var** |
| Tümü (en ucuz) | Fiyat sıralaması — A1 yapılınca küçük iş |
| Yükselenler | **Veri kaynağı yok.** `heat` diye bir şey hiçbir yerde yok. |
| Popüler | **Veri kaynağı yok.** `popularity` hiçbir yerde yok. |

Son ikisi için `OfferingPresentationOpen` olay kaydı zaten var
(`schema.prisma:496`) — bir sayaç/pencere projeksiyonu bunu besleyebilir.
Ama bugün yok ve `Analytics` sözleşmesi "hiçbir şey türetilmez, ağırlıklandırılmaz,
puanlanmaz" diyor. Yani bu bir ürün kararı, sadece kod değil.

### B2. Bütçe filtresi yeni bir filtre türü

Filtreler bugün yalnızca Attribute üzerinden: NUMBER/BOOLEAN/SINGLE_SELECT/
MULTI_SELECT (`FILTERABLE_VALUE_KINDS`, `contracts:1474`). Fiyat bir Attribute
değil, `Offering` sütunu. Bütçe tavanı için `appliedFilterSchema`'ya yeni bir
tür ve projeksiyona bir fiyat sütunu gerekiyor.

**Çıkış yılı filtresi ise bedava:** NUMBER türünde bir Attribute olarak bugün
kurulabilir, kod değişikliği gerektirmez.

### B3. Çok satıcı — prototipin en büyük yapısal iddiası

`Offering` tam olarak bir `Business`'a ait: `businessId` zorunlu skaler FK,
`@@unique([businessId, slug])` (`schema.prisma:720,782`). "6 satıcı fiyat
veriyor, en düşüğü ₺8.900" kartının platformda karşılığı yok. `Merchant` diye
bir varlık da yok — satıcı = `Business`, ve bir Business'ın tam bir sahibi var.

İki yol:

- **(a) `productKey` ile gruplama.** PRD-0001 v4.0 §5.12 zaten "aynı Product
  Key'i taşıyan Offering'ler aynı ürün olarak *sunulur*" diyor ve benzer
  başlık/nitelik/fiyatın kanıt sayılmayacağını açıkça yazıyor. Yeni varlık
  yok, PRD açılmıyor. Gruplu sorgu + "en ucuz satır" kuralı + satıcı listesi
  gerekiyor. **Önerilen yol.**
- **(b) `Product` + `Merchant` varlıkları.** PRD-0001 v4.0 §4 bunları
  **isim isim reddediyor** (satır 128-135). Donmuş PRD'yi açmadan yapılamaz.

Prototipin satıcı satırındaki `listingTitle`, `dispatch`, `promotion` alanları
her iki yolda da yeni.

### B4. Taksonomi: yapı hazır, içerik boş

`Domain → Category` ağacı gerçek: `Category.parentId` self-relation, aynı
Domain içinde kalmayı zorlayan bileşik FK, `assignable()` yalnızca yaprakları
döndürüyor (`pg-catalog.repository.ts`). Domain seti I53 ile **açıldı** —
`V1_DOMAINS` enum'u kodda artık yok.

Yani senin 11 sektörün ve ~130 alt başlığın bugünkü modele **birebir oturuyor**:
sektör = Domain, alt başlık = yaprak Category. Eksik olan şema değil, veri ve
onu girecek yol: seed betiği yok, admin'de yeni Domain yaratan uç yok (I53
bunu açıkça kayda geçiriyor).

### B5. Görsel yükleme yok

`OfferingVisual` bir URL listesi; nesne deposu yok, yükleme yolu yok
(`schema.prisma:830-850`). Kart görselli olacaksa önce bu.

### B6. Favoriler — artık meşru, ama kodu yok

`UserFavourite` benzeri bir tablo yok; `ComparisonSet`/`DecisionFlow` 60
dakikalık ve anonim. **Ama 31 Ağustos 22:02'de donmuş `PRD-0007 — Member Area`
Favorileri ve Üye Profilini kapsam içine aldı** (§5.2, §6). Prototipteki
favori düğmesi artık spec'i olan bir özellik.

---

## 4. Tür C — Donmuş PRD yasaklıyor: önce karar

Bunlar kod eksiği değil. Prototip donmuş kapsamın dışına çıkıyor ve devam
etmeden önce ya PRD revize edilmeli ya da prototipten çıkarılmalı.

| Prototipteki şey | Engel |
|---|---|
| Yıldız puanı, ortalama, kullanıcı yorumları | PRD-0001 v4.0 §4: "rating, review, or seller score" açıkça kapsam dışı (satır 128-135). PRD-0005 v1.4 Revizyon Notu: "hosts no Reviews". `rating` kelimesi ne şemada ne sözleşmelerde geçiyor. |
| Satıcı puanı + "Yetkili satıcı" rozeti | Aynı madde. Business'ın puanı yok. |
| Editöryel inceleme (verdict, 0–10 skor, artı/eksi, video) | Hiçbir PRD'de yok. Yeni PRD ya da PRD-0001 revizyonu gerekir. |
| Taksit tutarı | V1_SCOPE §4 "Payment processing" kapsam dışı; faizsiz bölmeyle hesaplanan bir taksit rakamı finansal beyan riski taşır. Prototipte zaten çıkış yılıyla değiştirilmişti — **doğru karardı, öyle kalsın.** |

Ek olarak **iş modeli açısından kritik bir boşluk:** senin kategori listende
sigorta dikeyi için "poliçe satışı olmasa bile teklif (quote) / form doldurma
(CPL) başına komisyon" yazıyor. Platformda **lead yakalama yok.** Terminal
eylem olarak yalnızca iki şey modellenmiş: `AffiliateHandoff` (dış adrese
yönlendirme kaydı) ve `DirectContactReveal` (telefon/e-posta/URL'nin
gösterildiği kaydı). İkisi de bir *başlatma* kaydı; ne form, ne mesaj, ne
takip durumu. Prototipteki "Teklif İste" düğmesi de `href="#"` — ölü link.
CPL geliri hedefleniyorsa bunun bir PRD'si ve bir modeli olmalı.

---

## 5. Besleme (ingest) altyapısı: hiç yok

`Offering.source = MANUAL | FEED | BUSINESS` yalnızca bir **köken etiketi**;
şemada `Feed`, `ImportRun`, `IngestionJob`, `Source` diye bir model yok.
`OutboxEvent` giden e-posta kuyruğu, gelen veri değil. Worker'ın yaptığı iki
iş var: outbox e-posta gönderimi ve saklama süresi süpürmesi.

Yani "ağ beslemesi / satıcı API'si / site okuması" ayrımı prototipte bir rozet
olarak duruyor ama arkasında hiçbir boru hattı yok. Katalog da boş: seed
betiği yok, ilk kurulum `scripts/first-run.mjs` + `scripts/admin.mjs` ile
elle yapılıyor.

---

## 6. Bayat dokümanlar — düzeltilmesi gerekenler

Karar verirken bunlara güvenilmemeli:

| Doküman | İddia | Gerçek |
|---|---|---|
| `ARAYUZ_ALTYAPI_FARKI.md:32,158,195` | "`V1_DOMAINS` hâlâ kapalı bir enum" ve planın 1. maddesi "Domain setini aç" | I53 bunu kapattı. `grep V1_DOMAINS packages/contracts` → **sıfır sonuç**. |
| `SURFACE_INVENTORY.md:471`, `YUZEY_ENVANTERI.md`, `PROJE_TANITIMI.md:332`, `AFFILIATE_YOL_HARITASI.md:118` | "Datamodelde fiyat hiç yok" | I52 fiyatı ekledi (2026-08-30). Dördü de I52'den önce yazılmış, hiçbiri güncellenmemiş. |
| `PROTOTYPE_INTEGRATION_PLAN.md:94,120` | "Fiyat/satıcı içeren migration: 0" | Yazıldığı anda yanlıştı: I52 migration'ı 17 saat önce inmişti. |
| `CURRENT_STATUS.md` | Başlık v2.89 | Revizyon tablosunun son satırı **v2.54, 21 Ağustos**. Yaklaşık iki düzine artım kayıt dışı. |
| `ROADMAP_2026-08-22.md` | Geçerli yol haritası gibi duruyor | I34–I55 onu on artım geride bıraktı; "superseded" işareti yok. |

Ve iki **çözülmemiş donmuş–donmuşa çelişki**:

1. `V1_SCOPE.md:110` (Donmuş v1.1): *"V1 launches with three domains only"* ↔
   `PRD-0001-offering.md:177` (Donmuş v4.0): *"a Domain is … the set is open"*.
   `DOMAIN_SET_OPEN_DECISION.md` bu çelişkiyi çözerken `V1_SCOPE`'tan hiç söz
   etmiyor. **11 sektör açılacaksa V1_SCOPE revize edilmeli.**
2. `PRD-0002 §22 Result Delivery` (31 Ağustos 22:02'de donduruldu):
   sonuçlar sayfalanacak ve **her sayfanın kararlı, yer imine eklenebilir bir
   adresi olacak** ↔ `CURRENT_STATUS.md:1492`: kriterler beş dakikalık
   `httpOnly` çerezde taşınıyor, "bir Sonuçlar sayfası yer imine eklenemez —
   kabul edilmiş bir maliyet". O maliyet artık kabul edilmiyor ve depoda bunu
   kaydeden hiçbir şey yok.

Not: 31 Ağustos 22:02'de donan PRD grubu (`PRD-0002 §22`, `PRD-0005 v1.4`,
`PRD-0006 §20 Reklam Yerleşimi`, `PRD-0007 Member Area`) `CURRENT_STATUS.md`'nin
kendi son düzenlemesinden **40 dakika sonra** yazılmış. Statü dokümanı
PRD-0007'den ve reklam yerleşiminden haberdar değil.

---

## 7. Sıra

Önce karar, sonra kod. Kod tarafı, en yüksek getiri/maliyet oranından başlar.

### Faz 0 — Karar (kod yok)

1. Puan / yorum / editöryel inceleme: PRD revizyonu mu, prototipten çıkarma mı?
2. Çok satıcı: `productKey` gruplaması (PRD'ye uygun) mu, `Product` varlığı
   (PRD açma) mı?
3. `V1_SCOPE` üç domain sınırı: 11 sektör için revize edilecek mi?
4. `PRD-0002 §22` sayfalama + adres çelişkisi nasıl kapanacak?
5. CPL / teklif akışı ürün kapsamına alınacak mı?

### Faz 1 — Fiyatı yüzeye çıkar  *(küçük)*
`listingCardSchema` + `offeringPresentationSchema` + `listing-card.sql.ts` +
`pg-presentation.repository.ts` + kart ve ilan sayfası bileşenleri.
Bunun çıktısı: platform ilk kez bir fiyat karşılaştırma sitesi gibi görünür.

### Faz 2 — Fiyat sıralaması ve bütçe filtresi  *(orta)*
Projeksiyona fiyat sütunu, `appliedFilterSchema`'ya bütçe türü, sıralama
seçeneği. Çıkış yılı filtresi burada bir NUMBER Attribute olarak kurulur.

### Faz 3 — Taksonomi ve katalog  *(orta, çoğu veri işi)*
11 Domain + ~130 yaprak Category'nin girilmesi; yeni Domain yaratan admin ucu;
seed betiği; ilk ilanların girişi.

### Faz 4 — `productKey` gruplaması = çok satıcı görünümü  *(büyük)*
Gruplu sorgu, en ucuz satır kuralı, satıcı listesi, `listingTitle`/`dispatch`/
`promotion` alanları.

### Faz 5 — Favoriler  *(orta — PRD-0007 hazır)*
`UserFavourite`, `/favorilerim`, kart üzerindeki düğme, misafir için giriş kapısı.

### Faz 6 — Görsel yükleme  *(orta)*
Nesne deposu + yükleme yolu. Bundan önce kart görselini birincil öge yapma.

### Faz 7 — Besleme altyapısı  *(büyük)*
Feed/ImportRun/kaynak modeli, eşleme, tazelik. Sıralama I52'nin `source`
etiketiyle uyumlu: önce besleme, sonra satıcı API'si, en son site okuması.

### Faz 8 — Karar çıkarsa: CPL akışı, puan/yorum, editöryel inceleme

---

## 8. Prototipte olmayıp altyapıda olanlar

Bunlar kaybedilmemeli — prototip bunları çizmiyor ama platformun ayırt edici
parçaları:

- **Karar Sohbeti** gerçek bir LLM portu üzerinden çalışıyor
  (`anthropic.provider.ts`), ve briflemede olmayan bir sayı üretirse cevabı
  **reddeden** bir muhafız var (`inventsValue`, 422 `ASSISTANT_INVENTED_VALUE`).
  Prototipteki üç soruluk ağaç bunun yerine geçmiyor, önüne geçiyor.
- **Doğrudan İletişim** (telefon/e-posta/URL gösterimi) ve kaydı.
- 2–5 üyeli **Karşılaştırma Seti** (prototipte iki ürün).
- **İşletme paneli** ve **Admin paneli**: moderasyon vakaları, düzeltme
  talepleri, affiliate hedef doğrulama iş yükü, denetim kaydı.

Prototip bunları çizmediği için "yok" sanılmamalı.
