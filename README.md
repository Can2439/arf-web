# ARF İleri Teknoloji - Kurumsal Web Arayüzü

Bu depo (repository), **ARF İleri Teknoloji**'nin resmi web sitesi kaynak kodlarını içerir. Site, savunma sanayii ve güç elektroniği odaklı, "Stealth Mode" ve "High-Tech" estetiğine sahip bir yapıda tasarlanmıştır.

🔗 **Canlı Site:** [arftech.tr]()

---

## 📂 Proje Yapısı

Web sitesi, bakım kolaylığı ve hız için yalın HTML/CSS yapısı üzerine kurulmuştur.

```text
ARF-WEB/
├── index.html                # Ana Sayfa (Landing Page)
├── yazilar.html              # Teknik Yazılar Vitrini (Blog Hub)
├── images/                   # Tüm görseller bu klasörde toplanır
│   ├── emi-filter-comparison.jpg
│   ├── sic-thermal-map.jpg
│   └── ...
├── gan-emi-analizi.html      # [IEEE Review] Makale Sayfası
├── sic-termal-analiz.html    # [IEEE Review] Makale Sayfası
├── mil-std-810h.html         # [Standart] Makale Sayfası
├── guc-yogunlugu.html        # [Tech Briefing] Makale Sayfası
├── arf-insight-layout.html   # [ARF Insight] Özel Konsept Sayfası
├── case-study-thermal.html   # [Case Study] Vaka Analizi Sayfası
├── background.mp4            # Arka plan videosu
└── README.md                 # Proje Dokümantasyonu

```

---

## 📝 Teknik İçerik Stratejisi ve Konseptler

Sitedeki teknik yazılar 4 ana kategoriye ayrılmıştır. Her kategorinin tasarım dili, renk kodu ve hitap ettiği kitle farklıdır.

### 1. IEEE Review (Akademik İnceleme)

* **Amaç:** Akademik literatürü takip ettiğimizi ve en son teknolojileri (State-of-the-Art) bildiğimizi göstermek.
* **Format:** Makale Özeti + Görsel + **ARF Yorumu**.
* **Renk Kodu:** <span style="color:red">**Kırmızı Etiket**</span> (`background: #e30a17`)
* **İçerik:** IEEE Xplore makalelerinin savunma sanayii perspektifiyle yorumlanması.
* **Örnek Dosya:** `gan-emi-analizi.html`

### 2. Tech Briefing (Teknoloji Özeti)

* **Amaç:** Yatırımcılara ve yöneticilere sektörün geleceğini ve ARF'nin vizyonunu anlatmak.
* **Format:** Trend Analizi + Pazar Vizyonu.
* **Renk Kodu:** **Siyah/Beyaz Etiket** (`background: #fff; color: #000`)
* **İçerik:** Minyatürizasyon, Güç Yoğunluğu gibi stratejik konular.
* **Örnek Dosya:** `guc-yogunlugu.html`

### 3. ARF Insight (Özgün Mühendislik)

* **Amaç:** Şirketin kendi geliştirdiği tasarım metodolojilerini ve "Know-How"ını sergilemek.
* **Format:** **Design Rules (Tasarım Kuralları)** kutuları içerir.
* **Renk Kodu:** **Kırmızı Arka Plan / Vurgulu** (`background: rgba(227, 10, 23, 0.1)`)
* **İçerik:** PCB Layout teknikleri, EMI shielding yöntemleri.
* **Örnek Dosya:** `arf-insight-layout.html`

### 4. Case Study (Vaka Analizi)

* **Amaç:** Gerçekleşmiş bir projede çözülen problemi kanıtlamak.
* **Format:** Problem -> Analiz -> Çözüm -> **Sonuç Tablosu**.
* **Renk Kodu:** **Cyan/Mavi Tema** (`color: #00d4ff`)
* **İçerik:** Termal darboğaz çözümleri, verimlilik artış hikayeleri.
* **Örnek Dosya:** `case-study-thermal.html`

---

## 🎨 Görsel Standartları (Assets Guidelines)

Sitenin profesyonel görünümü için görsellerde aşağıdaki kurallara **kesinlikle** uyulmalıdır.

### Teknik Özellikler

* **Format:** `.jpg` (Optimize edilmiş).
* **En/Boy Oranı:** **16:9** (Geniş Ekran).
* **Çözünürlük:** Önerilen genişlik **1200px - 1920px**.
* **Dosya Boyutu:** Sayfa hızı için görsel başına **maksimum 500KB**.

### Tasarım Dili (Aesthetic)

Görseller şu anahtar kelimelerle (Prompt Keywords) oluşturulmalıdır:

* *Dark Mode, Schematic Overlay, Neon Red/Cyan Accents, Macro Photography, High-Tech, Engineering Aesthetic.*
* Beyaz arka planlı, stok fotoğraf hissi veren görseller **kullanılmamalıdır.**

### Dosya İsimlendirme Kuralları

Dosya isimleri **küçük harf** olmalı, **Türkçe karakter içermemeli** ve kelimeler **tire (-)** ile ayrılmalıdır.

* ✅ Doğru: `sic-thermal-map.jpg`
* ❌ Yanlış: `SiC Termal Harita.JPG`

---

## 🚀 Yeni Yazı Ekleme Adımları (Workflow)

1. **Şablon Seç:** Yazının türüne uygun `.html` dosyasını (örn: `gan-emi-analizi.html`) kopyala ve yeni isimle kaydet.
2. **İçeriği Gir:** Metinleri, başlıkları ve meta bilgilerini (Tarih, Yazar) güncelle.
3. **Görsel Üret:** 16:9 formatında, konsept uyumlu görseli oluştur ve `images/` klasörüne yükle.
4. **Bağlantı Yap:** `yazilar.html` dosyasını aç ve en üst sıraya yeni yazının kartını ekle.
5. **Commit & Push:** Değişiklikleri GitHub'a gönder.

---

## 🛠️ Kullanılan Teknolojiler

* **HTML5 / CSS3:** Saf (Vanilla) kod yapısı.
* **Fontlar:** Orbitron (Başlıklar), Montserrat (Metin), Share Tech Mono (Teknik Veriler).
* **İkonlar:** FontAwesome 6.
* **Hosting:** GitHub Pages.

---

© 2026 ARF İleri Teknoloji | Tüm Hakları Saklıdır.
