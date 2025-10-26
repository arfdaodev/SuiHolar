// /frontend/src/utils/crypto.ts

/**
 * Converts an ArrayBuffer to a Base64 string.
 * This requires Buffer, which is available in Node.js and polyfilled by modern bundlers.
 * @param buffer The ArrayBuffer to convert.
 * @returns The Base64 encoded string.
 */
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString('base64');
};

/**
 * Generates a new AES-256 GCM cryptographic key.
 * This key can be used for symmetric encryption and decryption.
 * @returns A Promise that resolves to a CryptoKey.
 */
export const generateAesKey = async (): Promise<CryptoKey> => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // Allow the key to be extractable for sharing/storing
    ['encrypt', 'decrypt']
  );
  return key;
};

/**
 * Encrypts a file using AES-GCM and exports the raw key as a Base64 string.
 * @param file The File object to encrypt.
 * @param key The CryptoKey to use for encryption.
 * @returns A Promise resolving to an object with the encrypted buffer, iv, and the Base64-encoded raw key.
 */
export const encryptFile = async (
  file: File,
  key: CryptoKey
): Promise<{ buffer: ArrayBuffer; iv: Uint8Array; rawKey: string }> => {
  const fileBuffer = await file.arrayBuffer();
  
  // An IV should be unique for each encryption with the same key.
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bits is recommended for GCM.

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    fileBuffer
  );

  // Export the raw key to be stored or sent to an API.
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  const rawKey = bufferToBase64(exportedKey);

  return { buffer: encryptedBuffer, iv: iv, rawKey: rawKey };
};

/**
 * Decrypts an ArrayBuffer using AES-GCM.
 * @param encryptedData The ArrayBuffer of the encrypted data.
 * @param key The CryptoKey to use for decryption.
 * @param iv The initialization vector used during encryption.
 * @returns A Promise that resolves to the decrypted ArrayBuffer.
 */
export const decryptArrayBuffer = async (
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> => {
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );

  return decryptedBuffer;
};

/**
 * Imports a raw AES-GCM key from a Base64 string into a CryptoKey object.
 * @param base64Key The raw key data as a Base64 string.
 * @returns A Promise that resolves to a CryptoKey suitable for decryption.
 */
export const importKeyFromBase64 = async (base64Key: string): Promise<CryptoKey> => {
    const keyData = Buffer.from(base64Key, 'base64');
    const key = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true, // The key must be importable
        ['decrypt'] // Scope the imported key to only decryption for security
    );
    return key;
}