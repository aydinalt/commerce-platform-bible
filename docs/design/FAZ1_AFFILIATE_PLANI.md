<!--
Owner:        Architecture Owner
Status:       Draft — awaiting Owner approval
Maintenance Mode: Living
Version:      0.1
Last Updated: 2026-08-30
-->

# Faz 1 — Affiliate planı, üç karar alındıktan sonra

Owner'ın 2026-08-30 kararları:

1. **Sistem işletmesi** — Faz 1'de ilanların sahibi platformun kendi işletme
   kaydı.
2. **Fiyat İlan'ın** — Ürün/Satıcı ayrı varlıklar olarak kurulmayacak.
3. **Kaynak sırası:** Affiliate ağı beslemesi → Satıcı API'si → Site kazıma.

Bu belge o üç kararın ne kazandırdığını, neyi hâlâ çözmediğini ve ilk artımın ne
olduğunu yazar.

---

## Karar 1 — Sistem işletmesi: sıfır kod değişikliği

`Offering.businessId` zorunlu kalıyor. Platform kendini bir İşletme olarak
kaydediyor ve Faz 1'in tüm ilanları ona ait.

**Bedava gelenler:**

- İlan yaşam döngüsü (Taslak → Yayında → Gizli → Arşivlenmiş) olduğu gibi çalışır
- Yayın asgarisi kontrolü çalışır
- Moderasyon, kısıtlama, düzeltme akışı çalışır
- Faz 2'de gerçek işletmeler geldiğinde **hiçbir şey değişmez** — sadece yeni
  işletme kayıtları açılır

**Tek dikkat:** sistem işletmesi kamusal yüzeyde görünür (kart üzerinde
"işletme adı"). Ona ne isim vereceğiniz bir marka kararı — platformun kendi adı
mı, yoksa "Editör seçimi" gibi bir şey mi.

---

## Karar 2 — Fiyat İlan'ın: ne kazandırıyor, neyi çözmüyor

### Kazandırdığı

`Product`, `Merchant`, `PriceOffer` **üç yeni varlığın hiçbiri gerekmiyor.**
Yerine `Offering` üzerinde birkaç alan:

| Alan | Tür | Not |
|---|---|---|
| `price` | `Decimal(12,2)?` | Kuruş hassasiyeti. `null` = fiyat bilinmiyor |
| `currency` | `char(3)` | `TRY` varsayılan; ileride çok para birimi |
| `listPrice` | `Decimal(12,2)?` | Üstü çizili fiyat, indirim yüzdesi bundan |
| `priceSeenAt` | `timestamptz?` | Fiyatın en son ne zaman okunduğu |
| `shippingCost` | `Decimal(12,2)?` | `0` = ücretsiz, `null` = bilinmiyor |
| `stockState` | enum? | `IN_STOCK` / `OUT_OF_STOCK` / `UNKNOWN` |

Bir migration, birkaç sözleşme alanı. **Prototipin fiyat gösteren her parçası bu
alanlarla çalışır**: kart fiyatı, indirim çipi, bütçe filtresi, taksit şeridi,
alternatif ürün bandı.

### Çözmediği — ve bunu şimdi söylemem gerekiyor

Akakçe'nin "8 satıcı, ucuzdan pahalıya" listesi **bir ürünün birden çok satıcısı
olduğunu bilmeyi** gerektirir. Fiyatı İlan'a koymak bu bilgiyi ortadan
kaldırmaz, sadece **başka bir yere taşır**: artık iki İlan'ın *aynı ürün*
olduğunu bir şeyin söylemesi lazım.

İki yol var:

**(a) Gruplama olmasın.** Site, fiyatlı bir ilan sitesi olur. Her ilanın tek
fiyatı vardır, satıcı listesi bölümü kaldırılır. Tutarlı ve en ucuz yol.

**(b) İlan'a bir eşleştirme anahtarı ekleyin.** Aynı anahtarı taşıyan ilanlar
tek ürün gibi gösterilir ve fiyata göre sıralanır — Akakçe görünümü korunur.

```
Offering.productKey  varchar(64)?   ← GTIN/EAN, yoksa MPN, yoksa null
```

**Bu, tek bir nullable sütun.** Ve affiliate beslemeleri zaten GTIN/EAN
gönderiyor — yani anahtar bedava geliyor. Anahtarı olmayan ilan tek başına
görünür, hiçbir şey bozulmaz.

> **Önerim (b).** Bugün bir nullable sütun, sonra yeniden yazım yok. (a)'ya
> geçmek isterseniz sütunu görmezden gelmek yeter; (a)'dan (b)'ye geçmek ise
> migration + veri geriye doldurma demektir.

**Bu bir karar ve sizin.**

---

## Karar 3 — Kaynak sırası: besleme önce

Doğru sıra. Sebepleri:

| Kaynak | Zorluk | Veri kalitesi | Hukuki |
|---|---|---|---|
| **Affiliate ağı beslemesi** | Düşük — yapılandırılmış dosya | Yüksek — GTIN, marka, kategori dâhil | **Temiz** — sözleşmeyle veriliyor |
| Satıcı API'si | Orta — satıcı başına entegrasyon | Yüksek | Temiz — anlaşmaya bağlı |
| Site kazıma | Yüksek — kırılgan, sürekli bakım | Düşük — eşleştirme zor | **Riskli** — şartlar ve KVKK |

