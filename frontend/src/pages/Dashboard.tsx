import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, TrendingUp, Users, Trophy, Search, Filter } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: number;
  paperTokens: number;
  covaxTokens: number;
  author: string;
  createdAt: string;
  dataHash: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Blockchain ile Akademik Makale Tokenizasyonu',
    status: 2, // RESEARCH
    paperTokens: 1000000,
    covaxTokens: 500000,
    author: '0x1234...5678',
    createdAt: '2025-10-20',
    dataHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  },
  {
    id: '2',
    title: 'AI Destekli Peer Review Sistemi',
    status: 1, // FUNDING
    paperTokens: 750000,
    covaxTokens: 350000,
    author: '0x8765...4321',
    createdAt: '2025-10-18',
    dataHash: 'QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy',
  },
];

const statusLabels = {
  0: { label: 'Taslak', class: 'status-draft' },
  1: { label: 'Fonlama', class: 'status-funding' },
  2: { label: 'Araştırma', class: 'status-research' },
  3: { label: 'Yayınlandı', class: 'status-published' },
};

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === null || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 2).length,
    totalPaperTokens: projects.reduce((sum, p) => sum + p.paperTokens, 0),
    totalCovaxTokens: projects.reduce((sum, p) => sum + p.covaxTokens, 0),
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Suiholar Research DAO
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Akademik araştırmaları tokenlaştırın, işbirliği yapın ve bilimsel ilerlemeyi destekleyin.
          Blockchain teknolojisi ile şeffaf ve adil bir araştırma ekosistemi oluşturun.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create-project" className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Yeni Proje Oluştur</span>
          </Link>
          <Link to="/tokens" className="btn-secondary flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Token Yönetimi</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Proje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Araştırma</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PAPER Token</p>
              <p className="text-2xl font-bold text-blue-600">
                {(stats.totalPaperTokens / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="token-badge token-badge-paper">PAPER</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">COVAX Token</p>
              <p className="text-2xl font-bold text-green-600">
                {(stats.totalCovaxTokens / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="token-badge token-badge-covax">COVAX</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Araştırma Projeleri</h2>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Durumlar</option>
              <option value="0">Taslak</option>
              <option value="1">Fonlama</option>
              <option value="2">Araştırma</option>
              <option value="3">Yayınlandı</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Proje bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== null 
                ? 'Arama kriterlerinizle eşleşen proje yok.'
                : 'Henüz proje oluşturulmamış.'}
            </p>
            <Link to="/create-project" className="btn-primary inline-flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>İlk Projenizi Oluşturun</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/project/${project.id}`}
                className="card hover:shadow-lg transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <span className={`token-badge ${statusLabels[project.status as keyof typeof statusLabels].class} ml-2 flex-shrink-0`}>
                      {statusLabels[project.status as keyof typeof statusLabels].label}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{project.author}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">PAPER: </span>
                      <span className="font-semibold text-blue-600">
                        {(project.paperTokens / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">COVAX: </span>
                      <span className="font-semibold text-green-600">
                        {(project.covaxTokens / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-3">
                    Oluşturulma: {new Date(project.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}