# I60 — Kart, prototipin geniş satırı oldu

> **Karar:** Sahibi, 2 Eylül 2026: *"Prototipin geniş satırı."* 24 Ağustos'ta
> istediği beş sütunluk yoğunluğun yerini alıyor.

## Neden yoğunluk kararı değişti

Ağustos'taki karar yanlış değildi; kartın taşıdığı şey değişti. O gün bir kart
başlık, kategori ve işletme taşıyordu — beş tanesini yan yana koymak bir
kataloğu taramanın iyi yoluydu. Bugün kart ayrıca **fiyat** (I56), **kaç
partnerin sattığı** (I58) ve **partnere çıkan bir denetim** (I59) taşıyor. 15rem
genişliğinde bir sütun bunların hiçbirini satır kırmadan gösteremiyor.

Karşılaştırma bir sütun boyunca aşağı okunur. Ekranda daha az ürün, ürün başına
daha çok şey — karşılaştırma sitesinin varlık sebebi olan takas bu.

## Düzen

Üç şerit, okuma sırasında: **görsel → ne olduğu → çıkış yolu.** Sıra bir
argüman: insan önce ürünü tanır, sonra ne kadar olduğunu okur, en sonda
platformdan çıkaran denetimle karşılaşır. Düğmeyi başa koyan bir düzen, ne
sattığını söylemeden satmaya başlardı.

- `.listing-cards` → tek sütun (`grid-template-columns: 1fr`), medya sorgusu yok.
- `.listing-card` → 768px'ten itibaren satır. 768 mevcut ölçekte; dördüncü bir
  kırılma noktası eklenmedi (`i26` bunu zaten reddederdi).
- `.listing-card-visual` → telefonda 4:3 bant, geniş ekranda 7rem kare küçük
  görsel. Satırda 4:3 bir bant, başlığın kelimeyle söylediğini söylemek için
  genişliğin üçte birini alırdı.
- `.listing-card-main` → `min-width: 0`; bu olmadan uzun bir başlık esnek kutuyu
  gerer ve eylem sütununu karttan dışarı iter.
- `.listing-card-actions` → 12rem sabit sütun, böylece her kartın düğmesi bir
  öncekiyle aynı hizada. Her satırda farklı yükseklikte duran bir düğme, her
  satırda aranması gereken bir düğmedir.
- `.listing-card-open` → "Detayları incele". Başlığın kendi bağlantısıyla aynı
  yere gider; kartın sağ sütununu önce okuyan biri için aynı şeyin denetim
  hâli.

## Tasarım kuralları çiğnenmedi

`i26-design-foundation` üç şeyi bekliyor ve üçü de duruyor: gölge yok (prototipin
yumuşak gölgesi alınmadı, sınırla çizildi), animasyon yok, kırılma noktaları
767/768/1120.

**Alınmayan tek şey renk.** Prototipin turuncu düğmesi sitenin mavi vurgu rengiyle
çakışıyor; vurgu rengini değiştirmek her ekranı etkiler ve tasarım temeli ayrı
bir yönetilen belge. Bu artım yalnız düzeni taşıdı — palet ayrı bir karar.

## Değişen dosyalar

- `apps/web/src/app/globals.css` — yukarıdaki kurallar; eski ızgara yorumu
  kararın kendisiyle değiştirildi.
- `apps/web/src/app/discovery/listing-card.tsx` — iki sarmalayıcı (`main`,
  `actions`) ve ikinci açma bağlantısı.
- `tests/i33-site-shell.test.ts` — "ızgara boşluğu takip etsin" iddiası
  tersine çevrildi; neden çevrildiği testin içinde yazılı.
- `tests/i49-public-surfaces.test.ts` — üç yeni sınıf adı.

## Doğrulama

1.154 test yeşil (125 dosya), `tsc -b` ve `eslint .` temiz. Bileşen gerçek
veriyle çizilip iki genişlikte bakıldı (1120px ve 420px).
