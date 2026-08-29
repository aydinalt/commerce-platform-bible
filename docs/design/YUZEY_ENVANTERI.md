<!--
Owner:        Architecture Owner
Status:       Draft — var olanın tarifi, bir şartname değil
Maintenance Mode: Living
Version:      1.0
Last Updated: 2026-08-28
-->

# Yüzey envanteri — her ekran, bölüm, alan, eylem ve durum

**`8aa85ef` commit'indeki koddan çıkarıldı, burada tasarlanmadı.** Aşağıdaki her
Türkçe dize `apps/web/src` içindeki birebir bir literaldir; her alan adı
`generated/openapi.json`'dan; her eylem bir sözleşme enum'undan gelir. Bu
belgede dilek yoktur.

> `SURFACE_INVENTORY.md` bunun İngilizce eşidir. İkisi aynı ölçümü taşır.

## Nasıl okunur

- **Tırnak içindeki Türkçe** — bugün ekranda olan tam kelimeler. Değiştirmek
  gerekirse `copy.ts` dosyalarında değişir, tasarım dosyasında değil.
- **`kod`** — API'nin döndürdüğü bir alan ya da uygulamanın sunduğu bir rota.
- **[durum]** — kodda var olan ve tasarlanması gereken bir ekran durumu.
- **⚠︎** — bir tasarımcının arayacağı ama **bulamayacağı** şey, çünkü yapılmadı.
  Varmış gibi tasarlamayın.

**22 rota** var: 9 kamusal, 6 kimlik, 5 İşletme, 7 Yönetici (hesap sayfası
kimlik altında bir kez sayılır). Hepsini tek bir kabuk sarar.

---

# 0 — Her rotada olan kabuk

## 0.1 Site başlığı (`site-header`), 3.25rem yüksekliğinde

| Öğe | İçerik |
|---|---|
| Atlama bağlantısı | "İçeriğe geç" — klavye odağına gelene kadar görünmez, **ilk** olmalı |
| Marka | "İlanlar" — her sayfadan `/` adresine gider |
| Gezinme, çıkış yapmış | "Giriş yap" · "Kayıt ol" |
| Gezinme, giriş yapmış | "Hesabım" |

**UX-0008 §5'ten katı bir kural:** başlık, Yönetici veya İşletme bağlamını
**asla** adlandıramaz. Birinin ayrıcalıklı bir bağlamda olup olmadığı burada
bilerek görünmez — "Yönetici" yazan bir başlık, bir yetkinin var olup
olmadığını sınamanın yolu olurdu. Bunu bir test zorluyor.

## 0.2 Alt bilgi (`site-footer`)

"İlanlar — bir ilan ve karar platformu"

## 0.3 Her rotanın gösterebileceği üç durum

| Durum | Başlık | Gövde |
|---|---|---|
| Bulunamadı | "Bu sayfa bulunamadı" | + "Ana sayfaya dön" |
| Yakalanmamış hata | "Bir şeyler ters gitti" | "Beklenmedik bir sorun oldu ve bu sayfa çizilemedi." · "Kaydettikleriniz bundan etkilenmedi." · "Destek için not edin" *(Next.js digest)* · "Tekrar dene" · "Ana sayfaya dön" |
| Yükleniyor | "Yükleniyor" | "İstediğiniz sayfa hazırlanıyor." — **yalnızca `/compare` ve `/decision`** |
| Bağımlılık erişilemez | "Bu sayfa şu anda yüklenemedi" | + aynı adrese dönen bir "tekrar dene" |

⚠︎ Uygulamanın hiçbir yerinde toast, snackbar, modal, çekmece veya ipucu
balonu yok. Her mesaj satır içinde, `role="alert"` ya da `role="status"` ile.

---

# 1 — Kamusal yüzeyler (hesap gerekmez)

## 1.1 `/` — Ana sayfa

