# ARF V4 kavramsal sinematik varlıkları

Bu klasördeki görseller ve videolar, ARF İleri Teknoloji'nin yeni web deneyimi için
üretilmiş **kavramsal görselleştirmelerdir**. Gerçek bir ürün, prototip, patent,
laboratuvar sonucu, tesis, müşteri projesi veya iş ortaklığı göstermezler.

## Varlık eşlemesi

| Dosya kökü | Kullanım |
| --- | --- |
| `utopia-home-energy` | Ana sayfa enerji evreni |
| `utopia-corporate-core` | Kurumsal yapı ve korunan teknoloji çekirdeği |
| `utopia-energy-management` | Enerji yönetimi ve korunumu |
| `utopia-energy-harvesting` | Enerji üretimi ve hasadı |
| `utopia-research-ip` | Araştırma, fikrî değer ve geleceğin bilgi ekseni |
| `utopia-publications-atlas` | Çalışmalar ve araştırma notları |

Her varlığın WebP posteri ile 10 saniyelik, sessiz ve kusursuz döngülenen
`-motion-v2.mp4` sürümü bulunur. Kamera tüm film boyunca sabittir. Hareket;
enerji liflerinin biçim değiştirmesi, parçacıkların akış yollarında ilerlemesi,
alan düğümlerinin ışık yayması ve atmosferik parçacıkların devinimiyle oluşur.
Hareket tercihi, görünürlük ve veri tasarrufu koşulları istemci tarafında
yönetilir.

Hareket filmlerini yeniden üretmek için:

```bash
python3 tools/generate-v4-motion-films.py
```

## Prompt seti

Tüm görseller built-in `image_gen` aracının `stylized-concept` modu ile, 16:9
oranında üretildi. Ortak sanat yönü:

- pozitif ve ütopyacı, ancak kurumsal ve teknik olarak ölçülü bir gelecek atmosferi;
- grafit derinlik, turkuaz/camgöbeği enerji akışları, sıcak fildişi ışık ve çok
  sınırlı ARF kırmızısı düğümler;
- sabit kamera içinde gerçek sahne hareketine uygun ön, orta ve arka plan katmanları;
- Türkçe başlıklar için kontrollü, düşük ayrıntılı karanlık metin alanı;
- cam-seramik membranlar, kristal-mineral yapılar ve iletken ışık lifleri;
- metin, logo, UI, grafik, veri, insan, şehir, fabrika, laboratuvar, güneş paneli,
  türbin, batarya veya tanınabilir ürün bulunmaması;
- kamuya açıklanmamış çalışma, patent, partner, müşteri veya performans sonucu ima
  edilmemesi.

Sayfa özelindeki promptlar sırasıyla temiz enerji akışını; dört katmanlı kurumsal
çekirdeği; dengeli ve korunan kapalı döngüyü; ortam enerjisinin soyut bir odakta
toplanıp yeniden dağılmasını; korunan bilgi lifleri ve çekirdeklerini; yaşayan
araştırma topoğrafyalarını vurgular.
