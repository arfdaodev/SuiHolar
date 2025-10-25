#!/bin/bash

# Suiholar Frontend Kurulum ve Başlatma Script'i
echo "🚀 Suiholar Frontend Kurulum Başlıyor..."

cd /Users/biar/Desktop/Sui/frontend

# Node.js sürümünü kontrol et
NODE_VERSION=$(node -v)
echo "📦 Node.js sürümü: $NODE_VERSION"

# Bağımlılıkları kur
echo "📦 Bağımlılıklar kuruluyor..."

# Ana paketler (uyumlu sürümler)
npm install --save react@^18.2.0 react-dom@^18.2.0
npm install --save react-router-dom@^6.16.0
npm install --save @tanstack/react-query@^4.32.6

# UI ve ikon kütüphaneleri (basit alternatifler)
echo "🎨 UI kütüphaneleri kuruluyor..."
npm install --save-dev tailwindcss@^3.3.5 autoprefixer@^10.4.16 postcss@^8.4.31

# Utility kütüphaneleri
npm install --save clsx@^2.0.0

# Sui SDK için basit HTTP client
npm install --save axios@^1.5.0

# Development dependencies
echo "🔧 Development bağımlılıkları kuruluyor..."
npm install --save-dev @types/node@^20.8.0

# Tailwind'i başlat
npx tailwindcss init -p

echo "✅ Kurulum tamamlandı!"
echo ""
echo "🚀 Projeyi başlatmak için:"
echo "   cd /Users/biar/Desktop/Sui/frontend"
echo "   npm run dev"
echo ""
echo "🌐 Tarayıcıda http://localhost:3000 adresini açın"