| Bölüm | İçerik |
|---|---|
| Soru | "Bugün ne yapmak istiyorsunuz?" |
| Arama girişi | tek metin alanı + "Ara" düğmesi |
| Ayraç | "Ya da bir kategoriden başlayın" |
| Kategori listesi | kök Kategoriler, Alan'a göre gruplu |
| [boş] | "Şu anda açık bir kategori yok." |
| [erişilemez] | "Kategoriler şu anda getirilemedi. Arama kullanılabilir durumda." |

**Boş ile erişilemez farklı şeyler söyler ve farklı görünmelidir.** İlki katalog
hakkında bir olgu, ikincisi bu istek hakkında.

## 1.2 `/discovery` — Sonuçlar (Gözatma ve Arama aynı ekranı paylaşır)

| Bölüm | İçerik |
|---|---|
| Başlık | "Sonuçlar" |
| Ölçüt satırı | sorgu, Kategori yolu, uygulanan Filtreler — **her zaman görünür** |
| Kategori gezinmesi | "Üst kategoriler" / "Alt kategoriler" |
| Filtreler | filtrelenebilir her Nitelik için bir kontrol; evet/hayır olanlar "Farketmez" / "Var" gösterir |
| Sonuçlar | İlan Kartı ızgarası |
| [sıfır sonuç] | "«{sorgu}» için uygun bir ilan bulunamadı." — **ölçütler ekranda kalır** |
| [kurtarma] | yalnızca sınırlı bir eylem kümesi — serbest öneri yok |

### İlan Kartı — `ListingCard`

`primaryVisualUrl` (kapak görseli, olmayabilir) · `title` · `businessName` ·
`categoryName` · `publishedAt` · `/offerings/{slug}` adresine gider

⚠︎ **Fiyat yok, konum yok, puan yok, favori yok, "yeni" rozeti yok, sıralama
kontrolü yok.** Hiçbiri veri modelinde geçmiyor. Fiyat gösteren bir kart
tasarımının dolduracak bir şeyi olmaz.

## 1.3 `/offerings/{slug}` — İlan Sunumu

`OfferingPresentation`: `title` · `description` · `visuals` (sıralı liste;
ilki kapak) · `categoryPath` · `business` · `attributes` · `publishedAt`

| Bölüm | İçerik |
|---|---|
| Nitelikler | etiket/değer çiftleri. Artık sunulmayan bir değer "Artık sunulmayan bir değer", belirtilmemiş olan "Belirtilmemiş" okur |
| İşletme | yalnızca **herkese açık kimlik** — ad, kısa açıklama, logo |
| Karar girişleri | sunulur, **yürütülmez**: iki yol |
| [yok] | `404` — kaldırıldığını mı yoksa modere edildiğini mi söylemez |
| [erişilemez] | bağımlılık-erişilemez paneli |

⚠︎ Yorum yok, satıcı puanı yok, "benzer ilanlar" yok, paylaş düğmesi yok,
şikâyet düğmesi yok. Tek şikâyet yolu platformun kendi moderasyonu ve onu bir
ziyaretçi açamaz.

## 1.4 `/compare` — Karşılaştırma

| Durum | İçerik |
|---|---|
| [küme yok] | "Henüz karşılaştırmaya bir ilan eklemediniz. Bir ilanı açıp karşılaştırmaya ekleyebilirsiniz." |
| [ikiden az] | "Karşılaştırma için en az iki ilan gerekiyor." + o âna kadarki üyeler |
| [açılabilir] | tablo: ilk sütun "Özellik", her İlan için bir sütun |
| [bitti] | "Karşılaştırma oturumunuz sona erdi. Yeniden başlayabilirsiniz." |
| [erişilemez] | bağımlılık-erişilemez paneli |

Bir küme **yalnızca tek bir yaprak Kategoriden** İlan tutar. Telefonda tablo yan
kaymak yerine İlan başına bloklara yığılır.

## 1.5 `/decision` — Karar akışı

