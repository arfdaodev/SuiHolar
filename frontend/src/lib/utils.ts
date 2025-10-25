import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTokenAmount(amount: number, decimals: number = 6): string {
  return (amount / Math.pow(10, decimals)).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function shortenAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Az önce';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  
  return past.toLocaleDateString('tr-TR');
}

export function validateSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function getStatusColor(status: number): string {
  switch (status) {
    case 0: return 'gray';
    case 1: return 'yellow';
    case 2: return 'blue';
    case 3: return 'green';
    default: return 'gray';
  }
}

export function getStatusLabel(status: number): string {
  switch (status) {
    case 0: return 'Taslak';
    case 1: return 'Fonlama';
    case 2: return 'Araştırma';
    case 3: return 'Yayınlandı';
    default: return 'Bilinmiyor';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateMockHash(): string {
  return 'Qm' + Array.from({ length: 44 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('').substring(0, 44);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}