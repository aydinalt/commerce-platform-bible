# Ürün karşılaştırma prototipi

Next.js 15 (App Router) + React 19 + Tailwind v4. Ana depodan **tamamen ayrı**
bir uygulama: `apps/`, `packages/` ve `modules/` içindeki hiçbir dosyaya
dokunmaz, ana `npm run verify` zincirine girmez.

```bash
cd prototype
npm install
npm run dev     # http://localhost:3000
```

## Bu prototip, kurulu üründen farklı bir ürün

Yazmadan önce ölçüldü, ve dördü kodla çözülemez:

| İstenen | Bugünkü durum |
|---|---|
| Fiyat aralığı, fiyat sıralama, taksit | **`packages/contracts` içinde hiçbir yerde fiyat alanı yok.** `SURFACE_INVENTORY.md` §7 bunu "kimse olmayan bir alanı tasarlamasın" diye kayda geçirmişti |
| Bir ürünü satan farklı kaynaklar (Akakçe) | **Yok.** Bir İlan tam olarak bir İşletmeye ait; "aynı Ürün, çok satıcı" yeni bir varlık — `Product` ile `Offering` ayrışması gerekir |
| Satıcı puanı (★ 4,7) | **Yok.** Datamodelde puan/yorum yok |
| Anlık (client-side) filtreleme | Kurulu uygulamada filtre bir **form gönderimi**; `US-DSC-F06-001` bir Discovery Start'ı kasıtlı bir olay sayıyor. Buradaki yazdıkça filtreleme hiçbir olay kaydetmiyor |
| Tailwind | Ana uygulama 1045 satır token'lı düz CSS kullanıyor ve testlerle zorlanıyor |

`src/lib/types.ts` bu eksik varlıkları, gerçekmiş gibi yazılmış tiplerle
öneriyor: onaylanırsa sözleşmelerin alması gereken şekil odur.

## Yapı

```
src/lib/          types · filter · format · products     ← React yok, saf mantık
src/components/
  site/           Header · SearchBar
  filters/        FilterBar · FilterTabs · CategoryDropdown · Stepper
  product/        ProductCard · AlternativeProducts · SpecTable · PriceList
  SearchExperience.tsx                                   ← filtre durumunun tek sahibi
src/app/          layout · page (arama+sonuçlar) · urun/[slug] (detay)
```

**Filtre kuralları `src/lib/filter.ts` içinde ve içinde React yok.** Bileşenin
içine yazılmış bir filtre, kimsenin test edemediği ve bulamadığı bir kuraldır;
bu modül saf olduğu için gerçek uygulamaya olduğu gibi taşınabilecek tek parça.

## Alternatif ürün kuralı

Alternatif = **farklı** bir ürün, en düşük fiyatı çapanın fiyatına belli bir
yüzde bandı içinde olan, yakınlığa göre sıralı. Band sabit lira değil yüzde,
çünkü ±2.000 TL 8.000'de başka 80.000'de başka bir öneridir.

Dar bantta (±%15) yeterli sonuç yoksa **band genişler (±%35), liste doldurulmaz.**
Bandın dışından ürün eklemek, insanlara bu bölümü görmezden gelmeyi öğretir.

**Bir kusur ölçülerek bulundu ve düzeltildi.** İlk sürüm, genişleme hiç yeni
sonuç bulmasa bile ekranda "aralık genişletildi" diyordu: gerçek veride 42.990 ₺
çapasının dar bantta iki komşusu var, asgariyi tutturamıyor, ±%35'e genişliyor
ve **aynı ikisini** buluyordu. Artık genişleme ancak gerçekten sonuç eklediyse
raporlanıyor.

## Fiyat listesi

**Kargo dâhil sıralanır.** 149 ₺ teslimat ücreti listenin başını yeterince sık
değiştiriyor ki etiket fiyatına göre sıralamak siteyi sessizce yanlış yapar — ve
bir fiyat karşılaştırmasının sattığı tek şey sıralamanın doğruluğudur.

**Stokta olmayan, ne kadar ucuz olursa olsun sona düşer.** Her satırda fiyatın
en son ne zaman okunduğu yazar: zaman damgasız fiyat, sitenin tutamayacağı bir
iddiadır.

## Doğrulama

`npx tsc --noEmit` temiz (`strict` + `noUncheckedIndexedAccess`), `next build`
geçiyor, 10 ürün sayfası statik üretiliyor, İlk yükleme JS'i 113 kB.

Saf mantık ölçülerek doğrulandı — hepsi geçti:

| | |
|---|---|
| Alternatifler bandın içinde, çapa listede yok, yakınlığa göre sıralı | ✓ |
| Boşuna genişleme raporlanmıyor (±%15'te kaldı) | ✓ |
| Gerekince band genişliyor — sentetik veri: 10.000 ₺ çapa, dar bantta 1 → ±%35'te 4 | ✓ |
| Bütçe filtresi kesiyor — 10.000 ₺ üstü 6 ürün elendi | ✓ |
| Türkçe büyük harf araması — `KULAKLIK` → 2 sonuç | ✓ |
| Fiyat listesi kargo dâhil artan, stoksuz sonda | ✓ |

## Yapılmayanlar

- **Otomatik test yok.** `src/lib/filter.ts` saf ve test edilebilir; kontroller
  bir kereye mahsus çalıştırıldı, depoya girmedi.
- **Ürün sayfası taksit süresini sonuçlardan taşımıyor** — 12 ayda sabit. URL'de
  taşınmalı, yoksa kişi bütçesini kurup detaya girince ayarı kaybediyor.
- **Görseller yer tutucu.** Gerçek görsel yok; gradyan kutular kasıtlı olarak
  fotoğraf değil, çünkü stok fotoğraf tasarımı olduğundan iyi gösterir.
- **Fiyatlar uydurma**, 2026 Türkiye pazarı için makul ama teklif değil.
- **Giriş/kayıt sayfaları yok** — başlıktaki bağlantılar var olmayan rotalara
  gidiyor.
- **Gerçek cihazda denenmedi.** Yapışkan başlık + yapışkan filtre çubuğu iOS
  Safari'de masaüstünden farklı davranır ve hiçbir telefon bunu açmadı.
- **İki yapışkan katman üst üste**, telefonda ekranın yaklaşık üçte birini
  kaplıyor. Küçük ekranda filtre çubuğunun daralması gerekir; ölçülmedi.