Üründeki en yoğun ekran. Bölümler, sırayla:

| Bölüm | İçerik |
|---|---|
| [geçersiz bağlam] | "Devam edilemiyor" + "Bu ilan artık yayında değil." ya da "Karşılaştırma artık geçerli değil." + sınırlı onarımlar: "Başka bir ilan seçin" · "Karşılaştırmayı düzeltin" · "Karardan çıkın" |
| Üyeler | "Karar verdiğiniz ilan" *(tek)* ya da "Karşılaştırdığınız ilanlar" *(birkaç)* |
| Üye başına | başlık, işletme, ve "Bu ilanı seçin" ya da "Seçildi" + "Seçimi kaldırın" |
| Seçim istemi | "Devam etmeden önce bir ilan seçin." |
| [seçim düştü] | "Seçtiğiniz ilan artık uygun değil, bu yüzden seçim kaldırıldı. Hiçbir işlem tamamlanmadı." |
| Sohbet | giriş alanı "Sizin için önemli olan", altında iki değişmez cümle |
| Sohbetin sınırı | "Sohbet ilandaki bilgileri açıklar ve karşılaştırmanıza yardım eder. Sizin yerinize seçim yapmaz, iletişimi başlatmaz ve ilanda yazmayan bir bilgiyi söylemez." |
| Sohbetin hafızası | "Bu sohbet yalnızca şu anki karar akışına aittir. Kaydedilmez." |
| Devir | "Nasıl devam etmek istersiniz?" → "İşletmenin sitesine gidin" · "İşletmeyle doğrudan iletişime geçin" |
| [adres yok] | "Bu ilan için site üzerinden devam etme yolu şu anda kullanılabilir değil." |
| [kanal yok] | "Bu işletme doğrudan iletişim bilgisi paylaşmamış. Platformda mesaj gönderilebilecek bir yer yok." |
| [hesap gerekiyor] | "Doğrudan iletişim bilgisini görmek için giriş yapmanız gerekiyor. Giriş yaptıktan sonra tam olarak buraya dönersiniz." |
| [kaldığı yerden] | "Kaldığınız yerden devam edebilirsiniz: seçtiğiniz iletişim yolu aşağıda hazır." |
| [tamamlandı — adres] | "Bu ilan için işletmenin sitesine yönlendirildiniz. Orada ne olduğunu platform bilmez." |
| [tamamlandı — iletişim] | "Bu ilan için iletişim bilgisi size gösterildi. İletişime geçip geçmediğinizi platform bilmez." |
| İkisinden sonra | "Karar yolculuğunuz burada bitiyor." |
| [süresi doldu] | "Bu karar akışının süresi doldu." |

Kanallar: "E-posta" · "Telefon" · "İnternet sitesi".

**Sohbetin retleri içeriktir, hata değil** — cevap gibi tasarlanmalı:
"Bu soru ilanda yazanlardan yanıtlanamadı. İlanda olmayan bir bilgiyi uydurmak
yerine söylememeyi seçiyoruz."

⚠︎ Sohbette geçmiş yok, konuşma listesi yok, dosya eki yok, yazıyor göstergesi
yok. Akış başına bir soru, bir cevap.

---

# 2 — Kimlik (`auth` kapsamı — dar tek sütun, tek kart)

Hepsi tek ve kısa bir form. Ortak alan etiketleri: "E-posta adresi" · "Parola".

| Rota | Başlık | Eylem | Bağlantılar | Durumlar |
|---|---|---|---|---|
| `/login` | "Giriş yapın" | "Giriş yap" | "Parolanızı mı unuttunuz? Sıfırlayın" · "İlk defa mı geliyorsunuz? Hesap oluşturun" | ret, hız sınırı |
| `/register` | "Hesap oluşturun" | "Hesap oluştur" | "Zaten hesabınız var mı? Giriş yapın" | gönderildi, ret, hız sınırı |
| `/register/confirm` | "Hesabınızı tamamlayın" | — | "yeniden kayıt olabilirsiniz" | "Bu onay bağlantısı artık kullanılamıyor." |
| `/recover` | "Parolanızı sıfırlayın" | "Bağlantı gönder" | "Hatırladınız mı? Giriş yapın" | gönderildi, hız sınırı |
| `/recover/reset` | "Yeni parola belirleyin" | "Yeni parolayı kaydet" | "yeni bir bağlantı isteyin" | "Bu bağlantı artık kullanılamıyor." |

