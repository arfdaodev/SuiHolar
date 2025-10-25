# 🔬 SuiHolar Research DAO

**SuiHolar Research DAO** - Sui blockchain üzerinde merkezi olmayan araştırma topluluğu ve token ekonomisi platformu.

## 🌟 Özellikler

### 🔗 Multi-Wallet Desteği
- ✅ Sui Wallet entegrasyonu
- ✅ Phantom Wallet desteği
- ✅ Tüm Sui uyumlu cüzdanlar
- ✅ @mysten/dapp-kit ile modern entegrasyon

### 🚀 Araştırma Proje Yönetimi
- 📝 Detaylı proje oluşturma formu
- 💰 SUI ile funding hedefleri
- 📅 Esnek timeline yönetimi
- 🎯 Dashboard ile proje takibi

### 🪙 Token Ekonomisi
- 🏛️ **Yönetim Token'ları**: `$PAPER` prefix'li governance token'ları
- 📄 **Makale Token'ları**: Araştırma çıktıları için NFT-benzeri token'lar
- 📊 Kullanıcı tanımlı token arzları
- 💡 Proje başına özelleştirilebilir token ekonomisi

### 🎨 Modern UI/UX
- ⚡ React 18 + TypeScript
- 🎨 Tailwind CSS ile responsive tasarım
- 🔥 Vite ile hızlı geliştirme
- 📱 Mobil uyumlu arayüz

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern React hooks ve context API
- **TypeScript** - Type-safe geliştirme
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework

### Blockchain
- **Sui Blockchain** - Layer 1 blockchain
- **@mysten/dapp-kit** - Sui dApp geliştirme kiti
- **@mysten/sui** - Sui JavaScript SDK
- **Move Language** - Smart contract geliştirme

### Cüzdan Entegrasyonu
- **@mysten/wallet-adapter** - Multi-wallet desteği
- **@tanstack/react-query** - API state yönetimi

## 🚀 Kurulum

