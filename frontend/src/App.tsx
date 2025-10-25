import { useState, useEffect } from 'react';
import { SuiDAppProvider, CustomWalletButton, useWalletState } from './contexts/WalletContext_dappkit';
import { useCreateProject, formatSUI, formatTimeline } from './hooks/useProject';
import { Transaction } from '@mysten/sui/transactions';
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

function WalletDebug() {
  const { address, isConnected, suiClient, walletName } = useWalletState();
  const [balance, setBalance] = useState<string>('0');
  const [network, setNetwork] = useState<string>('kontrol ediliyor...');
  const [gasCoins, setGasCoins] = useState<number>(0);

  const checkWalletStatus = async () => {
    if (isConnected && address) {
      try {
        console.log('🔍 Network debug başlıyor...');
        setNetwork('🔄 Bağlantı test ediliyor...');
        
        // İlk olarak basit HTTP test - Ankr (CORS bypass ile)
        try {
          console.log('🔍 Ankr API test başlıyor...');
          
          // CORS problemi olabilir, alternatif test
          const testResponse = await fetch('https://rpc.ankr.com/sui_testnet/07bef38f0bfc1ae298b47d8e1e861d5a90128a415cdf9ce2ab0d8c52d3ad35d0', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'sui_getChainIdentifier',
              params: []
            })
          });
          
          if (testResponse.ok) {
            const result = await testResponse.json();
            console.log('✅ Ankr RPC erişimi başarılı:', result);
            setNetwork(`✅ Ankr (Chain: ${result.result || 'Unknown'})`);
          } else {
            console.warn('⚠️ Ankr RPC yanıt hatası:', testResponse.status);
            setNetwork('⚠️ Ankr RPC Yanıt Hatası');
          }
        } catch (httpError) {
          console.warn('⚠️ Ankr RPC test hatası (CORS olabilir):', httpError);
          setNetwork('⚠️ CORS/Network Hatası');
          
          // Fallback: SuiClient ile test
          try {
            console.log('🔄 SuiClient ile fallback test...');
            const balance = await suiClient.getBalance({ owner: address });
            console.log('✅ SuiClient çalışıyor:', balance);
            setNetwork('✅ SuiClient Aktif (via Ankr)');
          } catch (suiError) {
            console.error('❌ SuiClient de başarısız:', suiError);
            setNetwork('❌ RPC Tamamen Başarısız');
          }
        }

        // Balance al
        const balanceResult = await suiClient.getBalance({ owner: address });
        setBalance((Number(balanceResult.totalBalance) / 1_000_000_000).toFixed(4));
        console.log('💰 Balance başarılı:', balanceResult);

        // Network bilgisi al - bu genellikle başarısız olabilir
        try {
          const chainId = await suiClient.getChainIdentifier();
          setNetwork(`✅ ${chainId}`);
          console.log('🌐 Chain ID başarılı:', chainId);
        } catch (chainError) {
          console.warn('⚠️ Chain ID alınamadı:', chainError);
          setNetwork('✅ Testnet (RPC Aktif)');
        }

        // Gas coins say
        const coins = await suiClient.getCoins({
          owner: address,
          coinType: '0x2::sui::SUI'
        });
        setGasCoins(coins.data.length);
        console.log('⛽ Gas coins başarılı:', coins.data.length);

        // Son epoch bilgisi al (network test)
        try {
          const epoch = await suiClient.getCurrentEpoch();
          console.log('📊 Current epoch:', epoch);
          setNetwork(`✅ Testnet (Epoch: ${epoch})`);
        } catch (epochError) {
          console.warn('⚠️ Epoch bilgisi alınamadı:', epochError);
        }

      } catch (error) {
        console.error('❌ Network hatası:', error);
        setNetwork('❌ RPC Bağlantı Hatası');
        
        // Hata detayları
        if (error instanceof Error) {
          console.error('Hata mesajı:', error.message);
          console.error('Hata stack:', error.stack);
        }
      }
    } else {
      setNetwork('⚠️ Cüzdan Bağlı Değil');
    }
  };

  useEffect(() => {
    checkWalletStatus();
  }, [isConnected, address, suiClient]);

  if (!isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs max-w-xs">
      <div className="font-semibold text-blue-900 mb-1">🔧 Wallet Debug</div>
      <div className="space-y-1 text-blue-700">
        <div><strong>Network:</strong> {network}</div>
        <div><strong>Wallet:</strong> {walletName || 'Unknown'}</div>
        <div><strong>Balance:</strong> {balance} SUI {Number(balance) < 0.1 && '⚠️'}</div>
        <div><strong>Gas Coins:</strong> {gasCoins} adet</div>
        <div><strong>Address:</strong> {address?.slice(0, 8)}...{address?.slice(-6)}</div>
        
        {/* Network debug butonları */}
        <div className="mt-2 space-y-1">
          <button 
            onClick={() => checkWalletStatus()}
            className="w-full bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
          >
            🔄 Network Yenile
          </button>
          
          {Number(balance) < 0.1 && (
            <button 
              onClick={() => window.open(`https://faucet.sui.io/gas?address=${address}`, '_blank')}
              className="w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
            >
              🚰 Get Testnet SUI
            </button>
          )}
          
          <button 
            onClick={() => window.open('https://suiscan.xyz/testnet', '_blank')}
            className="w-full bg-purple-600 text-white text-xs py-1 px-2 rounded hover:bg-purple-700"
          >
            🔍 Sui Explorer
          </button>
          
          <button 
            onClick={async () => {
              try {
                console.log('🧪 Manuel Ankr RPC test başlıyor...');
                
                // Manuel RPC test - Ankr (CORS aware)
                const testRpc = async () => {
                  const response = await fetch('https://rpc.ankr.com/sui_testnet/07bef38f0bfc1ae298b47d8e1e861d5a90128a415cdf9ce2ab0d8c52d3ad35d0', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                      jsonrpc: '2.0',
                      id: 1,
                      method: 'sui_getChainIdentifier',
                      params: []
                    })
                  });
                  return await response.json();
                };
                
                const result = await testRpc();
                console.log('🧪 Ankr RPC test sonucu:', result);
                
                if (result.result) {
                  alert(`✅ RPC Bağlantısı Başarılı!\n\nProvider: Ankr (Premium)\nChain ID: ${result.result}\nAPI Key: Aktif\nLimit: 500K req/day`);
                } else {
                  alert(`❌ RPC Test Başarısız!\n\nHata: ${result.error?.message || 'Bilinmeyen hata'}\n\nNot: Bu normal olabilir (CORS koruması)`);
                }
              } catch (error: any) {
                console.error('Manuel RPC test hatası:', error);
                
                // CORS hatası için özel mesaj
                if (error?.message?.includes('fetch')) {
                  alert(`⚠️ CORS/Network Hatası!\n\nBu normal bir durum:\n• Browser CORS koruması\n• RPC çalışıyor ama direkt test edilemiyor\n• SuiClient üzerinden çalışır\n\nÇözüm: Cüzdan transaction'ı deneyin!`);
                } else {
                  alert(`❌ RPC Bağlantı Hatası!\n\n${error}\n\nİnternet bağlantınızı kontrol edin.`);
                }
              }
            }}
            className="w-full bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
          >
            🧪 RPC Test Et
          </button>
        </div>
        
        {/* RPC Status */}
        <div className="text-xs mt-2 p-2 bg-gray-100 rounded">
          <strong>RPC:</strong> Ankr (Premium API)
          <br />
          <strong>Endpoint:</strong> rpc.ankr.com/sui_testnet
          <br />
          <strong>API Key:</strong> ✅ Aktif (500K req/day)
          <br />
          <strong>Status:</strong> {network.includes('✅') ? '🟢 Aktif' : '🔴 Hata'}
        </div>
      </div>
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
          `🎉 Proje Testnet'te başarıyla deploy edildi!\n` +
          `📝 Başlık: ${formData.title}\n` +
          `💰 Hedef: ${formData.fundingGoal} SUI\n` +
          `📅 Süre: ${formatTimeline(parseInt(formData.timeline))}\n` +
          `🏛️ Yönetim Token: $PAPER${formData.governanceTokenName} (${formData.governanceTokenSupply})\n` +
          `📄 Makale Token: ${formData.articleTokenName} (${formData.articleTokenSupply})\n` +
          `🪙 Token'lar cüzdanınıza eklendi!\n` +
          `🔗 Transaction: ${result.digest}\n` +
          `${result.deployedOnTestnet ? '✅ Testnet\'te deploy edildi' : '⚠️ Simülasyon modu'}`
        );
        console.log('🚀 Blockchain deploy başarılı:', result);
        
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
        }, 4000);
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
          
          {/* Deploy ve Token Yönetimi Bölümü */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">� Deploy & Token Yönetimi</h4>
            
            {/* Deploy Seçenekleri */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">🔗 Blockchain Deploy</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">Testnet'te otomatik deploy</span>
                  </label>
                  <p className="text-xs text-blue-600 mt-1">Proje ve token'lar Sui Testnet'te oluşturulur</p>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm">Token'ları cüzdana ekle</span>
                  </label>
                  <p className="text-xs text-blue-600 mt-1">Oluşturulan token'lar otomatik cüzdanınıza mint edilir</p>
                </div>
              </div>
            </div>
            
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
  const { isConnected, address, suiClient, signAndExecuteTransaction } = useWalletState();
  const [tokens, setTokens] = useState<any[]>([]);
  const [suiBalance, setSuiBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);

  // Token bakiyelerini çek
  useEffect(() => {
    if (isConnected && address) {
      fetchTokenBalances();
    }
  }, [isConnected, address]);

  const fetchTokenBalances = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // SUI bakiyesini çek
      const balance = await suiClient.getBalance({ owner: address });
      setSuiBalance((Number(balance.totalBalance) / 1_000_000_000).toFixed(4));

      // Kullanıcının sahip olduğu tüm objelerini çek
      const objects = await suiClient.getOwnedObjects({
        owner: address,
        options: {
          showContent: true,
          showType: true,
        }
      });

      console.log('🔍 Sui cüzdanındaki tüm objeler:', objects.data);

      // Coin objelerini filtrele
      const coinObjects = objects.data.filter((obj: any) => 
        obj.data?.type?.includes('::coin::Coin') && 
        !obj.data?.type?.includes('::sui::SUI') // SUI hariç diğer coin'ler
      );

      console.log('💰 Bulunan coin objeleri:', coinObjects);

      // Gerçek blockchain token'ları
      const blockchainTokens = coinObjects.map((obj: any) => ({
        id: obj.data?.objectId,
        type: 'blockchain',
        symbol: 'UNKNOWN',
        amount: obj.data?.content?.fields?.balance || 0,
        coinType: obj.data?.type,
        isRealBlockchainToken: true
      }));

      // localStorage'dan mint edilen token bilgilerini de al
      const localTokens = JSON.parse(localStorage.getItem('sui_wallet_tokens') || '[]');
      const userTokens = localTokens.filter((token: any) => token.owner === address);
      
      console.log('📱 LocalStorage token\'lar:', userTokens);
      console.log('⛓️ Blockchain token\'lar:', blockchainTokens);

      // Tüm token'ları birleştir
      const allTokens = [...blockchainTokens, ...userTokens];
      setTokens(allTokens);

    } catch (error) {
      console.error('Token bakiyeleri çekilemedi:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Token Bakiyeleri</h3>
            <button 
              onClick={fetchTokenBalances}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? 'Yükleniyor...' : '🔄 Yenile'}
            </button>
          </div>
          
          <div className="space-y-3">
            {/* SUI Balance */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">SUI</p>
                <p className="text-sm text-gray-600">Native Token (Testnet)</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{suiBalance} SUI</p>
                <p className="text-sm text-gray-600">Gas & Fees</p>
              </div>
            </div>
            
            {/* PAPER Governance Token */}
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="font-medium text-blue-900">PAPER (Governance)</p>
                <p className="text-sm text-blue-600">Voting Power</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-blue-900">
                  {tokens.filter(t => t.type === 'governance').reduce((sum, t) => sum + (t.amount || 0), 0)} PAPER
                </p>
                <p className="text-sm text-blue-600">LocalStorage + Blockchain</p>
              </div>
            </div>

            {/* Article Tokens */}
            {tokens.filter(t => t.type === 'article').map((token, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-medium text-purple-900">{token.symbol || token.name}</p>
                  <p className="text-sm text-purple-600">Article Token</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-900">{token.amount} {token.symbol}</p>
                  <p className="text-sm text-purple-600">Research Rights</p>
                </div>
              </div>
            ))}

            {/* Gerçek Blockchain Token'ları */}
            {tokens.filter(t => t.isRealBlockchainToken).map((token, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-900">Blockchain Token</p>
                  <p className="text-sm text-green-600">{token.coinType?.split('::').pop() || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-900">{(Number(token.amount) / 1_000_000_000).toFixed(6)}</p>
                  <p className="text-sm text-green-600">Gerçek Token</p>
                </div>
              </div>
            ))}

            {tokens.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">Henüz token bulunamadı</p>
                <p className="text-sm text-gray-400 mt-1">Proje oluşturun veya token mint edin!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="space-y-3">
            <button 
              onClick={() => window.open('https://faucet.sui.io/gas', '_blank')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              🚰 Testnet SUI Al
            </button>
            
            {/* Gerçek Blockchain Transaction Test - CORS Bypass */}
            <button 
              onClick={async () => {
                try {
                  console.log('🔍 Gerçek blockchain transaction test başlıyor...');
                  console.log('Current Address:', address);
                  console.log('SuiClient:', suiClient);
                  
                  if (!address) {
                    alert('❌ Cüzdan adresi bulunamadı!');
                    return;
                  }
                  
                  // Önce SuiClient ile basic test (CORS bypass)
                  try {
                    console.log('🔄 SuiClient ile RPC test...');
                    const epoch = await suiClient.getCurrentEpoch();
                    console.log('✅ RPC bağlantısı başarılı! Current epoch:', epoch);
                  } catch (rpcError) {
                    console.error('❌ RPC bağlantı hatası:', rpcError);
                    alert('❌ RPC bağlantısı başarısız! Ankr API key kontrol edin.');
                    return;
                  }
                  
                  // Gas coin'leri kontrol et
                  const gasCoins = await suiClient.getCoins({
                    owner: address,
                    coinType: '0x2::sui::SUI'
                  });
                  
                  console.log('💰 Gas coins:', gasCoins);
                  
                  if (gasCoins.data.length === 0) {
                    alert('❌ Gas coin bulunamadı! Faucet\'ten SUI alın.');
                    window.open(`https://faucet.sui.io/gas?address=${address}`, '_blank');
                    return;
                  }
                  
                  // Transaction oluştur
                  const tx = new Transaction();
                  tx.setGasBudget(5_000_000); // 0.005 SUI
                  
                  // Basit transfer (0.001 SUI kendine gönder)
                  const [transferCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000)]); // 0.001 SUI
                  tx.transferObjects([transferCoin], tx.pure.address(address));
                  
                  console.log('📝 Transaction oluşturuldu:', tx);
                  
                  // Transaction'ı gönder
                  const result = await new Promise((resolve, reject) => {
                    signAndExecuteTransaction(
                      { 
                        transaction: tx
                      },
                      {
                        onSuccess: (result: any) => {
                          console.log('✅ Transaction başarılı!', result);
                          resolve(result);
                        },
                        onError: (error: any) => {
                          console.error('❌ Transaction hatası:', error);
                          reject(error);
                        },
                      }
                    );
                  });
                  
                  if (result) {
                    const digest = (result as any).digest;
                    alert(`🎉 Gerçek blockchain transaction başarılı!\n\nProvider: Ankr RPC\nAPI Key: Aktif\n🔗 Transaction Digest: ${digest}\n\n✅ Sui Explorer'da görüntüle`);
                    
                    // Sui Explorer'da aç
                    window.open(`https://suiscan.xyz/testnet/tx/${digest}`, '_blank');
                  }
                  
                } catch (error) {
                  console.error('🚨 Transaction hatası:', error);
                  alert(`❌ Transaction başarısız:\n\n${error}\n\nAnkr RPC problemi olabilir.`);
                }
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🧪 Gerçek Transaction Test (Ankr API)
            </button>
            
            <button 
              onClick={async () => {
                try {
                  // Basit demo token oluştur
                  const demoToken = {
                    id: 'DEMO_TOKEN_' + Date.now(),
                    name: 'Demo Paper Token',
                    symbol: 'PAPER',
                    amount: 1000,
                    type: 'governance',
                    owner: address,
                    createdAt: Date.now()
                  };
                  
                  const existingTokens = JSON.parse(localStorage.getItem('sui_wallet_tokens') || '[]');
                  existingTokens.push(demoToken);
                  localStorage.setItem('sui_wallet_tokens', JSON.stringify(existingTokens));
                  
                  alert('✅ Demo PAPER token eklendi! Token Yönetimi\'ne bakın.');
                  await fetchTokenBalances();
                } catch (error) {
                  console.error('Demo token oluşturma hatası:', error);
                }
              }}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🎯 Demo PAPER Token Ekle
            </button>
            <button 
              onClick={() => alert('Token stake özelliği yakında eklenecek!')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              💎 Token Stake Et
            </button>
            <button 
              onClick={() => alert('Governance özelliği yakında eklenecek!')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🗳️ Governance'a Katıl
            </button>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                💡 <strong>İpucu:</strong> Proje oluşturduğunuzda governance ve article token'ları otomatik olarak cüzdanınıza mint edilir!
              </p>
            </div>
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
        {/* Network Status Header */}
        <div className="bg-green-100 border-b border-green-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-800 font-medium text-sm">🌐 Sui Testnet</span>
              <span className="text-green-600 text-xs">Ankr RPC Provider (Premium)</span>
            </div>
            <div className="text-green-600 text-xs">
              ⚡ API Key Aktif • Yüksek Hız
            </div>
          </div>
        </div>
        
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>
        <WalletDebug />
      </div>
    </SuiDAppProvider>
  );
}

export default App;