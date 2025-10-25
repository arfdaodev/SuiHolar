import React from 'react';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Sui network URLs
const networkUrls = {
  localnet: getFullnodeUrl('localnet'),
  devnet: getFullnodeUrl('devnet'),
  testnet: getFullnodeUrl('testnet'),
  mainnet: getFullnodeUrl('mainnet'),
};

// Query client
const queryClient = new QueryClient();

// Suiholar proje konfigürasyonu
export const SUIHOLAR_CONFIG = {
  PACKAGE_ID: import.meta.env.VITE_PACKAGE_ID || '0x0', // Move package ID
  MODULE_NAME: 'research_project',
  NETWORK: (import.meta.env.VITE_NETWORK as keyof typeof networkUrls) || 'devnet',
  
  // Token sembolleri
  PAPER_TOKEN: 'PAPER',
  COVAX_TOKEN: 'COVAX',
  
  // Proje durumları
  PROJECT_STATUS: {
    DRAFT: 0,
    FUNDING: 1,
    RESEARCH: 2,
    PUBLISHED: 3,
  } as const,
  
  // IPFS konfigürasyonu
  IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
  PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || '',
  PINATA_SECRET_KEY: import.meta.env.VITE_PINATA_SECRET_KEY || '',
};

// Sui client
export const suiClient = new SuiClient({ url: networkUrls[SUIHOLAR_CONFIG.NETWORK] });

// Basit provider wrapper bileşeni
export function SuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { networkUrls, queryClient };