**Kayıttan sonra:** "E-postanızı kontrol edin. Gönderdiğimiz bağlantıyı açmadan
kayıt tamamlanmaz."
**Kurtarmadan sonra:** "Bu adrese ait bir hesap varsa, yeni parola belirleme
bağlantısı yola çıktı."

**Tasarımın bozmaması gereken iki güvenlik özelliği.** Giriş reddi ne adresi ne
parolayı adlandırır. Kurtarma, hesap olsa da olmasa da *"bu adrese ait bir hesap
varsa"* der. İkisi de yük taşır — "e-posta bulunamadı" durumu kimin hesabı
olduğunu sızdırır.

## 2.6 `/account` — "Hesabınız" (`workspace` kapsamı)

Bağlam sunan tek ekran.

| Bölüm | İçerik |
|---|---|
| [reddedildi] | "Bu bağlama girilemedi. Hiçbir şey değişmedi." |
| Taban | "Gezinmeye devam edin" — "Giriş yaptınız. Başka bir bağlama girmeden **herkese açık siteyi kullanmaya devam edebilirsiniz**." |
| İşletmeler | sahip olunan her İşletme için açık bir düğme |
| Yönetici | "Platform yönetimi" — yalnızca yetki varsa görünür |
| Çıkış | "Çıkış yap" |

**Bir bağlama girmek bir eylemdir, asla otomatik değildir.** Tek İşletmesi ve
Yönetici yetkisi olan biri bile bir şeye basana kadar hiçbirine girmez.

---

# 3 — İşletme sahibi yüzeyleri (`workspace` kapsamı)

## 3.1 `/businesses/{id}` — Pano

`BusinessDashboard`: `business` + `inventory`.

| Bölüm | İçerik |
|---|---|
| Başlık | İşletme adı, kısıtlıysa moderasyon durumu |
| Düzeltme bildirimleri | açık bildirimler, her biri sınırlı düzenlemesine bağlanır |
| Oluştur | "İlan oluştur" — "Başlık", "Adres", düğme "Oluştur" |
| Envanter | yaşam döngüsüne göre gruplu, şu sırayla: **"Taslak" · "Yayında" · "Gizli" · "Arşivlenmiş"** |
| İlan başına | başlık, adres, uygunluk, ve **yalnızca şu anda izin verilen eylemler** |
| [boş grup] | "Burada bir şey yok." |
| [kısıtlı] | oluşturma sunulmaz; yalnızca Taslaklar düzenlenebilir |

**Yayın geribildirimi eksikleri adlandırır ama asgariyi yeniden tanımlamaz** —
neyin eksik olduğunu platform söyler, ekran aktarır.

## 3.2 `/businesses/{id}/information` — İşletme Bilgileri

İki grup, ve ayrım asıl meseledir:

| Grup | Alanlar |
|---|---|
| "Herkese açık kimlik" | `name` · `shortDescription` · `logoUrl` |
| "Doğrudan iletişim" | `contactEmail` · `contactTelephone` · `contactUrl` |

Gönderim "Kaydet". İletişim grubu **hiçbir zaman herkese açık değildir** —
yalnızca bir Doğrudan İletişim tamamlanmasıyla, giriş yapmış bir kişiye, bir kez
gösterilir.

## 3.3 `/businesses/{id}/offerings/{id}` — İlan içeriği

`EditableOfferingContent`: `title` · `summary` · `attributes` ·
`applicableAttributes` · `visuals` · `status` · `version`

