import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Hash, FileText, TrendingUp, Users, ExternalLink } from 'lucide-react';

interface ProjectData {
  id: string;
  title: string;
  description: string;
  status: number;
  paperTokens: number;
  covaxTokens: number;
  author: string;
  createdAt: string;
  dataHash: string;
}

const mockProject: ProjectData = {
  id: '1',
  title: 'Blockchain ile Akademik Makale Tokenizasyonu',
  description: 'Bu araştırma, blockchain teknolojisinin akademik yayıncılıkta nasıl kullanılabileceğini ve geleneksel peer-review süreçlerini nasıl geliştirebileceğini incelemektedir.',
  status: 2,
  paperTokens: 1000000,
  covaxTokens: 500000,
  author: '0x1234...5678',
  createdAt: '2025-10-20',
  dataHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
};

const statusLabels = {
  0: { label: 'Taslak', class: 'status-draft' },
  1: { label: 'Fonlama', class: 'status-funding' },
  2: { label: 'Araştırma', class: 'status-research' },
  3: { label: 'Yayınlandı', class: 'status-published' },
};

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock veri yükleme
    setTimeout(() => {
      setProject(mockProject);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Proje bulunamadı</h2>
        <p className="text-gray-600 mb-6">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <span className={`token-badge ${statusLabels[project.status as keyof typeof statusLabels].class}`}>
              {statusLabels[project.status as keyof typeof statusLabels].label}
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{project.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(project.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hash className="h-4 w-4" />
              <span className="font-mono text-xs">{project.dataHash.slice(0, 16)}...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Proje Açıklaması</h2>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>

          {/* Research Data */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Araştırma Verileri
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">IPFS Hash</h3>
                  <p className="text-sm text-gray-600 font-mono">{project.dataHash}</p>
                </div>
                <a
                  href={`https://ipfs.io/ipfs/${project.dataHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Görüntüle</span>
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Dosya Boyutu</h4>
                  <p className="text-blue-700">2.4 MB</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">Son Güncelleme</h4>
                  <p className="text-green-700">{new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İşlemler</h2>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Token Transfer Et</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Proje Güncelle</span>
              </button>
              <button className="btn-accent flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>İşbirlikçi Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Bilgileri</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="token-badge token-badge-paper">PAPER</span>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {(project.paperTokens / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-blue-600">IP Sahipliği Token'ı</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="token-badge token-badge-covax">COVAX</span>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {(project.covaxTokens / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-green-600">Fonlama Token'ı</p>
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Toplam Görüntülenme</span>
                <span className="font-semibold">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">İşbirlikçi Sayısı</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Citation Score</span>
                <span className="font-semibold">8.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aktiflik Durumu</span>
                <span className="text-green-600 font-semibold">Aktif</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Proje oluşturuldu</p>
                  <p className="text-xs text-gray-500">2 gün önce</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Token basıldı</p>
                  <p className="text-xs text-gray-500">2 gün önce</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">IPFS'e yüklendi</p>
                  <p className="text-xs text-gray-500">2 gün önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}