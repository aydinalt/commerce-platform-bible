<!--
Owner:        Architecture Owner
Status:       Draft
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-30
-->

# Proje tanıtımı — ne yaptık, hangi sayfalar var, ne içeriyorlar

Bu belge, kurulu platformu **uyarlama kararı verebilmek için** okunacak şekilde
yazıldı. Her başlık koddan ve Frozen belgelerden çıkarıldı; hiçbir şey tahmin
değil.

Daha kısa bir referans isterseniz `YUZEY_ENVANTERI.md` her ekranın alan ve
eylem listesini kuru biçimde verir. Bu belge onun okunur hâli, artı amaç ve
kavram katmanı.

---

## 1. Platform ne yapıyor

Tek cümleyle: **bir kişinin açık bir ihtiyaçtan başlayıp bir işletmeyle temas
kurmasına kadar olan yolu tamamlayan bir ilan platformu.**

Ayırt edici tarafı şu: çoğu ilan sitesi kişiyi *sonuç listesine* kadar götürür
ve orada bırakır. Bu platform bir adım daha atıyor — **Karar Sohbeti** ile kişi
elindeki iki-beş seçenek arasından birini seçiyor, sonra platform onu ya
işletmenin sitesine yönlendiriyor ya da işletmenin iletişim bilgisini açıyor.

Yolculuk şöyle:

```
Ana sayfa: "Bugün ne yapmak istiyorsunuz?"
        │
        ├── Arama (yazılan sorgu)          ─┐
        └── Kategoriden başlama             ─┤
                                             ▼
                                    Sonuç listesi (İlan kartları)
                                             │
                                             ▼
                                    İlan sayfası (tam sunum)
                                             │
                          ┌──────────────────┴──────────────────┐
                          ▼                                     ▼
                   Karşılaştırma (2–5 ilan)              Doğrudan Karara başla
                          │                                     │
                          └──────────────────┬──────────────────┘
                                             ▼
                                      Karar Sohbeti
                                             ▼
                                    Bir ilanı seçme
                                             ▼
                   ┌─────────────────────────┴─────────────────────┐
                   ▼                                               ▼
        İşletmenin sitesine git                    İşletmeyle doğrudan iletişim
        (Yönlendirme adresi)                       (giriş yapmış olmak gerekir)
                   └─────────────────────────┬─────────────────────┘
                                             ▼
                                       Tamamlanma
```

### V1'de üç alan var

Platform üç **Alan** üzerine kurulu ve bu bir ürün kararıdır, kod kısıtı değil:
**Ulaşım**, **Emlak**, **Teknoloji**.

---

## 2. Temel kavramlar

Bu altı kelime tüm sistemin sözlüğü. Kodda, veritabanında ve ekranlarda aynı
anlamı taşıyorlar.

| Kavram | Ne demek |
|---|---|
| **İlan** (Offering) | Platformda keşfedilebilen ve değerlendirilebilen her şey. Alan fark etmeksizin aynı model. |
| **İşletme** (Business) | İlanın sahibi. Bir kullanıcı hesabı birden çok işletmeye sahip olabilir. |
| **Kategori** | İlanları düzenleyen ağaç. Bir ilan yalnızca **etkin bir yaprak** kategoriye atanabilir. |
| **Nitelik** (Attribute) | İlanı tarif eden alan. Kategoriye bağlı, filtrelenebilir ve karşılaştırılabilir olarak işaretlenebilir. |
| **Yönlendirme adresi** | İlanın kişiyi devrettiği adres. Ticari bir anlaşma değil, sadece *nereye gittiği*. |
| **Moderasyon vakası** | Platformun bir içerikle ilgili açtığı inceleme kaydı. |

### İlanın dört durumu

`Taslak → Yayında → Gizli → Arşivlenmiş`

**Hiçbir şey silinmiyor.** Arşivlenmiş bir ilan Yönetici tarafından hâlâ
okunabilir; buna "silme" demek olmayan bir yeteneği tarif etmek olurdu.

### Ayrı bir kavram: Herkese Açıklık

Bir ilanın "Yayında" olması ile **herkes tarafından görülebilir olması** iki
ayrı gerçektir. İkincisi kategorinin etkinliği, işletmenin moderasyon durumu ve
yayın asgarisi birlikte hesaplanarak bulunur. Ekranlar bu ikisini asla tek şey
gibi göstermez.

