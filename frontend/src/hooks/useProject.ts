import { useWalletState } from '../contexts/WalletContext_dappkit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';

// Sui üzerinde proje objesi oluşturmak için hook
export function useCreateProject() {
  const { signAndExecuteTransaction, suiClient, address } = useWalletState();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (projectData: {
    title: string;
    description: string;
    fundingGoal: number;
    timeline: number;
    governanceTokenName: string;
    governanceTokenSupply: number;
    articleTokenName: string;
    articleTokenSupply: number;
  }) => {
    if (!address) {
      setError('Cüzdan bağlı değil');
      return null;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Transaction objesi oluştur
      const tx = new Transaction();

      // Şimdilik basit bir test transaction yapıyoruz
      // Gerçek Move contract deploy edildiğinde bu kısım güncellenecek
      
      // Test için basit bir transaction - kendine 0.001 SUI gönder
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1_000_000)]); // 0.001 SUI
      tx.transferObjects([coin], tx.pure.address(address));

      console.log('Test transaction oluşturuldu - Proje bilgileri:', projectData);

      // Transaction'ı gönder
      const result = await new Promise((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transaction: tx,
          },
          {
            onSuccess: (result: any) => {
              console.log('Proje başarıyla oluşturuldu:', result);
              resolve(result);
            },
            onError: (error: any) => {
              console.error('Proje oluşturma hatası:', error);
              setError('Proje oluşturulamadı: ' + error.message);
              reject(error);
            },
          }
        );
      });

      if (result) {
        // Oluşturulan obje ID'sini bul
        const createdObjects = (result as any).effects?.created || [];
        const projectObject = createdObjects.find((obj: any) => 
          obj.owner && typeof obj.owner === 'object' && 'AddressOwner' in obj.owner
        );

        console.log('Oluşturulan proje objesi:', projectObject);
        
        // Test için localStorage'a kaydet
        const projectWithId = {
          id: 'TEST_PROJECT_' + Date.now(),
          title: projectData.title,
          description: projectData.description,
          fundingGoal: projectData.fundingGoal,
          timeline: projectData.timeline,
          governanceTokenName: projectData.governanceTokenName,
          governanceTokenSupply: projectData.governanceTokenSupply,
          articleTokenName: projectData.articleTokenName,
          articleTokenSupply: projectData.articleTokenSupply,
          owner: address,
          createdAt: Date.now(),
          currentFunding: 0,
          transactionDigest: (result as any).digest
        };
        
        // Mevcut projeleri getir ve yenisini ekle
        const existingProjects = JSON.parse(localStorage.getItem('suiholar_projects') || '[]');
        existingProjects.push(projectWithId);
        localStorage.setItem('suiholar_projects', JSON.stringify(existingProjects));
        
        return {
          success: true,
          objectId: projectWithId.id,
          digest: (result as any).digest,
          effects: (result as any).effects,
          projectData: projectData // Proje verilerini de saklayalım
        };
      }

      return null;
    } catch (err: any) {
      console.error('Proje oluşturma hatası:', err);
      setError(err.message || 'Bilinmeyen hata');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createProject,
    isCreating,
    error,
    clearError: () => setError(null)
  };
}

// Mevcut projeleri çekmek için hook
export function useGetProjects() {
  const { suiClient, address } = useWalletState();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    if (!address) {
      setError('Cüzdan bağlı değil');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Kullanıcının sahip olduğu objeleri getir
      const objects = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: "0x1::research_dao::Project" // Gerçek package ID ile değiştirilecek
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      console.log('Bulunan proje objeleri:', objects);
      setProjects(objects.data || []);
    } catch (err: any) {
      console.error('Projeler çekilemedi:', err);
      setError(err.message || 'Projeler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    fetchProjects,
    isLoading,
    error
  };
}

// Proje detaylarını çekmek için hook
export function useGetProjectDetails(objectId: string) {
  const { suiClient } = useWalletState();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = async () => {
    if (!objectId) return;

    try {
      setIsLoading(true);
      setError(null);

      const objectData = await suiClient.getObject({
        id: objectId,
        options: {
          showContent: true,
          showType: true,
          showOwner: true,
        }
      });

      console.log('Proje detayları:', objectData);
      setProject(objectData);
    } catch (err: any) {
      console.error('Proje detayları çekilemedi:', err);
      setError(err.message || 'Proje detayları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    fetchProjectDetails,
    isLoading,
    error
  };
}

// Utility: SUI miktarını formatla
export function formatSUI(amount: bigint | number): string {
  const sui = typeof amount === 'bigint' ? Number(amount) : amount;
  return (sui / 1_000_000_000).toFixed(2) + ' SUI';
}

// Utility: Zaman formatla
export function formatTimeline(months: number): string {
  if (months < 12) {
    return `${months} ay`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} yıl`;
    } else {
      return `${years} yıl ${remainingMonths} ay`;
    }
  }
}