| Bölüm | İçerik |
|---|---|
| Başlık | "İlan içeriği" |
| Görseller | "Görsel adresleri" — "Her satıra bir adres. İlk satır, ilanın kapak görselidir." |
| Nitelikler | "Nitelikler" — uygulanabilir her Nitelik için, değer türüne göre bir kontrol |
| [özet yok] | "Özet yok." |
| Kaydedildi | "Kaydedildi." |
| Retler | "Bu değişiklik kaydedilmedi: ilanı yayında kalmak için gerekenlerin altında bırakırdı." · "Bu ilan arşivlendi ve artık düzenlenemiyor." |

⚠︎ Görseller **bir metin alanına yazılan adreslerdir**. Yükleme yok,
sürükle-bırak yok, görsel seçici yok, kırpma yok. Bir yükleyici tasarlamak, var
olmayan bir yeteneği tasarlamak olur.

## 3.4 `/businesses/{id}/offerings/{id}/destination` — Yönlendirme adresi

`AffiliateDestination`: `reference` · `status` · `validationResult` ·
`validationReason` · `handoffEligibility` · `version`

| Alan | Etiket |
|---|---|
| Adres | "Adres" |
| Durum | "Durum" |
| Denetim | "Kontrol" — "Bu adresi henüz kimse denetlemedi." / "Denetlendi ve geçerli. Açılabilir." |
| Devir | "Yönlendirme" — "Denetim bekliyor" / "Açılmaya hazır" |

Kaydedildi: "Kaydedildi. Karar yeniden platformundur." Arşivlenmiş bir İlanın
adresi **yalnızca görüntülenir** — bir kayıt, bir kontrol değil.

## 3.5 `/businesses/{id}/corrections/{id}` — bir düzeltmeyi yanıtlamak

| İçerik |
|---|
| "Bu bildirim ilanın tek bir bölümünü soruyor ve burada yalnızca o bölüm değiştirilebilir." |
| Düzenlenebilir tek alan, başka hiçbir şey |
| Kaydedildi: "Kaydedildi. Vaka açık kalır ve platform yeniden inceler." |
| "Bu değişikliği yapmak vakayı kapatmaz. Platform yeniden inceler." |
| [yok] "Düzeltme bildiriminiz yok." |
| [eskimiş] "Bu düzeltme artık buradan yanıtlanamıyor. Geri dönüp bildirimi yeniden açın." |

---

# 4 — Yönetici yüzeyleri (`workspace` kapsamı)

Yalnızca `/account` → "Platform yönetimi" üzerinden ve **açıkça girilmiş** bir
Yönetici bağlamıyla erişilir. Bağlam girilmemişse API `403` döner.

## 4.1 `/admin` — Panel

| Bölüm | İçerik |
|---|---|
| Başlık | "Platform yönetimi" |
| İşlevler | "Burada yapabilecekleriniz" — yalnızca kişinin gerçekten sahip oldukları |
| Analitik | "İnsanlar ne yaptı" |
| Dönem | "Analitik dönemi": "Bugün" · "Son 7 gün" · "Son 30 gün" · "Tüm zamanlar" |
| Çıkış | "Oturumu kapat" |

**İşlevler**: "İlan moderasyonu" · "İşletme moderasyonu" · "Hesap erişimi" ·
"Düzeltme iste" · "Moderasyon vakaları" · "Yönlendirme adresleri" ·
"Kategoriler" · "Nitelik tanımları" · "İlan geçmişi"

**Altı çekirdek akış göstergesi**, her biri Alan'a göre kırılımlı (Emlak ·
Ulaşım · Teknoloji) ve bir "Genel" toplamla:

| Gösterge |
|---|
| "Keşif başlatıldı" |
| "İlan açıldı" |
| "Karşılaştırma başlatıldı" |
| "Karar Sohbeti başlatıldı" |
| "Adrese yapılan devir" |
| "İletişim bilgisi gösterildi" |

