import { useState } from 'react';
import { SuiDAppProvider, CustomWalletButton } from './contexts/WalletContext_dappkit';
import './index.css';

// CSS imports for dApp Kit
import '@mysten/dapp-kit/dist/index.css';

function WalletButton() {
  return <CustomWalletButton />;
}

  // Debug: Sui Wallet durumunu kontrol et
  const handleConnect = async () => {
    console.log('Cüzdan bağlanma başlatıldı...');
    console.log('window.suiWallet mevcut mu?', !!window.suiWallet);
    
    if (window.suiWallet) {
      console.log('Sui Wallet API fonksiyonları:', Object.keys(window.suiWallet));
    }
    
    await connect();
  };

  if (wallet.status === 'connected') {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {shortenAddress(wallet.address || '')}
          </div>
          {wallet.balance && (
            <div className="text-xs text-gray-500">
              {(wallet.balance / 1000000).toFixed(2)}M SUI
            </div>
          )}
          {wallet.name && (
            <div className="text-xs text-blue-600">
              {wallet.name}
            </div>
          )}
        </div>
        <button
          onClick={disconnect}
          className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
        >
          Bağlantıyı Kes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={() => {
          clearError(); // Önce hataları temizle
          handleConnect();
        }}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Bağlanıyor...</span>
          </>
        ) : (
          <>
            <span>🔗</span>
            <span>Cüzdan Bağla</span>
          </>
        )}
      </button>
      {error && (
        <div className="text-xs text-red-600 mt-1 max-w-48 text-right bg-red-50 p-2 rounded border border-red-200">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={clearError}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <div className="h-6 w-6 text-white">📚</div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Suiholar</h1>
                <p className="text-xs text-gray-500">Research DAO</p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentPage('create')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'create'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Yeni Proje
              </button>
              <button
                onClick={() => setCurrentPage('tokens')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === 'tokens'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Token Yönetimi
              </button>
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'create' && <CreateProjectPage />}
        {currentPage === 'tokens' && <TokenManagementPage />}
      </main>
    </div>
  );
}

function DashboardPage() {
  const { wallet } = useWallet();

  return (
    <div className="space-y-8">
      {/* Wallet Status Banner */}
      {wallet.status === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600">✓</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-900">Cüzdan Bağlı</h3>
                <p className="text-sm text-green-700">
                  {shortenAddress(wallet.address || '')}
                  {wallet.balance && (
                    <span className="ml-2">• {(wallet.balance / 1000000).toFixed(2)}M SUI</span>
                  )}
                </p>
              </div>
            </div>
            <div className="text-green-600">🎉</div>
          </div>
        </div>
      )}

      {wallet.status === 'disconnected' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600">⚠️</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Cüzdan Bağlı Değil</h3>
                <p className="text-sm text-yellow-700">
                  Tüm özellikleri kullanmak için cüzdanınızı bağlayın
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Suiholar Research DAO
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Akademik araştırmaları tokenlaştırın, işbirliği yapın ve bilimsel ilerlemeyi destekleyin.
          Blockchain teknolojisi ile şeffaf ve adil bir araştırma ekosistemi oluşturun.
        </p>
        
        {/* Cüzdan Durumu Bilgisi */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-blue-700 font-medium">
            {getWalletStatus()}
          </p>
          {wallet.status === 'disconnected' && (
            <p className="text-xs text-blue-600 mt-1">
              Cüzdanınızı bağlayarak tüm özelliklere erişin
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
              <p className="text-3xl font-bold text-gray-900">2</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-blue-600">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Araştırma</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-green-600">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PAPER Token</p>
              <p className="text-2xl font-bold text-blue-600">1.7M</p>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              PAPER
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">COVAX Token</p>
              <p className="text-2xl font-bold text-green-600">0.8M</p>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              COVAX
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Araştırma Projeleri</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Blockchain ile Akademik Makale Tokenizasyonu
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  Araştırma
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <span>👤 0x1234...5678</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">PAPER: </span>
                  <span className="font-semibold text-blue-600">1000K</span>
                </div>
                <div>
                  <span className="text-gray-600">COVAX: </span>
                  <span className="font-semibold text-green-600">500K</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 border-t pt-3">
                Oluşturulma: 20 Ekim 2025
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Destekli Peer Review Sistemi
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Fonlama
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <span>👤 0x8765...4321</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">PAPER: </span>
                  <span className="font-semibold text-blue-600">750K</span>
                </div>
                <div>
                  <span className="text-gray-600">COVAX: </span>
                  <span className="font-semibold text-green-600">350K</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 border-t pt-3">
                Oluşturulma: 18 Ekim 2025
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateProjectPage() {
  const { wallet } = useWallet();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    paperSupply: 1000000,
    covaxSupply: 500000
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Wallet Required Notice */}
      {wallet.status !== 'connected' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600">🔒</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-orange-900">Cüzdan Gerekli</h3>
              <p className="text-sm text-orange-700">
                Proje oluşturmak için önce cüzdanınızı bağlamalısınız
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Araştırma Projesi</h1>
        <p className="text-gray-600 mt-1">
          Akademik araştırmanızı tokenlaştırın ve toplulukla paylaşın
        </p>
      </div>

      <form className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            📄 Proje Bilgileri
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proje Başlığı *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Blockchain ile Akademik Makale Tokenizasyonu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Projenizin detaylı açıklamasını yazın..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            💰 Token Konfigürasyonu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAPER Token Arzı *
              </label>
              <input
                type="number"
                value={formData.paperSupply}
                onChange={(e) => setFormData(prev => ({ ...prev, paperSupply: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">IP sahipliği için ana token</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COVAX Token Arzı *
              </label>
              <input
                type="number"
                value={formData.covaxSupply}
                onChange={(e) => setFormData(prev => ({ ...prev, covaxSupply: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Fonlama için özel token</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={wallet.status !== 'connected'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-8 rounded-lg transition-all duration-200"
          >
            {wallet.status === 'connected' ? 'Proje Oluştur' : 'Cüzdan Bağlayın'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TokenManagementPage() {
  const { wallet } = useWallet();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Token Yönetimi</h1>
        <p className="text-gray-600">
          PAPER ve COVAX tokenlarınızı yönetin ve transfer edin
        </p>
      </div>

      {/* Wallet Required Notice */}
      {wallet.status !== 'connected' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600">🔒</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-orange-900">Cüzdan Gerekli</h3>
              <p className="text-sm text-orange-700">
                Token yönetimi için önce cüzdanınızı bağlamalısınız
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Toplam Değer</h3>
            <span className="text-green-500">📈</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">$22,500</p>
          <p className="text-sm text-green-600 mt-1">+12.5% bu ay</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              PAPER
            </span>
            <span>🪙</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">1,000,000</p>
          <p className="text-sm text-gray-600 mt-1">≈ $15,000</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              COVAX
            </span>
            <span>🪙</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">500,000</p>
          <p className="text-sm text-gray-600 mt-1">≈ $7,500</p>
        </div>
      </div>

      {/* Transfer Form */}
      {wallet.status === 'connected' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Token Transfer</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Seçin
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="PAPER">PAPER Token</option>
                  <option value="COVAX">COVAX Token</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alıcı Adresi
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Transfer Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;