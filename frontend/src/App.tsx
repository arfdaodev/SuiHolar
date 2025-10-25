import { useState, useEffect } from 'react';
import { SuiDAppProvider, CustomWalletButton, useWalletState } from './contexts/WalletContext_dappkit';
import { useCreateProject, formatSUI, formatTimeline } from './hooks/useProject';
import './index.css';

// CSS imports for dApp Kit
import '@mysten/dapp-kit/dist/index.css';

function WalletButton() {
  return <CustomWalletButton />;
}

function Navigation({ activeTab, setActiveTab }: { 
  activeTab: 'dashboard' | 'create' | 'tokens';
  setActiveTab: (tab: 'dashboard' | 'create' | 'tokens') => void;
}) {
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SuiHolar Research DAO
              </h1>
            </div>
            <div className="ml-10 flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Proje Oluştur
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'tokens'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Token Yönetimi
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}

function Dashboard({ setActiveTab }: { 
  setActiveTab: (tab: 'dashboard' | 'create' | 'tokens') => void 
}) {
  const { isConnected, address } = useWalletState();
  const [projects, setProjects] = useState<any[]>([]);

  // Projeleri localStorage'dan yükle
  useEffect(() => {
    if (isConnected && address) {
      const savedProjects = JSON.parse(localStorage.getItem('suiholar_projects') || '[]');
      // Sadece bu kullanıcının projelerini filtrele
      const userProjects = savedProjects.filter((p: any) => p.owner === address);
      setProjects(userProjects);
    }
  }, [isConnected, address]);
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">SuiHolar Research DAO'ya hoş geldiniz</p>
      </div>

      {isConnected ? (
        <div className="space-y-8">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cüzdan Bilgileri</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Adres:</span> {address?.slice(0, 10)}...{address?.slice(-8)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500">Bakiye yükleniyor...</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Proje İstatistikleri</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Toplam Proje: <span className="font-semibold">{projects.length}</span></p>
                <p className="text-sm text-gray-600">Toplam Hedef: <span className="font-semibold">{projects.reduce((sum, p) => sum + (p.fundingGoal || 0), 0)} SUI</span></p>
                <p className="text-sm text-gray-600">Aktif Token: <span className="font-semibold">{projects.length * 2}</span></p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DAO Yönetimi</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Voting Power: 0</p>
                <p className="text-sm text-gray-600">Aktif Proposaller: 0</p>
                <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Proposal Oluştur
                </button>
              </div>
            </div>
          </div>

          {/* Tüm Projeler Listesi */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Tüm Projelerim</h3>
              <p className="text-sm text-gray-600">Oluşturduğunuz araştırma projelerinin listesi</p>
            </div>
            
            {projects.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>
                        
                        {/* Proje Detayları */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>💰 Hedef: {project.fundingGoal} SUI</span>
                          <span>📅 Süre: {formatTimeline(project.timeline)}</span>
                          <span>📅 Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        
                        {/* Token Bilgileri */}
                        {project.governanceTokenName && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              🏛️ $PAPER{project.governanceTokenName} ({project.governanceTokenSupply?.toLocaleString()})
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              📄 {project.articleTokenName} ({project.articleTokenSupply})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Durum ve Aksiyonlar */}
                      <div className="ml-4 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📊 Aktif
                        </span>
                        <div className="mt-2 space-x-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Detaylar
                          </button>
                          <button className="text-xs text-green-600 hover:text-green-700 font-medium">
                            Fonla
                          </button>
                        </div>
                        {project.transactionDigest && (
                          <p className="text-xs text-gray-400 mt-1">
                            TX: {project.transactionDigest.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Henüz proje yok</h4>
                <p className="text-gray-600 mb-4">İlk araştırma projenizi oluşturarak başlayın</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Proje Oluştur
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-gray-600 mb-4">Dashboard'a erişim için lütfen cüzdanınızı bağlayın</p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateProject() {
  const { isConnected } = useWalletState();
  const { createProject, isCreating, error, clearError } = useCreateProject();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    timeline: '',
    // Token yönetimi alanları
    governanceTokenName: '',
    governanceTokenSupply: '',
    articleTokenName: '',
    articleTokenSupply: ''
  });
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    // Form validasyonu
    if (!formData.title.trim() || 
        !formData.description.trim() || 
        !formData.fundingGoal || 
        !formData.timeline ||
        !formData.governanceTokenName.trim() ||
        !formData.governanceTokenSupply ||
        !formData.articleTokenName.trim() ||
        !formData.articleTokenSupply) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      console.log('Sui blockchain üzerinde proje oluşturuluyor...', formData);
      
      const result = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        fundingGoal: parseFloat(formData.fundingGoal),
        timeline: parseInt(formData.timeline),
        governanceTokenName: formData.governanceTokenName.trim(),
        governanceTokenSupply: parseInt(formData.governanceTokenSupply),
        articleTokenName: formData.articleTokenName.trim(),
        articleTokenSupply: parseInt(formData.articleTokenSupply)
      });

      if (result?.success) {
        setSuccessMessage(
          `🎉 Proje başarıyla oluşturuldu!\n` +
          `📝 Başlık: ${formData.title}\n` +
          `💰 Hedef: ${formData.fundingGoal} SUI\n` +
          `📅 Süre: ${formatTimeline(parseInt(formData.timeline))}\n` +
          `🏛️ Yönetim Token: $PAPER${formData.governanceTokenName} (${formData.governanceTokenSupply})\n` +
          `📄 Makale Token: ${formData.articleTokenName} (${formData.articleTokenSupply})\n` +
          `🔗 Transaction: ${result.digest}`
        );
        console.log('Blockchain transaction başarılı:', result);
        
        // Formu temizle
        setFormData({
          title: '',
          description: '',
          fundingGoal: '',
          timeline: '',
          governanceTokenName: '',
          governanceTokenSupply: '',
          articleTokenName: '',
          articleTokenSupply: ''
        });
        
        // Dashboard'ı yenile için delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error('Proje oluşturma hatası:', err);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-gray-600 mb-4">Proje oluşturmak için lütfen cüzdanınızı bağlayın</p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Yeni Araştırma Projesi Oluştur</h2>
        <p className="text-gray-600">Araştırma projenizi DAO'ya ekleyip token ekonomisi oluşturun</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Başarı mesajı */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <div className="whitespace-pre-line">
              {successMessage}
            </div>
          </div>
        )}
        
        {/* Hata mesajı */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Proje Başlığı
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Projenizin başlığını girin"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Proje Açıklaması
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Projenizi detaylı bir şekilde açıklayın"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 mb-2">
              Hedef Fonlama (SUI)
            </label>
            <input
              type="number"
              id="fundingGoal"
              name="fundingGoal"
              value={formData.fundingGoal}
              onChange={handleInputChange}
              step="0.1"
              min="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
              required
            />
          </div>
          
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Proje Süresi (Ay)
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Süre seçin</option>
              <option value="3">3 Ay</option>
              <option value="6">6 Ay</option>
              <option value="12">12 Ay</option>
              <option value="24">24 Ay</option>
            </select>
          </div>
          
          {/* Token Yönetimi Bölümü */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Token Yönetimi</h4>
            
            {/* Yönetim Token'ı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="governanceTokenName" className="block text-sm font-medium text-gray-700 mb-2">
                  Yönetim Token Adı ($PAPER...)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 font-medium">$PAPER</span>
                  <input
                    type="text"
                    id="governanceTokenName"
                    name="governanceTokenName"
                    value={formData.governanceTokenName}
                    onChange={handleInputChange}
                    className="w-full pl-20 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="RESEARCH"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Örnek: $PAPERRESEARCH (Araştırma makalesi yönetim token'ı)</p>
              </div>
              
              <div>
                <label htmlFor="governanceTokenSupply" className="block text-sm font-medium text-gray-700 mb-2">
                  Yönetim Token Arzı
                </label>
                <input
                  type="number"
                  id="governanceTokenSupply"
                  name="governanceTokenSupply"
                  value={formData.governanceTokenSupply}
                  onChange={handleInputChange}
                  min="1000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Proje yönetimi için kullanılacak (Min: 1,000)</p>
              </div>
            </div>
            
            {/* Makale Token'ı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="articleTokenName" className="block text-sm font-medium text-gray-700 mb-2">
                  Makale Token Adı
                </label>
                <input
                  type="text"
                  id="articleTokenName"
                  name="articleTokenName"
                  value={formData.articleTokenName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AI_RESEARCH_NFT"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Makale/araştırma çıktıları için token adı</p>
              </div>
              
              <div>
                <label htmlFor="articleTokenSupply" className="block text-sm font-medium text-gray-700 mb-2">
                  Makale Token Arzı
                </label>
                <input
                  type="number"
                  id="articleTokenSupply"
                  name="articleTokenSupply"
                  value={formData.articleTokenSupply}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Makale parçalarının sayısı (örn: 100 NFT)</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setFormData({ 
                title: '', 
                description: '', 
                fundingGoal: '', 
                timeline: '',
                governanceTokenName: '',
                governanceTokenSupply: '',
                articleTokenName: '',
                articleTokenSupply: ''
              })}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Temizle
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Blockchain'de Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Sui'de Proje Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TokenManagement() {
  const { isConnected } = useWalletState();
  
  if (!isConnected) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cüzdan Bağlantısı Gerekli</h3>
            <p className="text-gray-600 mb-4">Token yönetimi için lütfen cüzdanınızı bağlayın</p>
            <div className="flex justify-center">
              <WalletButton />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Token Yönetimi</h2>
        <p className="text-gray-600">DAO tokenlarınızı yönetin ve işlem yapın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Bakiyeleri</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">SUI</p>
                <p className="text-sm text-gray-600">Native Token</p>
              </div>
              <div className="text-right">
                <p className="font-medium">0.00 SUI</p>
                <p className="text-sm text-gray-600">$0.00</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">SHOLAR</p>
                <p className="text-sm text-gray-600">DAO Token</p>
              </div>
              <div className="text-right">
                <p className="font-medium">0 SHOLAR</p>
                <p className="text-sm text-gray-600">Voting Power</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              Token Satın Al
            </button>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Stake Et
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              Governance'a Katıl
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'tokens'>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'create':
        return <CreateProject />;
      case 'tokens':
        return <TokenManagement />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <SuiDAppProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
      </div>
    </SuiDAppProvider>
  );
}

export default App;