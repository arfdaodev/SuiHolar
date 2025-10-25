import type { ReactNode } from 'react';
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  WalletProvider,
  createNetworkConfig,
  SuiClientProvider,
  useCurrentWallet,
  useConnectWallet,
  useDisconnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Network konfigürasyonu
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

// Query client
const queryClient = new QueryClient();

// Ana provider bileşeni
export function SuiDAppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

// Wallet durumu için özel hook
export function useWalletState() {
  const currentAccount = useCurrentAccount();
  const currentWallet = useCurrentWallet();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  return {
    // Hesap bilgileri
    account: currentAccount,
    wallet: currentWallet,
    address: currentAccount?.address || null,
    publicKey: currentAccount?.publicKey || null,
    
    // Durum kontrolleri
    isConnected: !!currentAccount,
    walletName: currentWallet.currentWallet?.name || null,
    
    // Fonksiyonlar
    connect,
    disconnect,
    
    // Mevcut cüzdanlar
    availableWallets: wallets,
    
    // Sui client
    suiClient,
    signAndExecuteTransaction,
  };
}

// Adres kısaltma utility'si
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Özel Wallet Button bileşeni
export function CustomWalletButton() {
  const { account, wallet, connect, disconnect, availableWallets } = useWalletState();

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {shortenAddress(account.address)}
          </div>
          <div className="text-xs text-blue-600">
            {wallet.currentWallet?.name || 'Unknown Wallet'}
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
        >
          Bağlantıyı Kes
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Cüzdan seçim menüsü */}
      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">
          Mevcut Cüzdanlar ({availableWallets.length} adet):
        </div>
        {availableWallets.map((wallet) => (
          <button
            key={wallet.name}
            onClick={() => {
              console.log(`${wallet.name} cüzdanına bağlanılıyor...`);
              connect({ wallet });
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 mb-2"
          >
            {wallet.icon && (
              <img 
                src={wallet.icon} 
                alt={wallet.name}
                className="w-5 h-5"
              />
            )}
            <span>{wallet.name} ile Bağlan</span>
          </button>
        ))}
        
        {availableWallets.length === 0 && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            Hiç cüzdan bulunamadı. Lütfen Sui destekli bir cüzdan (Sui Wallet, Phantom, vb.) kurun.
          </div>
        )}
      </div>
    </div>
  );
}

// Varsayılan Connect Button'u export edelim
export { ConnectButton };