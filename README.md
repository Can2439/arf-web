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

Kavramsal video varlıklarını yeniden üretmek için:

```bash
python3 tools/generate-editorial-media.py
```

Yeni görsel sistem; özgün enerji alanı görselleri ile 10 saniyelik, kesintisiz
soyut hareket döngülerini kullanır. Üretim betiği Pillow ve FFmpeg gerektirir;
yayımlanan sitenin çalışması için bu araçlara ihtiyaç yoktur.

## Yayın

`main` dalına birleştirilen değişiklikler GitHub Pages tarafından yayımlanır.
