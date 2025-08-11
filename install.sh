#!/bin/bash

echo "🎯 Discord Otomatik Çevirmen Kurulum Scripti"
echo "=============================================="
echo ""

# Mevcut dizini kontrol et
if [ ! -f "manifest.json" ]; then
    echo "❌ Hata: Bu script manifest.json dosyasının bulunduğu dizinde çalıştırılmalıdır."
    exit 1
fi

echo "✅ Manifest dosyası bulundu"
echo ""

# Dosyaları kontrol et
required_files=("manifest.json" "content.js" "background.js" "popup.html" "popup.js" "icon.svg")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo "❌ Eksik dosyalar:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Lütfen tüm dosyaların mevcut olduğundan emin olun."
    exit 1
fi

echo "✅ Tüm gerekli dosyalar mevcut"
echo ""

echo "📋 Kurulum Adımları:"
echo "1. Chrome tarayıcınızı açın"
echo "2. Adres çubuğuna 'chrome://extensions/' yazın"
echo "3. Sağ üst köşedeki 'Geliştirici modu' düğmesini açın"
echo "4. 'Paketlenmemiş öğe yükle' butonuna tıklayın"
echo "5. Bu klasörü seçin: $(pwd)"
echo "6. Eklenti yüklendikten sonra Discord'a gidin"
echo "7. Eklenti ikonuna tıklayarak ayarları yapın"
echo ""

echo "🎉 Kurulum tamamlandı! Discord'da çeviri özelliğini kullanabilirsiniz."
echo ""
echo "💡 İpucu: Eklentiyi test etmek için Discord'da İngilizce bir mesaj gönderin." 