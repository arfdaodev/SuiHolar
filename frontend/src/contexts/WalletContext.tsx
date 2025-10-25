import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Cüzdan durumları
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Cüzdan bilgileri interface'i
export interface WalletInfo {
  address: string | null;
  publicKey: string | null;
  status: WalletStatus;
  balance?: number;
  name?: string; // Cüzdan adı (Sui Wallet, Ethos, vb.)
}

// Context interface'i
interface WalletContextType {
  wallet: WalletInfo;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  clearError: () => void;
}

// Context oluştur
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Desteklenen cüzdan tiplerini kontrol et
const checkAvailableWallets = () => {
  const wallets = {
    suiWallet: typeof window !== 'undefined' && 'suiWallet' in window,
    ethos: typeof window !== 'undefined' && 'ethos' in window,
  };
  
  console.log('Mevcut cüzdanlar:', wallets);
  return wallets;
};

// Mock cüzdan bilgileri (test için sabit)
const MOCK_WALLET = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  publicKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  balance: 2500000, // 2.5M SUI
  name: 'Test Wallet (Mock)'
};

// Wallet Provider bileşeni
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: null,
    publicKey: null,
    status: 'disconnected',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hata temizleme fonksiyonu
  const clearError = () => setError(null);

  // Sayfa yenilendiğinde wallet durumunu kontrol et
  useEffect(() => {
    const savedWallet = localStorage.getItem('suiholar_wallet');
    
    if (savedWallet) {
      try {
        const parsed = JSON.parse(savedWallet);
        if (parsed.address && parsed.publicKey) {
          setWallet({
            address: parsed.address,
            publicKey: parsed.publicKey,
            status: 'connected',
            balance: parsed.balance,
            name: parsed.name,
          });
          console.log('Kaydedilmiş cüzdan yüklendi:', parsed.address);
        }
      } catch (err) {
        console.error('Kaydedilmiş cüzdan bilgisi bozuk:', err);
        localStorage.removeItem('suiholar_wallet');
      }
    }
  }, []);

  // Cüzdan bağlantısı fonksiyonu
  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setWallet(prev => ({ ...prev, status: 'connecting' }));

      const availableWallets = checkAvailableWallets();

      // Sui Wallet kontrolü (öncelik)
      if (availableWallets.suiWallet) {
        console.log('Sui Wallet bulundu, bağlanılıyor...');
        
        const suiWallet = (window as any).suiWallet;
        
        try {
          // İzin iste
          const response = await suiWallet.requestPermissions();
          
          if (response.accounts && response.accounts.length > 0) {
            const account = response.accounts[0];
            
            const walletInfo: WalletInfo = {
              address: account.address,
              publicKey: account.publicKey,
              status: 'connected',
              name: 'Sui Wallet'
            };

            setWallet(walletInfo);
            
            // Local storage'a kaydet
            localStorage.setItem('suiholar_wallet', JSON.stringify(walletInfo));
            
            console.log('Sui Wallet başarıyla bağlandı:', account.address);
            return;
          } else {
            throw new Error('Sui Wallet hesabı bulunamadı');
          }
        } catch (suiError) {
          console.error('Sui Wallet bağlantı hatası:', suiError);
          throw new Error('Sui Wallet bağlantısı reddedildi veya başarısız oldu');
        }
      }
      
      // Ethos Wallet kontrolü
      else if (availableWallets.ethos) {
        console.log('Ethos Wallet bulundu, bağlanılıyor...');
        
        // Ethos wallet entegrasyonu henüz hazır değil
        throw new Error('Ethos Wallet entegrasyonu yakında eklenecek');
      }
      
      // Hiçbir cüzdan bulunamadığında mock kullan
      else {
        console.warn('Gerçek cüzdan bulunamadı, test modunda mock cüzdan kullanılıyor');
        
        // 2 saniye bekleme simülasyonu (gerçek cüzdan deneyimi için)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const walletInfo: WalletInfo = {
          address: MOCK_WALLET.address,
          publicKey: MOCK_WALLET.publicKey,
          status: 'connected',
          balance: MOCK_WALLET.balance,
          name: MOCK_WALLET.name
        };

        setWallet(walletInfo);
        
        // Local storage'a kaydet
        localStorage.setItem('suiholar_wallet', JSON.stringify(walletInfo));
        
        console.log('Mock cüzdan bağlandı:', MOCK_WALLET.address);
      }
      
    } catch (err) {
      console.error('Cüzdan bağlantı hatası:', err);
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen cüzdan hatası';
      setError(errorMessage);
      setWallet(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsConnecting(false);
    }
  };

  // Cüzdan bağlantısını kes
  const disconnect = () => {
    setWallet({
      address: null,
      publicKey: null,
      status: 'disconnected',
    });
    setError(null);
    
    // Local storage'dan temizle
    localStorage.removeItem('suiholar_wallet');
    
    console.log('Cüzdan bağlantısı kesildi');
  };

  const value: WalletContextType = {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
    clearError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Wallet hook'u
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Utility fonksiyonlar
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(balance: number): string {
  return (balance / 1000000).toFixed(2) + 'M SUI';
}

// Cüzdan durumu kontrol fonksiyonu
export function getWalletStatus(): string {
  const wallets = checkAvailableWallets();
  
  if (wallets.suiWallet) {
    return 'Sui Wallet tespit edildi';
  } else if (wallets.ethos) {
    return 'Ethos Wallet tespit edildi';
  } else {
    return 'Cüzdan tespit edilmedi (Test modu aktif)';
  }
}