Ayrıca "Açık vakalar, hedefe göre". Boş: "Kayda geçen bir şey yok."
Erişilemez: analitiğin düşmesi **panelin tamamını düşürmemeli**.

⚠︎ Grafik yok. Analitik bir tabloda sayılardan ibaret, bilerek — veri modeli
zaman serisi tutmuyor.

## 4.2 `/admin/moderation-cases` — Kuyruk

| Öğe | İçerik |
|---|---|
| Başlık | "Moderasyon vakaları" |
| Filtre | "Vaka durumu": "Açık" / "Kapalı" |
| Gruplama | "Şu anda eylem bekleyenler" ve bilgilendirici bir grup |
| Vaka başına | hedef türü, "açılış" tarihi, durum |
| [boş] | "Bu filtreye uyan vaka yok." |
| [erişilemez] | "Vakalar yüklenemedi." |

Hedefler: "İlan" · "İşletme" · "Kullanıcı hesabı".

## 4.3 `/admin/moderation-cases/{id}` — Tek vaka

**Yedi eylem, ve yalnızca bu yedisi** (`MODERATION_ACTION_VALUES`):

| Eylem | Etiket | Ne yapar |
|---|---|---|
| `REQUEST_CORRECTION` | "Düzeltme iste" | "Hiçbir durum değişmez. İşletmeden bir şeyi düzeltmesi istenir ve vaka açık kalır." |
| `HIDE_OFFERING` | "Bu İlanı gizle" | "Yayında durumu Gizli olur." |
| `RESTORE_OFFERING` | "Bu İlanı yeniden yayına al" | "Gizli durumu Yayında olur." |
| `RESTRICT_BUSINESS` | "Bu İşletmeyi kısıtla" | "«Kısıtlama yok» durumu Kısıtlı olur." |
| `RESTORE_BUSINESS` | "Bu İşletmenin kısıtlamasını kaldır" | "Kısıtlı durumu «Kısıtlama yok» olur." |
| `SUSPEND_USER` | "Bu hesabı askıya al" | "Etkin hesap askıya alınır." |
| `REINSTATE_USER` | "Bu hesabı geri getir" | "Askıya alınmış hesap yeniden etkinleşir." |

Yalnızca **bu hedefe şu anda uygulanabilir** olanlar sunulur. Hiçbiri
uygulanamıyorsa: "Bu hedefe şu anda uygulanabilecek bir Genel Moderasyon eylemi
yok."

| Bölüm | İçerik |
|---|---|
| Eylemler | "Yapabilecekleriniz" |
| Kayıt | "Kaydedilenler" — uygulananlar, sırayla |
| Düzeltme formu | "Ne düzeltilmeli" · "Onlara ne söylenecek" · "Belirli bir bölüm değil" |
| Düzeltme hedefleri | "İlan içeriği" · "İşletme bilgileri" · "Doğrudan iletişim bilgileri" · "Yönlendirme adresi ayarları" |
| İçerik alanları | "Başlık" · "Özet" · "Nitelikler" |
| İşlem yok | "Yapılacak bir şey olmadığına karar ver" + "Neden" |
| Yeniden inceleme | "Yeniden inceleme kaydet" |
| Kapat | "Bu vakayı kapat" |
| [kapatma reddi] | "Bu vakada uygulanmış bir eylem ve kayda geçmiş bir işlem-yapılmadı kararı yok, bu yüzden açık kalıyor." |
| [boş] | "Henüz bir şey kaydedilmedi." |

## 4.4 `/admin/destinations` — Yönlendirme adresi yönetimi

**Beş eylem:**

