import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Wallet durumları
export type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Wallet bilgileri interface'i
export interface WalletInfo {
  address: string | null;
  publicKey: string | null;
  status: WalletStatus;
  balance?: number;
}

// Context interface'i
interface WalletContextType {
  wallet: WalletInfo;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

// Context oluştur
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet Provider bileşeni
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: null,
    publicKey: null,
    status: 'disconnected',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yenilendiğinde wallet durumunu kontrol et
  useEffect(() => {
    const savedAddress = localStorage.getItem('wallet_address');
    const savedPublicKey = localStorage.getItem('wallet_publicKey');
    const savedBalance = localStorage.getItem('wallet_balance');
    
    if (savedAddress && savedPublicKey) {
      setWallet({
        address: savedAddress,
        publicKey: savedPublicKey,
        status: 'connected',
        balance: savedBalance ? parseInt(savedBalance) : undefined,
      });
    }
  }, []);

  // Wallet bağlantısı fonksiyonu
  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setWallet(prev => ({ ...prev, status: 'connecting' }));

      // Sui Wallet kontrolü
      if (typeof window !== 'undefined' && 'suiWallet' in window) {
        const suiWallet = (window as any).suiWallet;
        
        // İzin iste
        const response = await suiWallet.requestPermissions();
        
        if (response.accounts && response.accounts.length > 0) {
          const account = response.accounts[0];
          
          const walletInfo: WalletInfo = {
            address: account.address,
            publicKey: account.publicKey,
            status: 'connected',
          };

          setWallet(walletInfo);
          
          // Local storage'a kaydet
          localStorage.setItem('wallet_address', account.address);
          localStorage.setItem('wallet_publicKey', account.publicKey);
          
          console.log('Sui Wallet bağlandı:', account.address);
        } else {
          throw new Error('Hesap bulunamadı');
        }
      } else {
        // Sui Wallet kurulu değilse, sabit mock cüzdan kullan
        console.warn('Sui Wallet bulunamadı, mock cüzdan kullanılıyor...');
        
        // Sabit mock wallet bilgileri (her zaman aynı)
        const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const mockPublicKey = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
        const mockBalance = 2500000; // 2.5M SUI

        const walletInfo: WalletInfo = {
          address: mockAddress,
          publicKey: mockPublicKey,
          status: 'connected',
          balance: mockBalance,
        };

        setWallet(walletInfo);
        
        // Local storage'a kaydet
        localStorage.setItem('wallet_address', mockAddress);
        localStorage.setItem('wallet_publicKey', mockPublicKey);
        localStorage.setItem('wallet_balance', mockBalance.toString());
        
        console.log('Mock cüzdan bağlandı:', mockAddress);
      }
    } catch (err) {
      console.error('Cüzdan bağlantı hatası:', err);
      setError(err instanceof Error ? err.message : 'Cüzdan bağlantısı başarısız');
      setWallet(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsConnecting(false);
    }
  };

  // Wallet bağlantısını kes
  const disconnect = () => {
    setWallet({
      address: null,
      publicKey: null,
      status: 'disconnected',
    });
    setError(null);
    
    // Local storage'dan temizle
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_publicKey');
    localStorage.removeItem('wallet_balance');
    
    console.log('Cüzdan bağlantısı kesildi');
  };

  const value: WalletContextType = {
    wallet,
    connect,
    disconnect,
    isConnecting,
    error,
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