Kazımayı en sona koymanız doğru. Ondan önce ürün çalışır durumda olacak.

### Besleme neyi getiriyor

Tipik bir affiliate ürün beslemesi (XML/CSV) şunları taşır:

`satıcı adı · ürün adı · açıklama · fiyat · para birimi · deeplink · görsel
URL'leri · kategori · marka · GTIN/EAN/MPN · stok · kargo`

**Bunların çoğunun karşılığı zaten var:**

| Besleme alanı | Nereye gider |
|---|---|
| ürün adı | `Offering.title` — **var** |
| açıklama | `Offering.description` — **var** |
| görsel URL'leri | `Offering.visuals[]` — **var** |
| kategori | `Category` eşleştirmesi — **var** (eşleştirme kuralı yeni) |
| deeplink | `AffiliateDestination.reference` — **var** |
| marka | yeni: `Offering.brand` ya da bir Nitelik |
| fiyat, kargo, stok | yeni: yukarıdaki alanlar |
| GTIN | yeni: `productKey` (karar (b) ise) |

### Yeni gereken: besleme altyapısı

```
FeedSource     ağ adı, satıcı, biçim (XML/CSV/JSON), URL, kimlik bilgisi,
               çalışma sıklığı, etkin mi
FeedRun        ne zaman, kaç satır okundu, kaç kabul, kaç ret, hata özeti
FeedItem       kaynak satırın kimliği ve hangi İlan'a döndüğü
```

`FeedRun` **isteğe bağlı değil.** Bir besleme sessizce bozulduğunda — satıcı
alan adını değiştirdiğinde, dosya boş geldiğinde — bunu ancak çalışma kaydı
söyler. Kayıt tutmayan bir toplama sistemi, bir gün bütün fiyatları silen ve
kimsenin fark etmediği bir sistemdir.

Ve worker altyapısı **zaten var** — I38'de kurulan zamanlanmış uç nokta ve
outbox boşaltma mekanizması aynı kalıbı kullanıyor.

### Ve bir alan daha: ilanın nereden geldiği

```
Offering.source  enum: MANUAL | FEED | BUSINESS
```

Tek enum sütunu, ama üç işi birden yapıyor:

- Yönetici, elle girdiğini beslemenin ezmesini istemez — besleme yalnızca
  `FEED` kaynaklı ilanları günceller
- Moderasyon kuyruğunda "hangi kaynaktan geldi" görünür
- **Faz 2'de işletmeler geldiğinde** ayrım hazır bekler

---

## Sıralı plan

| # | Artım | Ne yapar |
|---|---|---|
| 1 | **Alanları çoğalt** | Araç, Sigorta ve gerekenler. Migration seed + sözleşme sabiti |
| 2 | **`Attribute.group`** | Epey usulü gruplu nitelik tablosu |
| 3 | **Fiyat alanları** | `price`, `currency`, `listPrice`, `priceSeenAt`, `shippingCost`, `stockState` + `source` + (karar (b) ise) `productKey` |
| 4 | **Sistem işletmesi** | Seed kaydı ve Yönetici'nin onun adına ilan açabilmesi |
| 5 | **Yönetici ürün girişi** | Elle ilan ekleme ekranı — İşletme panelindekinden uyarlanır |
| 6 | **Görsel yükleme** | Beslemede URL geliyor; elle girişte yükleme gerekir |
| 7 | **Besleme altyapısı** | `FeedSource`, `FeedRun`, `FeedItem` + Yönetici ekranı |
| 8 | **İlk besleme bağlayıcısı** | Tek ağ, tek satıcı, uçtan uca |
| 9 | **Tasarımı gerçek API'ye bağla** | Prototipin görünümü, artık fiyatlı |
| 10 | **Satıcı API'si** | İkinci kaynak türü |
| 11 | **Site kazıma** | Üçüncü kaynak türü |

**1–5 arası fiyatlı bir siteyi elle doldurmanıza yeter.** 7–8 onu otomatiğe
bağlar. 9 görünümü tamamlar.

---

## Faz 2 için not

İşletmeler girdiğinde eklenecek tek yeni şey **işletmenin kendi fiyatını
girmesi**. Kayıt, işletme profili, envanter, ilan oluşturma, yayın asgarisi,
moderasyon, düzeltme akışı — hepsi kurulu ve `source = BUSINESS` ile
kendiliğinden ayrışır.

---

## Hâlâ duran engeller

Bunlar değişmedi ve hiçbiri kod işi değil:

- Vercel projesi ve Supabase örneği oluşturulmadı
- Worker cron sıklığı kararı — **beslemeler için bu artık daha kritik**, çünkü
  fiyat tazeliği doğrudan buna bağlı
- Postmark ve Anthropic anahtarları
- KVKK / gizlilik / kullanım koşulları — 0 sayfa
- Yedekleme, geri yükleme provası, alarm
- Katalog içeriği

---

## Bekleyen tek karar

**Eşleştirme anahtarı (`productKey`) eklenecek mi?**

- **Evet** → Akakçe usulü "N satıcı, ucuzdan pahalıya" görünümü mümkün olur.
  Maliyet: bir nullable sütun.
- **Hayır** → Site fiyatlı bir ilan sitesi olur; satıcı listesi bölümü
  prototipten kaldırılır.