| Etiket | Ne yapar |
|---|---|
| "İnceleme kaydet" | "Hiçbir şeyi değiştirmez. Birinin baktığını kaydeder." |
| "Geçerli işaretle" | "Geçerli sonucunu kaydeder. Durum olduğu yerde kalır." |
| "Geçersiz işaretle" | "Geçersiz sonucunu kaydeder. Durum olduğu yerde kalır." |
| "Aç" | "Açık duruma geçer ve devir alabilir. Geçerli bir sonuç gerektirir." |
| "Kapat" | "Kapalı duruma geçer ve devir alamaz. Denetim sonucu olduğu gibi kalır." |

Alanlar: "Adreste ne yanlış" · "Not (isteğe bağlı)". Erişilemez: "İş yükü
yüklenemedi."

## 4.5 `/admin/categories` — Kategori ve Alan yönetimi

| Eylem | Alanlar |
|---|---|
| "Kategori oluştur" | "Ad" · "Adres" · "Kalıcı anahtar" · "Şunun altında" (ya da "Hiçbiri — bu bir kök") · "Alan (yalnızca kökler)" |
| "Yeniden adlandır" | "Yeni ad" |
| "Taşı" | "Yeni üst kayıt" (ya da "Hiçbiri — kök yap") |
| "Kaldır" | — |

Retler: "O üst kayıt kaldırıldı, altına yeni bir şey yerleştirilemez. Hiyerarşi
değişmedi." Erişilemez: "Katalog yüklenemedi."

## 4.6 `/admin/attributes` — Nitelik tanımları

| Alan | Etiket |
|---|---|
| Ad | "Ad" |
| Etiket | "Etiket" |
| Kalıcı anahtar | "Kalıcı anahtar" |
| Değer türü | "Değerin türü": "Serbest metin" · "Sayı" · "Evet ya da hayır" · "Listeden biri" · "Listeden birkaçı" |
| Birim | "Birim (yalnızca sayı)" |
| İzinli değerler | "İzinli değerler (yalnızca listeden seçmeli türler)" + "İzinli değer ekle" |
| Uygulanır | "Şunlara uygulanır" |
| Özellikler | "Özellikler": "Yayın için zorunlu" · "Üzerinden filtrelenebilir" · "Karşılaştırmada görünür" |

Retler: "Bu, bu alanın kabul ettiği bir değer değil. Hiçbir şey değişmedi." ·
"Bu değişiklik yapılamadı. Son onaylanmış tanım olduğu gibi duruyor."

## 4.7 İlan geçmişi

Kendi rotası değil, bir vakadan erişilir: bir Yöneticinin bir İlanın geçmişine
bakışı — Arşivlenmiş olanlar dâhil.

---

# 5 — Rozet, etiket ve sözlük

| Küme | Değerler |
|---|---|
| Varlıklar | "Yönetici" · "Yönlendirme adresi" · "Nitelik" · "İşletme" · "Kategori" · "Düzeltme bildirimi" · "Alan" · "Moderasyon vakası" · "İlan" · "Kullanıcı" |
| Alanlar | "Emlak" · "Ulaşım" · "Teknoloji" |
| İlan yaşam döngüsü | "Taslak" · "Yayında" · "Gizli" · "Arşivlenmiş" |
| Moderasyon | "Kısıtlı" · "Kısıtlama yok" |
| Vaka durumu | "Açık" · "Kapalı" |
| Uygunluk | "Uygun" · "Uygun değil" |
| Adres durumu | "Etkin" · "Kapalı durumda" |
| Denetim | "Geçerli" · "Geçersiz" · "Denetlenmedi" |
| Hesap | "Askıda" · "Henüz belirlenmedi" · "Görünümden çıkarıldı" |
| Bağlamlar | "Yönetici bağlamı" · "İşletme bağlamı" |

**Üç durum, daha fazlası yok.** Palet bir vurgu ve tam iki durum rengi taşır —
dikkat (`--notice`) ve ret (`--critical`). **Başarı yeşili yoktur.** Bir tasarım
dördüncüyü eklerse, ürünün söylemediği bir şeyi eklemiş olur.

