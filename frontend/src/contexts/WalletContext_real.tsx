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
  name?: string;
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

// Sui Wallet interface tanımları
interface SuiWallet {
  requestPermissions: () => Promise<{
    accounts: Array<{
      address: string;
      publicKey: string;
    }>;
  }>;
  hasPermissions: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

// Global window interface'ini genişlet
declare global {
  interface Window {
    suiWallet?: SuiWallet;
  }
}

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

  // Sayfa yüklendiğinde mevcut bağlantıyı kontrol et
  useEffect(() => {
    checkExistingConnection();
  }, []);

  // Mevcut bağlantıyı kontrol et
  const checkExistingConnection = async () => {
    try {
      if (window.suiWallet) {
        console.log('Sui Wallet tespit edildi, mevcut bağlantı kontrol ediliyor...');
        
        const hasPermissions = await window.suiWallet.hasPermissions();
        if (hasPermissions) {
          const response = await window.suiWallet.requestPermissions();
          if (response.accounts && response.accounts.length > 0) {
            const account = response.accounts[0];
            
            setWallet({
              address: account.address,
              publicKey: account.publicKey,
              status: 'connected',
              name: 'Sui Wallet'
            });
            
            console.log('Mevcut Sui Wallet bağlantısı restore edildi:', account.address);
          }
        }
      } else {
        console.log('Sui Wallet bulunamadı');
      }
    } catch (err) {
      console.log('Mevcut bağlantı kontrol edilemedi:', err);
    }
  };

  // Cüzdan bağlantısı fonksiyonu
  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      setWallet(prev => ({ ...prev, status: 'connecting' }));

      // Sui Wallet kontrolü
      if (window.suiWallet) {
        console.log('Sui Wallet ile bağlantı kuruluyor...');
        
        try {
          // Kullanıcıdan izin iste
          const response = await window.suiWallet.requestPermissions();
          
          if (response.accounts && response.accounts.length > 0) {
            const account = response.accounts[0];
            
            const walletInfo: WalletInfo = {
              address: account.address,
              publicKey: account.publicKey,
              status: 'connected',
              name: 'Sui Wallet'
            };

            setWallet(walletInfo);
            
            console.log('Sui Wallet başarıyla bağlandı:', account.address);
            console.log('Hesap bilgileri:', account);
            
          } else {
            throw new Error('Sui Wallet hesabı bulunamadı');
          }
        } catch (suiError: any) {
          console.error('Sui Wallet bağlantı hatası:', suiError);
          
          if (suiError.code === 4001) {
            throw new Error('Kullanıcı cüzdan bağlantısını reddetti');
          } else if (suiError.message?.includes('User rejected')) {
            throw new Error('Kullanıcı cüzdan bağlantısını reddetti');
          } else {
            throw new Error('Sui Wallet bağlantı hatası: ' + suiError.message);
          }
        }
      } else {
        // Sui Wallet kurulu değilse kullanıcıyı bilgilendir
        setError('Sui Wallet bulunamadı. Lütfen Sui Wallet browser extension\'ını kurun.');
        setWallet(prev => ({ ...prev, status: 'error' }));
        
        // Sui Wallet indirme bağlantısı için console log
        console.log('Sui Wallet indirmek için: https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil');
      }
      
    } catch (err: any) {
      console.error('Cüzdan bağlantı hatası:', err);
      const errorMessage = err.message || 'Bilinmeyen cüzdan hatası';
      setError(errorMessage);
      setWallet(prev => ({ ...prev, status: 'error' }));
    } finally {
      setIsConnecting(false);
    }
  };

  // Cüzdan bağlantısını kes
  const disconnect = async () => {
    try {
      if (window.suiWallet) {
        await window.suiWallet.disconnect();
      }
    } catch (err) {
      console.error('Disconnect hatası:', err);
    }
    
    setWallet({
      address: null,
      publicKey: null,
      status: 'disconnected',
    });
    setError(null);
    
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
  if (typeof window !== 'undefined' && window.suiWallet) {
    return 'Sui Wallet tespit edildi - Bağlanmaya hazır';
  } else {
    return 'Sui Wallet bulunamadı - Lütfen Sui Wallet kurun';
  }
}