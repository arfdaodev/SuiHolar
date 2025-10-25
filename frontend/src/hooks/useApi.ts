import { useState, useEffect } from 'react';

// Mock data types
export interface Project {
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

export interface TokenBalance {
  symbol: string;
  balance: number;
  usdValue: number;
  type: 'paper' | 'covax';
}

// Mock API responses
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Blockchain ile Akademik Makale Tokenizasyonu',
    description: 'Bu araştırma, blockchain teknolojisinin akademik yayıncılıkta nasıl kullanılabileceğini incelemektedir.',
    status: 2,
    paperTokens: 1000000,
    covaxTokens: 500000,
    author: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2025-10-20T10:30:00Z',
    dataHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
  },
  {
    id: '2',
    title: 'AI Destekli Peer Review Sistemi',
    description: 'Yapay zeka kullanarak akademik makale değerlendirme süreçlerini geliştiren sistem.',
    status: 1,
    paperTokens: 750000,
    covaxTokens: 350000,
    author: '0x8765432109876543210987654321098765432109',
    createdAt: '2025-10-18T14:15:00Z',
    dataHash: 'QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYy',
  },
];

const mockBalances: TokenBalance[] = [
  { symbol: 'PAPER', balance: 1000000, usdValue: 15000, type: 'paper' },
  { symbol: 'COVAX', balance: 500000, usdValue: 7500, type: 'covax' },
];

// Custom hooks
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProjects(mockProjects);
      } catch (err) {
        setError('Projeler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProject: Project = {
        ...projectData,
        id: (Date.now()).toString(),
        createdAt: new Date().toISOString(),
      };
      
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError('Proje oluşturulurken hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    refetch: () => {
      setProjects(mockProjects);
    }
  };
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundProject = mockProjects.find(p => p.id === id);
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Proje bulunamadı');
        }
      } catch (err) {
        setError('Proje yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  return { project, loading, error };
}

export function useTokens() {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setBalances(mockBalances);
      } catch (err) {
        setError('Token bakiyeleri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, []);

  const transferToken = async (tokenSymbol: string, amount: number, recipient: string) => {
    try {
      setLoading(true);
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update balance
      setBalances(prev => prev.map(balance => 
        balance.symbol === tokenSymbol 
          ? { ...balance, balance: balance.balance - amount }
          : balance
      ));
      
      return { success: true, txHash: '0x' + Math.random().toString(16).substr(2, 64) };
    } catch (err) {
      setError('Transfer işlemi başarısız oldu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    balances,
    loading,
    error,
    transferToken,
    refetch: () => {
      setBalances(mockBalances);
    }
  };
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock wallet connection
      const mockAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      setAddress(mockAddress);
      setIsConnected(true);
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return {
    isConnected,
    address,
    loading,
    connect,
    disconnect,
  };
}