Gönderim düğmelerinin daima bir "çalışıyor" etiketi vardır:
"Ekle/Ekleniyor…" · "Oluştur/Oluşturuluyor…" · "Kaydet/Kaydediliyor…" ·
"Taşı/Taşınıyor…" · "Tanımla/Tanımlanıyor…" · "Yeniden adlandır/Kaydediliyor…" ·
"Gönder/Gönderiliyor…"

---

# 6 — Tasarımın bozamayacağı kısıtlar

Bunlar testlerle zorlanır; birini ihlal eden bir tasarım, süiti düşürmeden
kurulamaz.

- **Kontrast**: her metin eşleşmesi için AA; bir kontrolü sınırlayan kenarlık
  için **3:1**.
- **Kontroller**: düğme, girdi, seçim ve metin alanında `min-height: 2.75rem`.
  Yoğunluk boşluktan ve ızgaradan gelir, dokunma hedefinden asla.
- **Odak**: görünür bir halka, asla kaldırılmaz.
- **Çizgi, gölge değil.** Odak halkası dışında hiçbir yerde `box-shadow` yok.
- **Animasyon yok.** Geçiş yok, keyframe yok.
- **Yalnızca üç kırılım noktası**: 768px ve 1120px, artı ilkinin telefon tarafı
  olarak 767px.
- **Gövde metni 1rem** — telefonun odaklanmış bir girdiyi yakınlaştırmadığı sınır.
- **Telefonda tablolar yığılır**, yan kaymaz.
- **Sayfa başına tek `main`**, ve atlama bağlantısı ilk.
- **Her sayfa Türkçe**, `<html lang="tr">`, istisnasız.

---

# 7 — Var olmayanlar, kimse tasarlamasın diye

⚠︎ Ölçülmüş yokluklar, görüş değil:

- Ziyaretçi ile İşletme arasında **mesajlaşma yok**. Doğrudan İletişim bir kanal
  gösterir ve platform aradan çekilir.
- **Favori yok**, kayıtlı arama yok, gezinme geçmişi yok, bildirim yok.
- Veri modelinde hiçbir yerde **fiyat**, **konum**, **puan** veya **yorum** yok.
- **Görsel yükleme yok** — görseller bir metin alanına yazılan adreslerdir.
- **Ödeme**, **sipariş**, **sepet**, **teslimat** yok. Hiçbir şey el değiştirmez.
- Analitikte **grafik yok**; yalnızca sayılar.
- **Kullanıcı yönetimi ekranı yok** — Yönetici yetkisi vermek ve almak
  uygulamanın tamamen dışındadır.
- Hiçbir şey için **ayarlar sayfası yok**, bilerek: yönetilen her şeyin onu
  sahiplenen bir Story'si var, ve ayarlar sayfası yönetilmeyen anahtarların
  biriktiği yerdir.
- **Hukuki sayfa yok** — gizlilik, koşullar ve çerez rota olarak mevcut değil ve
  bu bir karar değil, **açık bir boşluk**.
- **Karanlık mod yok**, tema anahtarı yok, dil anahtarı yok.

---

# 8 — Bu belgenin dürüst sınırları

- **Yapılmış olanı tarif eder, olması gerekeni değil.** Yukarıdaki yokluklardan
  birkaçı karar değil, boşluktur; hangisi olduğunu release kriterleri söyler.
- **Kelimeler `8aa85ef` itibarıyla günceldir.** `copy.ts` dosyalarında yaşarlar
  ve bir test sitenin tek dil konuştuğunu iddia eder; bu metinleri sabitleyen bir
  tasarım zamanla ayrışır.
- **Bu ekranları çizilmiş hâliyle kimse görmedi.** Görsel katman testlerle
  iddia edilmiştir, gözle incelenmemiştir.
- **Kamusal yüzeyler bileşen sınıflarını taşır; on yedi yönetim yüzeyi görsel
  sistemini yalnızca I48'de aldı** — bir artım önce.
