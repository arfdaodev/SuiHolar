import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Hash, DollarSign, Users, ArrowLeft } from 'lucide-react';

interface ProjectFormData {
  title: string;
  description: string;
  paperInitialSupply: number;
  covaxInitialSupply: number;
  file: File | null;
}

export function CreateProject() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    paperInitialSupply: 1000000,
    covaxInitialSupply: 500000,
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simüle edilmiş IPFS upload
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // TODO: Gerçek Sui blockchain entegrasyonu
      console.log('Proje oluşturuluyor:', formData);
      
      // Başarılı olduğunda dashboard'a yönlendir
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yeni Araştırma Projesi</h1>
          <p className="text-gray-600 mt-1">
            Akademik araştırmanızı tokenlaştırın ve toplulukla paylaşın
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Proje Bilgileri
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Proje Başlığı *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Blockchain ile Akademik Makale Tokenizasyonu"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Projenizin detaylı açıklamasını yazın..."
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Upload className="h-5 w-5 mr-2 text-green-600" />
            Dosya Yükleme
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Araştırma dosyanızı yükleyin
            </h3>
            <p className="text-gray-600 mb-4">
              PDF, DOC, DOCX formatlarında dosyalar desteklenir (Maks. 10MB)
            </p>
            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Dosya Seç
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            {formData.file && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{formData.file.name}</p>
                <p className="text-green-600 text-sm">
                  {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Token Configuration */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-purple-600" />
            Token Konfigürasyonu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="paperSupply" className="block text-sm font-medium text-gray-700 mb-2">
                PAPER Token Arzı *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="paperSupply"
                  required
                  min="1"
                  value={formData.paperInitialSupply}
                  onChange={(e) => setFormData(prev => ({ ...prev, paperInitialSupply: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="token-badge token-badge-paper">PAPER</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">IP sahipliği için ana token</p>
            </div>

            <div>
              <label htmlFor="covaxSupply" className="block text-sm font-medium text-gray-700 mb-2">
                COVAX Token Arzı *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="covaxSupply"
                  required
                  min="1"
                  value={formData.covaxInitialSupply}
                  onChange={(e) => setFormData(prev => ({ ...prev, covaxInitialSupply: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="token-badge token-badge-covax">COVAX</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">Fonlama için özel token</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Hash className="h-5 w-5 mr-2 text-blue-600" />
            Özet
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-white rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">Proje</p>
              <p className="text-gray-600">{formData.title || 'Başlık girilmedi'}</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">PAPER Tokens</p>
              <p className="text-blue-600 font-semibold">
                {formData.paperInitialSupply.toLocaleString()}
              </p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium text-gray-900">COVAX Tokens</p>
              <p className="text-green-600 font-semibold">
                {formData.covaxInitialSupply.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn-primary px-8"
            disabled={isSubmitting || !formData.title || !formData.description}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="spinner"></div>
                <span>Oluşturuluyor... ({uploadProgress}%)</span>
              </div>
            ) : (
              'Proje Oluştur'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}