---

## 3. Roller ve bağlamlar

Dört bağlam var ve bir kişi bunlar arasında **açıkça** geçiş yapar:

| Bağlam | Nasıl girilir | Ne yapabilir |
|---|---|---|
| **Misafir** | Varsayılan | Arama, gezinme, ilan görüntüleme, karşılaştırma, Karar Sohbeti, işletme sitesine yönlendirilme |
| **Kullanıcı** | Giriş yapınca | Yukarıdakiler + doğrudan iletişim bilgisini görme |
| **İşletme bağlamı** | Hesabım'dan açıkça girilir | Kendi ilanlarını yönetme, işletme bilgisi, düzeltme yanıtlama |
| **Yönetici bağlamı** | Hesabım'dan açıkça girilir | Moderasyon, katalog yönetimi, analitik |

**Önemli bir güvenlik kuralı:** site başlığı asla Yönetici ya da İşletme
bağlamını isimlendirmez. Sayfanın kaynağını okuyan biri, o hesabın yönetici
yetkisi olup olmadığını anlayamaz.

---

## 4. Kamusal sayfalar (herkes görür)

### 4.1 Ana sayfa `/`

Tek bir soru ve iki yol.

- **Başlık:** "Bugün ne yapmak istiyorsunuz?" — bu metin Frozen, değiştirilemez
- **Arama kutusu** + "Ara" düğmesi
- **"Ya da bir kategoriden başlayın"** — kök kategoriler düğme olarak

**Kategori seçmek bir form gönderimidir, bağlantı değil.** Sebebi: bağlantı
yer imiyle ya da tarayıcının önyüklemesiyle tetiklenebilir, o zaman kişi
"aramaya başlamamış" olur ama sistem başladığını sanır.

### 4.2 Sonuç listesi `/discovery`

İki yoldan da buraya gelinir; başlık hangi yoldan gelindiğine göre değişir.

- **Başlık:** `"sorgu" için sonuçlar` ya da kategori adı
- **Kategori yolu** (kırıntı)
- **Daraltma:** alt kategoriler
- **Filtreler:** o kategorinin filtrelenebilir nitelikleri
- **Sonuçlar:** İlan kartları — başlık, kategori, işletme, görsel
- **Sonuç yoksa:** ölçütler ekranda kalır ve sınırlı kurtarma yolları sunulur

### 4.3 İlan sayfası `/offerings/{slug}`

- Başlık, kategori yolu, açıklama, görseller
- **Nitelik tablosu** — belirtilmemiş nitelikler "belirtilmedi" olarak görünür,
  gizlenmez
- İşletme kimliği: ad, kısa açıklama, logo
- İki devam yolu: **Karara başla**, **Karşılaştırmaya ekle**

### 4.4 Karşılaştırma `/compare`

- **2–5 ilan**, aynı kategoriden olmak zorunda
- Nitelik nitelik tablo
- İlan çıkarma
- Karara geçiş

Beşten fazlası eklenemez; farklı kategoriden eklenemez. İkisi de reddedilir ve
sebebi yazılır.

### 4.5 Karar akışı `/decision`

Beş bölüm:

1. **Geçersizlik bildirimi** — akış artık sürdürülemiyorsa
2. **Karşılaştırdıklarınız**
3. **Karar Sohbeti** — yapay zekâ destekli, akışa özel, kalıcı hafızası yok
4. **Nasıl devam etmek istersiniz?** — iki yol
5. **Tamamlanma**

**Sohbet karar vermez.** Kişi açıkça bir ilan seçer; sohbet yalnızca yardım
eder.

---

## 5. Kimlik sayfaları

| Sayfa | İçerik |
|---|---|
| `/register` | Hesap oluşturma — e-posta, parola |
| `/register/confirm` | E-postadaki bağlantının hedefi |
| `/login` | Giriş |
| `/recover` | Parola sıfırlama isteği |
| `/recover/reset` | Sıfırlama bağlantısının hedefi |
| `/account` | Hesabım — bağlam girişleri, çıkış |

**Güvenlik davranışları (bunlar kasıtlı ve değiştirilmemeli):**

- Başarısız giriş **hangi yarının yanlış olduğunu söylemez** — "e-posta ya da
  parola doğru değil"
