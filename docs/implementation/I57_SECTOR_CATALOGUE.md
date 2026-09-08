# I57 — Sektör taksonomisi ve bakılabilir bir katalog

Status: Complete · 2026-09-01 · PRD-0001 v4.0 §5.12, PRD-0002 §8

## Neden

I56 fiyatı yüzeye çıkardı ama gösterecek hiçbir şey yoktu: seed betiği yok,
katalog boş, ve `first-run.mjs`'in kendi ifadesiyle *"hiçbir şey yayımlanamaz,
Kategori olmadan"*. Yüz otuz Kategoriyi Admin ekranından elle açmak bir
başlangıç değil, her ortamda hafızadan tekrarlanacak bir veri girişi projesidir.

Asıl mesele bundan büyük. Sahibin modeli — partner firmaların fiyatları API ile
gelir, her ilan kullanıcıyı partnerin sayfasına yönlendirir — **beslemesiz
kanıtlanabilir.** Bir partner bir `Business`, o partnerin bir üründeki fiyatı
`amount` ve `AffiliateDestination` taşıyan bir `Offering`, aynı ürünü satan
partnerler ise ortak `productKey` taşıyan Offering'ler. Bu artım, beslemenin
sonradan otomatikleştireceği adımı elle yapıyor. Site bu veriyle çalışıyorsa
besleme bir otomasyon problemidir, bir tasarım problemi değil.

## Yapılan

| Katman | Değişiklik |
|---|---|
| Migration | `20260901000100_sector_domains` — on bir sektör Domain'i. Üçü zaten vardı: `MOBILITY`, `REAL_ESTATE`, `TECHNOLOGY` stable key'leriyle korundu, adları ve slug'ları Türkçeleştirildi. Sekizi yeni. |
| Betik | `scripts/seed-taxonomy.mjs` — her sektöre bir kök Kategori, altına başlıklar. 138 satır (11 kök + 127 başlık), `stable_key` üzerinden idempotent. |
| Betik | `scripts/seed-demo.mjs` — 7 partner İşletme, 6 ürün, 11 yayımlanmış ilan; hepsi **gerçek API üzerinden**. Affiliate hedefleri yazılıyor ve Admin tarafından incelenip doğrulanıp etkinleştiriliyor. İşletme slug'ı üzerinden idempotent. |

**Neden iki seviye.** Her başlık ayrı bir kök Kategori olsaydı anasayfa 127
düğmelik bir duvar olurdu — UX-0001 §8.1 Home'un kök Kategorileri düz listelemesini
istiyor ve gruplama icat etmesini yasaklıyor. Sektör adı kök, başlıklar onun
çocukları olunca anasayfa on bir isim gösteriyor; bu, sahibin analizinin
açılış listesiyle birebir aynı.

**Neden taksonomi SQL, demo API.** Bir Kategori yaratmak için onaylanmış hesap,
Admin yetkisi ve girilmiş Admin bağlamı gerekiyor — ilk Kategoriden önce üç
operatör adımı. `admin.mjs` bu durumun emsalini kurmuş, I53'ün kendi testi de
Domain'i böyle açıyor. Ama Offering'ler veritabanına doğrudan yazılamaz:
`composePublicEligibility` ve `PROJECT_OFFERING` atlanır ve satırlar Discovery'ye
görünmez olur — yalnızca `psql`'de var olan bir katalog.

## Doğrulama

Sıfırdan kurulum: veritabanı yeniden yaratıldı → 34 migration → `seed:taxonomy`
(138 eklendi) → `seed:demo` (11 ilan). Her iki betik ikinci çalıştırmada no-op.

Sonra API ve web gerçekten başlatılıp tarayıcıyla gezildi:

- Anasayfa on bir sektörü listeliyor.
- Sektör → başlık gezinmesi çalışıyor (Teknoloji altında 13 başlık).
- **Cep Telefonları'nda üç partnerin aynı ürün için üç fiyatı**: ₺42.990 (üstü
  çizili ₺45.990, stokta), ₺43.750 (stokta), ₺44.200 (stokta yok).
- İlan sayfası fiyatı, teslimat durumunu ve tutarın geçerlilik anını gösteriyor.
- Sigorta başlığında On Request ilan "Teklif alın" diyor, tutar göstermiyor.
- Karar akışında ilan seçilince **"İşletmenin sitesine gidin"** çıkıyor —
  affiliate yönlendirmesi uçtan uca çalışıyor (`handoffAvailable: true`).

`tsc -b`, `eslint`, `prettier --check` temiz; **123 dosya / 1138 test yeşil.**

## Bu artımın gösterdiği eksikler

1. **Aynı ürün üç ayrı kart olarak listeleniyor.** Beklenen: tek ürün kartı,
   "3 satıcı, en düşük ₺42.990". `productKey` yazılıyor ama hiçbir sorgu onunla
   gruplamıyor. Sıradaki iş bu (S4).
2. **Affiliate yönlendirmesi yalnızca Karar akışının içinde.** Sahibin istediği,
   listeleme ve ilan sayfasındaki "Güncel Fiyatı İncele" / "Teklif İste"
   düğmesinin doğrudan yönlendirmesi. Bugün ilan sayfası yalnızca Karşılaştır ve
   Karar sohbeti sunuyor; yönlendirme bir seçim adımının arkasında.
3. **Kart bilgi satırı uzun başlıklarda kötü sarıyor** — kategori ile işletme
   arasındaki ayraç nokta tek başına alt satıra düşebiliyor.
4. **`V1_SCOPE.md` §8 hâlâ "üç domain" diyor** ve Donmuş. Bu migration on bire
   çıkardı; doküman revize edilmeli.

## Açık kalanlar (I56'dan devam)

Feed için dar fiyat güncelleme yolu, fiyat sıralaması ve bütçe filtresi, fiyat
değişince projeksiyonun yeniden yazılması.
