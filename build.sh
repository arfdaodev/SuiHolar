#!/usr/bin/env bash

# Suiholar Research Project Build ve Test Script
# Bu script, projeyi derlemek ve test etmek için kullanılır

echo "🔬 Suiholar Research Project Build Script"
echo "========================================="

# 1. Sui CLI varlığını kontrol et
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI bulunamadı. Lütfen Sui CLI'yi kurun:"
    echo "   curl -fsSL https://get.sui.io | sh"
    echo "   source ~/.bashrc"
    exit 1
fi

echo "✅ Sui CLI bulundu"

# 2. Projeyi derle
echo "🔨 Projeyi derleniyor..."
sui move build

if [ $? -eq 0 ]; then
    echo "✅ Proje başarıyla derlendi"
else
    echo "❌ Derleme hatası"
    exit 1
fi

# 3. Test etmek isterseniz (sui move test komutu)
echo "🧪 Testleri çalıştırmak için 'sui move test' komutunu kullanabilirsiniz"

echo "🎉 Build tamamlandı!"