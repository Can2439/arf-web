# ARF İleri Teknoloji — Kurumsal Web Sitesi

ARF İleri Teknoloji'nin GitHub Pages üzerinde yayımlanan kurumsal web sitesi.

Canlı adres: [arftech.tr](https://arftech.tr/)

## Konumlandırma

Site, ARF'yi kuruluş hazırlığındaki bir temel teknoloji ve fikrî mülkiyet
yapılanması olarak anlatır.

İlk araştırma odağı iki eksenden oluşur:

1. Enerji Yönetimi ve Korunumu
2. Enerji Üretimi ve Hasadı

Bilgi teknolojileri, enerji alanındaki birikimin ardından ele alınacak gelecek
araştırma ufku olarak konumlandırılır.

## İçerik ilkeleri

- Kuruluş aşaması açıkça belirtilir.
- Kamuya açıklanmamış patent, lisans, müşteri veya iş birliği iddiası kullanılmaz.
- Ürün özellikleri ana kurumsal anlatının merkezine alınmaz.
- Teknik notlar birincil kaynaklara dayanır ve neyi kanıtlamadığını açıklar.
- Kavramsal hareketli görseller gerçek proje görüntüsü gibi sunulmaz.
- Açıklanmamış program veya ekosistem ilişkileri anılmaz.

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

Sinematik görsel sistem, `assets/media/v4/` altında altı özgün enerji evreni ve
10 saniyelik kesintisiz hareket döngüleri kullanır. Kamera sabittir; enerji
lifleri, ışık düğümleri ve parçacıklar sahnenin içinde hareket eder. Tüm bu
varlıklar kavramsal görselleştirme olarak etiketlenir; gerçek ürün, prototip
veya çalışma görüntüsü değildir. Video döngüleri sessizdir ve hareket azaltma
terciğini destekler.

V4 hareket filmlerini yeniden üretmek için:

```bash
python3 tools/generate-v4-motion-films.py
```

Üretim betiği Pillow ve FFmpeg gerektirir; yayımlanan sitenin çalışması için bu
araçlara ihtiyaç yoktur.

## Yayın

`main` dalına birleştirilen değişiklikler GitHub Pages tarafından yayımlanır.
