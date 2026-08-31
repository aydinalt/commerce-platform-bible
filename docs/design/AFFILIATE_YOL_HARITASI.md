<!--
Owner:        Architecture Owner
Status:       Draft — awaiting Owner approval
Maintenance Mode: Living
Version:      0.1
Last Updated: 2026-08-30
-->

# Affiliate ile başlayan plana kurulu sistemden ne taşınır

Owner'ın 2026-08-30 tarihli tarifi:

> Birçok alan olacak — ulaşım, emlak, teknoloji, araç, sigorta vb. Affiliate ile
> başlayacağız, ilk iş fiyat toplama olacak. Ürünleri hem otomatik çekmemiz hem
> manuel girmemiz gerekebilir. İşler büyüyünce işletmeler ve kullanıcılar da
> sisteme girip ürün yükleyebilecek.

Bu belge, o plana kurulu sistemin **hangi parçasının olduğu gibi** taşındığını,
hangisinin **değiştirilerek** taşındığını ve neyin **sıfırdan** gerektiğini
sayarak gösteriyor.

**Kısa cevap: bu plan için kurulu sistem beklenenden çok daha uygun.** Aşağıdaki
üç bulgu bunun sebebi.

---

## Bulgu 1 — "Alan" sabit değil, veritabanı tablosu

`packages/database/prisma/schema.prisma` içinde **`model Domain`** var. Yani
Alan bir enum değil, kayıt.

`packages/contracts/src/index.ts` içindeki
`V1_DOMAINS = ["MOBILITY","REAL_ESTATE","TECHNOLOGY"]` yalnızca V1'in *seçtiği*
üç tanesi.

**Sonuç:** Araç, Sigorta, Sağlık, Finans… eklemek **mimari değişiklik değil**.
Bir migration ile seed, bir de sözleşme sabitini genişletme işi. Kategori ağacı
ve nitelikler zaten Alan'a bağlı çalışıyor.

## Bulgu 2 — Affiliate altyapısı zaten kurulu

Aradığınız affiliate iş modeli için gereken model **tam olarak var**:

`AffiliateDestination`:

| Alan | Ne işe yarar |
|---|---|
| `reference` | Yönlendirilecek adres (2048 karakter) |
| `status` | `DRAFT` → `ENABLED` → `DISABLED` |
| `validationResult` | `NOT_VALIDATED` / `VALID` / `INVALID` |
| `validationReason` | Neden öyle karar verildiği |
| `validatedAt`, `validatedBy` | Kim, ne zaman doğruladı |
| `handoffEligibility` | Devir uygun mu — durum ve doğrulamadan **türetilir** |
| `version` | Değişiklik izi |

Artı `AffiliateDestinationReview` — her incelemenin kimin yaptığı, notu ve
zamanıyla **denetim kaydı**.

Ve tıklama ölçümü de kurulu:

- **`AffiliateHandoff`** — hangi karar akışından, hangi ilan için, **o an
  geçerli olan adres neydi**, ne zaman. Adresin o anki hâlini saklaması önemli:
  adres sonradan değişse bile geçmiş rapor doğru kalır.
- **`DirectContactReveal`** — iletişim bilgisinin hangi kanalda açıldığı.

**Yönetici tarafında ekranı da var:** `/admin/destinations` — denetim bekleyen
adresler, incele, doğrula, aç, kapat.

**Sonuç:** affiliate iş modelinin çekirdeği — adres, doğrulama, açma/kapama,
denetim kaydı ve tıklama sayacı — yazılmış ve test edilmiş durumda.

## Bulgu 3 — Nitelik sistemi çok alanlı kataloğa uygun

`AttributeValueKind`: `TEXT`, `NUMBER`, `BOOLEAN`, `SINGLE_SELECT`,
`MULTI_SELECT`.

Nitelikler kategorilere atanıyor, `filterable` ve `comparable` olarak
işaretlenebiliyor, `requiredForPublication` ile yayın asgarisi kuruluyor.

**Sonuç:** telefonun "RAM"i ile sigortanın "teminat türü" aynı sistemde durur.
Her alan için yeni tablo gerekmez.

---

## Aşama 1 — Affiliate, ürünleri siz giriyorsunuz

### Olduğu gibi taşınanlar

| Parça | Durum |
|---|---|
| Kategori ağacı ve yönetimi | **Hazır** — oluştur, adlandır, taşı, emekliye ayır |
| Nitelik sistemi ve yönetimi | **Hazır** — 5 değer türü, kategoriye atama, zorunluluk |
| Arama | **Hazır** — sorgu eşleştirme, eşleşme seviyesi, sıralama |
| Kategori gezinme | **Hazır** — ağaç, kırıntı, kardeş, alt kategori |
| Nitelik filtreleri | **Hazır** — PRD'nin birleştirme mantığıyla |
| Sonuç yok durumu | **Hazır** — ölçütler ekranda kalır |
| İlan sayfası | **Hazır** — açıklama, görseller, nitelik tablosu |
| Karşılaştırma (2–5) | **Hazır** |
| **Yönlendirme adresi + doğrulama + denetim** | **Hazır** |
| **Devir kaydı (tıklama)** | **Hazır** |
| Yönetici paneli ve analitik | **Hazır** — 4 dönem, Alan kırılımı |
| Kimlik, oturum, güvenlik davranışları | **Hazır** |
| Kesinti/boşluk ayrımı, hata yüzeyleri | **Hazır** — 22 rota |

