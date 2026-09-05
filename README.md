# ARF İleri Teknoloji — Kurumsal Web Sitesi

ARF İleri Teknoloji'nin GitHub Pages üzerinde yayımlanan kurumsal web sitesi.

Canlı adres: [arftech.tr](https://arftech.tr/)

## Konumlandırma

Site, ARF'yi güç elektroniği, Edge AI ve savunma standartlarında sistem
mühendisliğini aynı mimaride birleştiren ileri mühendislik şirketi olarak anlatır.

Ana anlatı iki tamamlayıcı mihenk taşı etrafında kurulur:

1. Korunan Enerji Çekirdeği
2. Dengelenen Enerji Omurgası

Teknik kapsam, güç elektroniği ve inverter sağlık izleme ekseninde tutulur;
ürünün entegre olduğu bütün sistemi teşhis ettiği iddia edilmez.

## İçerik ilkeleri

- Kuruluş aşaması açıkça belirtilir.
- Kamuya açıklanmamış patent, lisans, müşteri veya iş birliği iddiası kullanılmaz.
- Ürün özellikleri ana kurumsal anlatının merkezine alınmaz.
- Teknik notlar birincil kaynaklara dayanır ve neyi kanıtlamadığını açıklar.
- Kavramsal hareketli görseller gerçek proje görüntüsü gibi sunulmaz.
- Yalnızca kamuya açıklanmasına izin verilen program ve ekosistem ilişkileri kullanılır.

## Yapı

```text
.
├── index.html
├── kurumsal.html
├── teknoloji-alanlari.html
├── arastirma-ip.html
├── yazilar.html
├── *-analiz.html / *-teknolojisi.html
├── assets
│   ├── brand
│   └── media
├── styles.css
├── script.js
├── robots.txt
├── sitemap.xml
└── CNAME
```

## Geliştirme

Site, statik HTML, CSS ve JavaScript ile hazırlanmıştır. Kullanılan yazı tipleri
proje içinde barındırılır; ziyaretçi tarafında haricî arayüz bağımlılığı yoktur.
Yerel olarak herhangi bir statik dosya sunucusuyla çalıştırılabilir.

Editoryal kavramsal video varlıklarını yeniden üretmek için:

```bash
python3 tools/generate-editorial-media.py
```

Ana sayfadaki sinematik anlatı `assets/media/v6/` altındaki iki kullanıcı
filmini kullanır. V6 videolar kısa anahtar-kare aralığı, `faststart`, sessiz
oynatım ve kontrollü döngü geçişiyle kaydırmaya bağlı kare arama için
hazırlanmıştır.

Ana sayfa herhangi bir animasyon framework'üne bağlı değildir. Doğal tarayıcı
kaydırmasını izleyen `script-v6.js`; açılış, iki mihenk taşı, sistem katmanları
ve final sahnelerini ilerleme değerine göre yönetir. Mobil cihazlarda ağır kare
arama yerine optimize edilmiş oynatım ve crossfade; hareket azaltma tercihinde
ise poster tabanlı durağan anlatım kullanılır.

V4 hareket filmlerini yeniden üretmek için:

```bash
python3 tools/generate-v4-motion-films.py
```

Üretim betiği Pillow ve FFmpeg gerektirir; yayımlanan sitenin çalışması için bu
araçlara ihtiyaç yoktur.

## Yayın

`main` dalına birleştirilen değişiklikler GitHub Pages tarafından yayımlanır.
