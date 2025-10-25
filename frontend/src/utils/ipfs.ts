import { create } from 'kubo-rpc-client';

// IPFS konfigürasyonu
const IPFS_CONFIG = {
  // Public IPFS gateways - production için kendi node'unuzu kullanın
  gateways: [
    'https://ipfs.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/'
  ],
  // Web browser için HTTPs IPFS API endpoints
  endpoints: [
    { host: 'ipfs.infura.io', port: 5001, protocol: 'https' },
    { host: '127.0.0.1', port: 5001, protocol: 'http' } // Local node varsa
  ]
};

// IPFS client singleton
let ipfsClient: any = null;

// IPFS client'ı başlat
export async function initializeIPFS() {
  if (ipfsClient) return ipfsClient;
  
  try {
    // İlk olarak Infura IPFS API'yi dene
    ipfsClient = create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        // Infura API key gerekiyorsa burada ekleyebilirsiniz
        // authorization: 'Basic ' + btoa('projectId:projectSecret')
      }
    });
    
    console.log('✅ IPFS client başlatıldı (Infura)');
    return ipfsClient;
  } catch (error) {
    console.warn('⚠️ Infura IPFS bağlantısı başarısız, local node deneniyor...', error);
    
    try {
      // Local IPFS node'u dene
      ipfsClient = create({
        host: '127.0.0.1',
        port: 5001,
        protocol: 'http'
      });
      
      console.log('✅ IPFS client başlatıldı (Local)');
      return ipfsClient;
    } catch (localError) {
      console.error('❌ IPFS bağlantısı kurulamadı:', localError);
      throw new Error('IPFS bağlantısı kurulamadı. Lütfen IPFS node\'unuzun çalıştığından emin olun.');
    }
  }
}

// Dosyayı IPFS'e yükle
export async function uploadToIPFS(file: File): Promise<{
  hash: string;
  size: number;
  gateway: string;
}> {
  try {
    console.log('📁 IPFS\'e dosya yükleniyor:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    const client = await initializeIPFS();
    
    // Dosyayı buffer'a çevir
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // IPFS'e upload et
    const result = await client.add({
      path: file.name,
      content: uint8Array
    }, {
      pin: true, // Dosyayı pin'le (kalıcı olarak sakla)
      progress: (bytes: number) => {
        console.log('📤 Upload progress:', Math.round((bytes / file.size) * 100) + '%');
      }
    });
    
    console.log('✅ IPFS upload başarılı:', result);
    
    return {
      hash: result.cid.toString(),
      size: result.size,
      gateway: IPFS_CONFIG.gateways[0] + result.cid.toString()
    };
  } catch (error) {
    console.error('❌ IPFS upload hatası:', error);
    throw new Error(`IPFS upload başarısız: ${error}`);
  }
}

// Metin/JSON content'i IPFS'e yükle
export async function uploadTextToIPFS(content: string, filename?: string): Promise<{
  hash: string;
  size: number;
  gateway: string;
}> {
  try {
    const client = await initializeIPFS();
    
    const result = await client.add({
      path: filename || 'content.txt',
      content: new TextEncoder().encode(content)
    }, {
      pin: true
    });
    
    console.log('✅ IPFS text upload başarılı:', result);
    
    return {
      hash: result.cid.toString(),
      size: result.size,
      gateway: IPFS_CONFIG.gateways[0] + result.cid.toString()
    };
  } catch (error) {
    console.error('❌ IPFS text upload hatası:', error);
    throw new Error(`IPFS text upload başarısız: ${error}`);
  }
}

// IPFS'ten dosya indir/oku
export async function downloadFromIPFS(hash: string): Promise<Uint8Array> {
  try {
    const client = await initializeIPFS();
    
    const chunks: Uint8Array[] = [];
    for await (const chunk of client.cat(hash)) {
      chunks.push(chunk);
    }
    
    // Chunk'ları birleştir
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    console.log('✅ IPFS download başarılı:', hash);
    return result;
  } catch (error) {
    console.error('❌ IPFS download hatası:', error);
    throw new Error(`IPFS download başarısız: ${error}`);
  }
}

// IPFS hash'ini URL'e çevir
export function getIPFSUrl(hash: string, gatewayIndex: number = 0): string {
  const gateway = IPFS_CONFIG.gateways[gatewayIndex] || IPFS_CONFIG.gateways[0];
  return gateway + hash;
}

// Dosya tipini kontrol et
export function validateFileForIPFS(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Maksimum dosya boyutu: 100MB
  const MAX_SIZE = 100 * 1024 * 1024;
  
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'Dosya boyutu 100MB\'dan büyük olamaz'
    };
  }
  
  // İzin verilen dosya tipleri
  const allowedTypes = [
    // Dokümanlar
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    // Resimler
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Arşiv
    'application/zip',
    'application/json'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Desteklenmeyen dosya tipi. PDF, Word, Text, Markdown, Resim veya ZIP dosyası yükleyiniz.'
    };
  }
  
  return { isValid: true };
}

// Makale metadata'sını oluştur
export interface ArticleMetadata {
  title: string;
  description: string;
  author: string;
  projectId: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: number;
  requiredTokens: {
    governance: string; // Token name
    minimum: number;    // Minimum token amount
  };
}

// Makale metadata'sını IPFS'e yükle
export async function uploadArticleMetadata(metadata: ArticleMetadata): Promise<{
  hash: string;
  gateway: string;
}> {
  try {
    const result = await uploadTextToIPFS(
      JSON.stringify(metadata, null, 2),
      `article-${metadata.projectId}-metadata.json`
    );
    
    console.log('✅ Article metadata IPFS\'e yüklendi:', result);
    return result;
  } catch (error) {
    console.error('❌ Article metadata upload hatası:', error);
    throw error;
  }
}