- Parola kurtarma **"Bu adrese ait bir hesap varsa"** der; hesabın varlığını
  ifşa etmez
- Harcanmış, süresi dolmuş ve sahte bağlantı **aynı mesajı** alır

---

## 6. İşletme paneli

### 6.1 Pano `/businesses/{id}`

- **İşletme adı** ve **moderasyon durumu** (Kısıtlı / Kısıtlama yok) — sayfanın
  her yerinde görünür kalır
- Kısıtlıysa: sonucun ne olduğu cümleyle açıklanır
- **İşletme bilgilerini yönet** bağlantısı
- **Envanter, yaşam döngüsüne göre dört grup:** Taslak, Yayında, Gizli,
  Arşivlenmiş
- Her ilanda: başlık, herkese açıklık durumu, ve **o an izin verilen eylemler**

**Eylemler ekran tarafından hesaplanmaz** — API hangi eylemlerin geçerli
olduğunu söyler, ekran yalnızca çizer. Arşivlenmiş bir ilan hiç eylem taşımaz.

### 6.2 İşletme bilgileri `/businesses/{id}/information`

İki grup ve ayrı olmaları esastır:

- **Herkese açık kimlik** — görünen ad (zorunlu), kısa açıklama, logo adresi
- **Doğrudan iletişim** — e-posta, telefon, web sitesi. *Yalnızca giriş yapmış
  ve iletişime geçmek isteyen kişiye gösterilir; herkese açık sayfalarda asla
  görünmez.*

### 6.3 İlan düzenleme `/businesses/{id}/offerings/{id}`

- İçerik alanları ve kategorinin geçerli nitelikleri
- Yayın asgarisi eksikleri kişiye söylenir
- Yayımla / Arşive kaldır

### 6.4 Yönlendirme adresi `/businesses/{id}/offerings/{id}/destination`

- Adresin durumu, doğrulama sonucu, devir uygunluğu
- **Uyarı önceden verilir:** yeni adres kaydetmek adresi "açık değil" ve
  "kontrol edilmedi" durumuna döndürür. Bunu sonradan öğrenmek geç olurdu.

### 6.5 Düzeltme bildirimi `/businesses/{id}/corrections/{id}`

Platform bir düzeltme istediğinde sahibin gördüğü ekran ve **sınırlı** düzenleme
yolu — yalnızca istenen alan düzenlenebilir.

---

## 7. Yönetici paneli

### 7.1 Panel girişi `/admin`

**Sizi bekleyenler** — bekleyen iş sayıları, ve dokuz yönetici işlevi:

| İşlev | Sayfası var mı |
|---|---|
| Moderasyon vakaları | ✓ `/admin/moderation-cases` |
| Yönlendirme adresleri | ✓ `/admin/destinations` |
| Kategoriler | ✓ `/admin/categories` |
| Nitelik tanımları | ✓ `/admin/attributes` |
| İşletme moderasyonu | vaka içinden |
| İlan moderasyonu | vaka içinden |
| Hesap erişimi | vaka içinden |
| İlan geçmişi | vaka içinden |
| Düzeltme iste | vaka içinden |

Ayrıca **Temel Analitik**: dört dönem (Bugün, Son 7 gün, Son 30 gün, Tüm
zamanlar) ve Alan kırılımı. Özel tarih aralığı **yok** — bu kasıtlı, rapor
oluşturucuya dönüşmesin diye.

### 7.2 Moderasyon vakaları `/admin/moderation-cases`

- Açık / Kapalı filtresi
- Vaka listesi: hedef türü, açılış tarihi, kaydedilen karar sayısı
- "Yeniden inceleme bekliyor" işareti — sahibi yanıt verdiyse

**Vaka içindeki yedi eylem:**

1. Bu İlanı gizle
2. Bu İlanı yeniden yayına al
3. Bu İşletmeyi kısıtla
4. Bu İşletmenin kısıtlamasını kaldır
5. Bu hesabı askıya al
6. Bu hesabı geri getir
7. Düzeltme iste

Artı: **karar kaydetmeden kapatma** (gerekçe zorunlu) ve **yeniden inceleme**.

### 7.3 Yönlendirme adresleri `/admin/destinations`

Denetim bekleyen adresler; incele, doğrula, aç, kapat.

