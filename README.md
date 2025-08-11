# SignalBoat.com Discord Translator

This Chrome extension automatically translates Discord messages. Powered by SignalBoat.com - Advanced trading signals and market analysis.

## 🚢 About SignalBoat.com

SignalBoat.com provides advanced trading signals, market analysis, and real-time alerts for cryptocurrency and forex markets. Visit [SignalBoat.com](https://signalboat.com) for professional trading tools and insights.

## Özellikler

- ✅ Discord mesajlarını otomatik çeviri
- ✅ Türkçe bayrağı ile çeviri butonu
- ✅ Çeviri popup'ı ile orijinal metin görüntüleme
- ✅ Ayarlanabilir hedef dil
- ✅ Otomatik kaynak dil algılama
- ✅ Modern Discord teması ile uyumlu tasarım

## Kurulum

1. Bu projeyi bilgisayarınıza indirin
2. Chrome tarayıcınızda `chrome://extensions/` adresine gidin
3. "Geliştirici modu"nu açın
4. "Paketlenmemiş öğe yükle" butonuna tıklayın
5. Bu proje klasörünü seçin

## Kullanım

1. Eklentiyi yükledikten sonra Discord'a gidin
2. Eklenti ikonuna tıklayarak ayarları açın
3. "Otomatik Çeviri"yi açın
4. Hedef dilinizi seçin (varsayılan: Türkçe)
5. Discord'da mesajlar otomatik olarak çevrilecektir

## Nasıl Çalışır

- Eklenti Discord sayfasını izler
- Yeni mesajlar geldiğinde otomatik olarak çevirir
- Çevrilen mesajlarda 🇹🇷 butonu görünür
- Butona tıklayarak çeviriyi ve orijinal metni görebilirsiniz

## Teknik Detaylar

- **Manifest Version**: 3
- **Çeviri API**: Google Translate (ücretsiz)
- **Dil Desteği**: Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Rusça, Japonca, Korece, Çince

## Dosya Yapısı

```
discord-translator/
├── manifest.json      # Eklenti konfigürasyonu
├── content.js         # Discord sayfasında çalışan script
├── background.js      # Arka plan servisi
├── popup.html        # Ayarlar popup'ı
├── popup.js          # Popup JavaScript
└── README.md         # Bu dosya
```

## Geliştirme

Eklentiyi geliştirmek için:

1. Dosyaları düzenleyin
2. Chrome'da `chrome://extensions/` adresine gidin
3. Eklentinin "Yenile" butonuna tıklayın
4. Discord sayfasını yenileyin

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## Sorun Giderme

- Eklenti çalışmıyorsa Discord sayfasını yenileyin
- Çeviri yapılmıyorsa internet bağlantınızı kontrol edin
- Sorun devam ederse eklentiyi kaldırıp tekrar yükleyin