### Değiştirilerek taşınanlar

| Parça | Ne değişir |
|---|---|
| **Alanlar** | 3 → N. Migration ile seed + sözleşme sabitini genişlet |
| **Nitelik grubu** | `Attribute`'a `group` alanı ekle — Epey usulü gruplu tablo için |
| **İlan sahipliği** | Bugün her İlan bir İşletmeye ait. Aşama 1'de sahibi **platformun kendisi**. İki yol var: (a) platformu bir "sistem işletmesi" olarak kaydet — hiçbir kod değişmez; (b) `Offering.businessId` opsiyonel yap — migration gerekir. **(a) önerilir** |
| **Karar Sohbeti** | Kalır ama Aşama 1'de ikincil. Fiyat karşılaştırmasında rolü "hangisini alayım" olur |

### Sıfırdan gerekenler

| Parça | Neden |
|---|---|
| **Fiyat modeli** | Datamodelde fiyat **hiç yok**. 32 migration'ın sıfırında geçmiyor |
| **Satıcı (Merchant)** | Yok |
| **Ürün ↔ Satıcı ilişkisi** | Bugün bir İlan tek bir İşletmeye ait |
| **Fiyat toplama sistemi** | Otomatik çekme — bu depodaki hiçbir şeye benzemeyen ayrı bir sistem |
| **Manuel ürün girişi (Admin)** | Yönetici panelinde ürün ekleme ekranı yok — İşletme panelinde var, oradan uyarlanır |
| **Görsel yükleme** | İlan görsel taşıyabiliyor ama yükleme yolu yok |

---

## Aşama 2 — İşletmeler ve kullanıcılar sisteme giriyor

**Bu aşama için neredeyse hiçbir şey yazılması gerekmiyor.** Zaten kurulu:

| Parça | Durum |
|---|---|
| Kayıt, e-posta doğrulama, giriş, parola kurtarma | **Hazır** |
| İşletme profili ve bağlam girişi | **Hazır** |
| İşletme panosu, yaşam döngüsüne göre envanter | **Hazır** |
| İlan oluşturma ve düzenleme | **Hazır** |
| Yayın asgarisi kontrolü | **Hazır** |
| İşletme bilgisi — herkese açık / korumalı ayrımı | **Hazır** |
| **Moderasyon: 7 eylem, vaka kuyruğu, yeniden inceleme** | **Hazır** |
| **Düzeltme bildirimi ve sınırlı düzenleme** | **Hazır** |
| Kısıtlı işletmenin sonuçları | **Hazır** |

Aşama 2'de eklenecek tek yeni şey: işletmenin **kendi fiyatını girmesi** ve
görsel yüklemesi.

**Bu, planınızın en değerli tarafı:** Aşama 1'i affiliate olarak kurarken,
Aşama 2'nin altyapısı zaten hazır bekliyor olacak. Çoğu proje bunu tersten
yaşar — önce basit kurar, sonra moderasyon ve sahiplik katmanını sıfırdan yazar.

---

## Önerilen sıra

| # | Artım | Bağımlılık |
|---|---|---|
| 1 | Alanları çoğalt — Araç, Sigorta ve gerekenler | — |
| 2 | `Attribute.group` ekle, gruplu nitelik tablosunu çiz | — |
| 3 | Prototipin tasarımını gerçek API'ye bağla (fiyatsız) | 2 |
| 4 | Yönetici panelinde **manuel ürün girişi** ekranı | 1 |
| 5 | Görsel yükleme yolu | — |
| 6 | Katalog içeriğini gir — kategori ve nitelikler | 1, 2 |
| 7 | **Fiyat + Satıcı datamodeli** | 6 |
| 8 | Fiyat listesi ve bütçe/taksit filtreleri | 7 |
| 9 | Otomatik fiyat toplama | 7 |
| 10 | İşletme fiyat girişi (Aşama 2) | 7 |

**3'e kadar olan her şey fiyat beklemeden yapılabilir** ve gerçek veriyle
görülebilir bir site verir.

---

## Karar bekleyen üç şey

1. **Aşama 1'de ilanların sahibi kim?** Sistem işletmesi mi (kod değişmez),
   yoksa sahipsiz ilan mı (migration gerekir)?
2. **Fiyat kimin?** Bir İlan'ın mı, yoksa bir Ürün'ün altındaki satıcıların mı?
   İkincisi `Product` ile `Offering`'i ayırmayı gerektirir ve PRD-0001'i
   değiştirir.
3. **Otomatik çekme nereden?** Satıcı API'si mi, affiliate ağı beslemesi mi,
   yoksa site kazıma mı? Üçü çok farklı sistemler ve hukuki sonuçları da farklı.

---

## Söylememem yanlış olur

**Fiyat toplama işi, bu depodaki her şeyden büyük olabilir.** Otomatik çekme
demek: kaynak başına ayrı bağlayıcı, kırıldığında haber veren izleme, eşleştirme
mantığı (aynı ürün farklı satıcıda farklı isimle), tazelik politikası ve
hukuki taraf. Kurulu platform bunu yapmıyor ve yapması için tasarlanmadı — ama
**topladığınız fiyatı gösterecek her şeye sahip.**

Ayrıca hâlâ duran yayın engelleri değişmedi: Vercel/Supabase yok, worker cron
kararı verilmedi, KVKK 0 sayfa, katalog boş.