### Ön Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Sui wallet (tarayıcı eklentisi)

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/[username]/suiholar-research-dao.git
cd suiholar-research-dao
```

2. **Frontend bağımlılıklarını kurun**
```bash
cd frontend
npm install
```

3. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

4. **Tarayıcınızda açın**
```
http://localhost:3000
```

## 📖 Kullanım

### 1. Cüzdan Bağlantısı
- Sayfanın sağ üstündeki "Cüzdan Bağla" butonuna tıklayın
- Mevcut Sui cüzdanlarınızdan birini seçin
- İzin vererek bağlantıyı onaylayın

### 2. Proje Oluşturma
- "Proje Oluştur" sekmesine gidin
- Proje bilgilerini doldurun:
  - Başlık ve açıklama
  - Hedef funding (SUI)
  - Proje süresi
  - **Token Yönetimi**:
    - Yönetim token adı (`$PAPER` + sizin eklentiniz)
    - Yönetim token arzı
    - Makale token adı
    - Makale token arzı

### 3. Dashboard
- Tüm projelerinizi görüntüleyin
- Proje istatistiklerini takip edin
- Token bilgilerini kontrol edin

## 🔮 Özellik Örnekleri

### Token Sistemi
```
Proje: "AI Güvenliği Araştırması"
├── Yönetim Token: $PAPERAISAFETY (10,000 adet)
├── Makale Token: AI_SAFETY_PAPERS (100 adet)
└── Hedef Funding: 5,000 SUI
```

### Blockchain Entegrasyonu
- Her proje Sui blockchain'de gerçek bir obje olarak oluşturulur
- SUI token'ları ile funding mekanizması
- Transaction hash'leri ile şeffaf kayıt tutma

## 🏗️ Proje Yapısı

```
/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── contexts/        # React context'ler (Wallet, vb.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── components/      # UI bileşenleri
│   │   └── App.tsx          # Ana uygulama
│   ├── package.json
│   └── vite.config.ts
├── move-contract/           # Sui Move smart contract'ları
│   ├── sources/
│   │   └── research_dao.move
│   └── Move.toml
└── README.md
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🔗 Bağlantılar

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Guide](https://move-language.github.io/move/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 💬 İletişim

Proje ile ilgili sorularınız için:
- GitHub Issues
- Twitter: [@suiholar]
- Discord: [SuiHolar Community]

---

**🚀 Sui blockchain üzerinde araştırma topluluğu oluşturun!**
├── frontend/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── components/          # UI bileşenleri
│   │   ├── pages/              # Sayfa bileşenleri
│   │   ├── hooks/              # Custom React hooks
│   │   ├── config/             # Konfigürasyon dosyaları
│   │   └── lib/                # Utility fonksiyonlar
│   ├── package.json
│   ├── tailwind.config.js
│   └── setup.sh               # Frontend kurulum script'i
├── build.sh                    # Move build script'i
└── README.md                   # Bu dosya
```

## 🪙 Token Yapısı

Proje iki ana token tipine sahiptir:

### 1. PAPER_TOKEN (IP Sahipliği)
- **Amaç**: Ana yönetişim token'ı
- **Fonksiyon**: Araştırma projesinin fikri mülkiyet haklarını temsil eder
- **Symbol**: PAPER
- **Decimals**: 9

### 2. COVAX_FINANCE_TOKEN (Ön Satış/Fon Token'ı)
- **Amaç**: Araştırma projesine özel fonlama
- **Fonksiyon**: Projenin finansmanı için kullanılır
- **Symbol**: COVAX
- **Decimals**: 9

## 🖥️ Frontend Özellikleri

### Ana Sayfalar
1. **Dashboard**: Proje genel bakışı ve istatistikleri
2. **Proje Oluşturma**: Yeni araştırma projesi oluşturma formu
3. **Proje Detayları**: Detaylı proje bilgileri ve IPFS entegrasyonu
4. **Token Yönetimi**: Token bakiye, transfer ve işlem geçmişi

### UI/UX Özellikler
- 🎨 Modern gradient tasarım
- 📱 Responsive (mobil uyumlu)
- 🌙 Glassmorphism efektleri
- 🔄 Loading animasyonları
- 📊 İnteraktif dashboardlar
- 🎯 Token badge'leri ve durum göstergeleri

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+ (mevcut: 18.20.8)
- Sui CLI (opsiyonel, smart contract geliştirme için)

### 1. Smart Contract (Move) Kurulumu

```bash
# Sui CLI kurulumu (opsiyonel)
curl -fsSL https://get.sui.io | sh
source ~/.bashrc

# Projeyi derleme
./build.sh
```

### 2. Frontend Kurulumu

```bash
# Frontend dizinine git
cd /Users/biar/Desktop/Sui/frontend

# Hızlı kurulum script'i ile
./setup.sh

# Veya manuel kurulum
npm install
npm run dev
```

### 3. Tarayıcıda Görüntüleme

```
http://localhost:3000
```

## 🔧 Geliştirme

### Smart Contract Geliştirme
```bash
# Move projesini derle
sui move build

# Testleri çalıştır
sui move test
```

### Frontend Geliştirme
```bash
cd frontend

# Development server başlat
npm run dev

# Production build
npm run build

# Linting
npm run lint
```

## 📦 Kullanılan Teknolojiler

### Backend (Smart Contract)
- **Move**: Sui blockchain smart contract dili
- **Sui Framework**: Sui blockchain kütüphaneleri

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling framework
- **React Router**: Sayfa yönlendirme
- **React Query**: State management (planlanıyor)

### UI/UX
- **Lucide React**: Modern ikonlar (planlanıyor)
- **Glassmorphism**: Modern tasarım efektleri
- **Responsive Design**: Mobil uyumluluk
- **Custom Animations**: Kullanıcı deneyimi

## 🎯 Kullanım Senaryoları

### 1. Araştırma Projesi Oluşturma
```typescript
// Frontend'de yeni proje oluşturma
const projectData = {
  title: "Blockchain ile Akademik Makale Tokenizasyonu",
  description: "...",
  paperInitialSupply: 1000000,
  covaxInitialSupply: 500000,
  file: selectedFile
};
```

### 2. Token Yönetimi
- PAPER token transfer işlemleri
- COVAX token fonlama operasyonları
- Bakiye görüntüleme ve işlem geçmişi

### 3. IPFS Entegrasyonu
- Akademik dosya yükleme
- Merkezi olmayan depolama
- Hash doğrulama

## 🔒 Güvenlik Özellikleri

- **Ownership-based Access Control**: Sui object capability modeli
- **Treasury Cap Management**: Token basım yetkisi kontrolü
- **Status Validation**: Proje durum geçiş kontrolü
- **Input Validation**: Frontend form doğrulamaları

## 🌐 Network Konfigürasyonu

```typescript
// Desteklenen ağlar
const networks = {
  localnet: 'http://localhost:9000',
  devnet: 'https://fullnode.devnet.sui.io',
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io'
};
```

## 📋 Proje Durumları

| Durum | Değer | Açıklama | UI Rengi |
|-------|-------|----------|----------|
| DRAFT | 0 | Proje taslak aşamasında | Gri |
| FUNDING | 1 | Fonlama aşamasında | Sarı |
| RESEARCH | 2 | Araştırma aşamasında | Mavi |
| PUBLISHED | 3 | Yayınlanmış | Yeşil |

## � Gelecek Geliştirmeler

- [ ] Sui Wallet entegrasyonu
- [ ] Gerçek IPFS/Walrus entegrasyonu
- [ ] DAO yönetişim sistemi
- [ ] NFT mint özelliği
- [ ] Çoklu dil desteği
- [ ] Mobile app geliştirme
- [ ] Advanced analytics dashboard

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📄 Lisans

Bu proje, akademik araştırma amacıyla geliştirilmiştir.

---

**Geliştirici Notu**: Bu proje Suiholar DAO ekosisteminin temelini oluşturur ve sürekli geliştirilmektedir. Blockchain teknolojisi ile akademik dünyanın buluşmasını hedefler.