**Açıkça yazılmıştır:** bu ekran Genel Moderasyon değildir; buradaki hiçbir şey
moderasyon vakası açmaz veya kapatmaz.

### 7.4 Kategoriler `/admin/categories`

Oluştur, yeniden adlandır, taşı, emekliye ayır. Ağaç kuralları veritabanı
düzeyinde zorlanır.

### 7.5 Nitelikler `/admin/attributes`

Tanımla, düzenle, değer türünü değiştir, kategorilere ata, zorunluluk ayarla,
seçenek etiketlerini düzenle.

---

## 8. Sistemin uyduğu kurallar

Bunlar tasarım tercihi değil, kodda zorlanan davranışlar:

- **Kesinti ile boşluk asla karıştırılmaz.** API erişilemezse ekran "hiçbir şey
  yok" demez, "şu anda getirilemedi" der. Bu, 15 rotada ayrı ayrı ele alındı.
- **Reddedilen bir işlem neyin değişmediğini söyler.** "Hiçbir şey değişmedi."
- **Renk tek başına anlam taşımaz.** Kısıtlı bir işletme, rozetin rengiyle değil
  içindeki kelimeyle anlaşılır.
- **Her yerde Türkçe.** 22 rota, `<html lang="tr">`, tek sözlük.
- **Her kontrol en az 2,75rem yüksekliğinde** — dokunma hedefi.
- **Yoğunluk boşluktan ve ızgaradan gelir**, küçük düğmelerden değil.

---

## 9. Sayısal durum

| | |
|---|---|
| Web rotası | 22 |
| API operasyonu | 87 |
| Veritabanı tablosu | 39 |
| Migration | 32 |
| Test | 118 dosya / 1073 test |
| Frozen Story | 50'nin 50'si tamam |
| Güvenlik açığı | 0 |

---

## 10. Bilerek **olmayanlar**

Uyarlama düşünürken en önemli bölüm burası. Bunlar unutulmuş değil; datamodelde
karşılığı **yok**, dolayısıyla ekranda gösterilecek bir şey de yok.

- **Fiyat** — hiçbir yerde
- **Satıcı / mağaza** — bir ilan tek bir işletmeye ait, "aynı ürünü satan farklı
  kaynaklar" kavramı yok
- **Puan ve yorum** — hiçbir yerde
- **Konum** — hiçbir yerde
- **Favori / kayıtlı ilan** — yok
- **Mesajlaşma** — yok; iletişim, bilgiyi açmakla biter
- **Ödeme** — yok
- **Görsel yükleme** — ilan görsel taşıyabilir ama yükleme yolu yok
- **Bildirim** — yok
- **Karanlık mod** — yok
- **Ayarlar sayfası** — yok
- **KVKK / gizlilik / kullanım koşulları** — 0 sayfa
- **Katalog içeriği** — veritabanı boş; kategori ve nitelikler girilmemiş

---

## 11. Yayına çıkmadan önce gerekenler

Hiçbiri kod işi değil:

1. Vercel projesi ve Supabase örneği oluşturulmalı
2. Worker cron sıklığı — Hobby planı günde 1 kez, yani **kayıt e-postası 24 saat
   bekler ve kimse üye olamaz.** Pro plan ya da process host kararı
3. Postmark ve Anthropic anahtarları — yoksa production açılmıyor
4. KVKK belgeleri
5. Yedekleme, geri yükleme provası, alarm
6. Katalog içeriği

---

## 12. Bana ne söylemeniz gerekiyor

Uyarlama için en çok işime yarayacak bilgiler:

- **Ürün modeli:** Bir ilanı tek bir işletme mi satacak, yoksa aynı ürünü birden
  çok satıcı mı? Bu tek soru, fiyat karşılaştırmasının mümkün olup olmadığını
  belirliyor.
- **Fiyat nereden gelecek:** İşletme mi girecek, yoksa satıcı sitelerinden
  toplanacak mı? İkincisi ayrı ve büyük bir sistem.
- **Alanlar:** Ulaşım / Emlak / Teknoloji kalacak mı, değişecek mi?
- **Karar Sohbeti kalacak mı?** Ürünün ayırt edici tarafı bu; fiyat
  karşılaştırmasına dönerse rolü değişir.
- **Hangi ekranlar öncelikli?** 22 rotanın hepsini birden değiştirmek yerine
  sırayla gitmek daha güvenli.
