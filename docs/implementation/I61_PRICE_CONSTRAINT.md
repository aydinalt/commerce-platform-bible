# I61 — Bütçe

> **Durum:** kod ve testler tamam; **dört belge aday hâlde, dondurulmadı.**
> Sahibinin kararı: *"PRD-0002'yi revize edelim."* (2 Eylül 2026)

## Neden bir `where` cümlesinden fazlasıydı

Prototipte bütçe çubuğu en baştan beri var. Platform onu yanıtlayamıyordu ve
sebebi eksik kod değildi:

- **PRD-0002 §5.6** Discovery ölçütlerini üçe kapatıyor: arama sorgusu, aktif
  yaprak kategori, Nitelik filtreleri.
- **PRD-0002 §5.5** her filtreyi *`filterable` özelliği açık bir Nitelik* olmaya
  zorluyor.
- **Fiyat Nitelik değil.** PRD-0001 §5.10 onu Offering'in kendi birinci sınıf
  özelliği yapıyor.

İkisi birlikte bütçe denetimini eksik bırakmıyor, **kurgu gereği dışarıda
bırakıyordu**. Hiçbir ilanın tutarı yokken bu doğruydu. PRD-0001 v4.0 her ilana
bir tutar verdi; I56 onu karta, I58 ürün grubuna, I59 partner düğmesine taşıdı.
Her kartta fiyat gösterip ona göre daraltamayan bir karşılaştırma platformu,
makinenin kusursuz yaptığı işi insana gözüyle yaptırıyor.

## Yazılan belgeler (hepsi aday)

| Belge | Ne yapıyor |
|---|---|
| `PRD-0002-discovery-v2.5-candidate.md` | §5.5A Price Constraint kavramı, §5.6'ya dördüncü ölçüt, §10.6 davranış (sekiz alt başlık), §15 izin satırı, §17'ye 28A–28J, §21.5'e sıralamayı açmadığının notu |
| `DISCOVERY_FEATURE_REGISTRY-v1.1-candidate.md` | `F11 — Price Constraint` tahsisi |
| `UX-0002-discovery-v1.2-candidate.md` | §9A denetimin deneyimi; §3, §6, §16, §17 satırları |
| `US-DSC-F11-001-price-constraint-v0.1-candidate.md` | 14 kabul ölçütü, 8 BDD senaryosu |

**Revize edilmeyenler:** §5.5 (Nitelik filtresi), §12 (sıralama), §12.5 ve §21.5
(kullanıcı sıralaması hâlâ V1 dışı), `US-DSC-F05-001`, `US-DSC-F07-001`.

## İki karar, belgede gerekçesiyle

**1. `F05`'i genişletmek yerine `F11` açıldı.** Ucuz yol `F05`'i "Nitelik
Filtreleme"den "Sonuç Filtreleme"ye çevirmekti; yanlış olurdu, çünkü `F05`'in
adı, davranış sahibi (§10) ve hikâyesi hep *Nitelik* diyor ve Price Constraint
tam olarak Nitelik **olmayan** ölçüt.

**2. PRD-0001 §5.10.5 ile PRD-0002 §12 arasındaki "çelişki" çelişki değilmiş.**
§5.10.5 *fiyata göre sıralayan bir yüzeyin* nasıl davranacağını söylüyor; bu
yüzey, ürün sayfasındaki satıcı listesi — `US-OFR-F05-001`'in sahibi olduğu ve
I59'da yazdığımız yer. Discovery sıralaması değil. §10.6.4 aynı ölçüyü kısıt
için ödünç alıyor, böylece "insanın ödeyeceği tutar" platformda tek bir şey
demek.

## Kod

**API**
- `packages/contracts` — `priceConstraintSchema` (para **string**, en az bir
  sınır zorunlu, `currency` zorunlu ve varsayılansız), arama ve gezinme
  isteklerine `price`.
- `pg-discovery.repository.ts` — `pricePredicate`: `pricing_kind = 'FIXED'`
  (AC-5), `currency = $n` (AC-7), `TOTAL_COST_SQL` sınırlar arasında (AC-3,
  AC-4). Ters sınırlar hiçbir satırı geçirmiyor ve düzeltilmiyor (AC-8).
- `discovery.controller.ts`, `generate-openapi.ts`, `generated/openapi.json`.

**Web**
- `entry.ts` — `price` taşıyıcıda; kategori değişince **düşmüyor** (§10.6.1),
  filtrelerin aksine.
- `actions.ts` — `applyBudget` / `clearBudget`. `offeredFilters`'tan geçmiyor:
  kontrol edilecek bir kategori yok.
- `budget-control.tsx` — denetim. `type="number"` değil `inputMode="decimal"`:
  sayı girdisi ayrıştıramadığını sessizce siler, bu da yüzeyin insanın rakamını
  düzeltmesi olurdu.
- `discovery-view.tsx`, `page.tsx`, `globals.css`.

## Testler

`tests/i61-price-constraint.test.ts` — 11 durum. Beşi, "bir sayı uydurmanın"
beş ayrı yolu:

1. belirtilmemiş kargoyu sıfır saymak (AC-4);
2. teklifli ilanı "belki ucuzdur" diye almak (AC-5);
3. karşılaştırmak için para birimi çevirmek (AC-7);
4. ters sınırları insanın "kastettiği" hâle çevirmek (AC-8);
5. bütçeyi sıralamaya dönüştürmek (AC-10).

## Doğrulama

1.165 test yeşil (126 dosya), `tsc -b` ve `eslint .` temiz.

## Açık kalan

- **Sahibinin dört belgeyi dondurması.** Donana kadar v2.4/v1.0/v1.1 yetkili
  metin; kod onların izin vermediği bir davranışı sunuyor ve bu bilinçli bir
  aday durumu.
- Donarsa: eskiler `-superseded.md` olarak arşivlenir, adaylar taban adı alır,
  `US-DSC-F11-001` v1.0'a çıkar.
