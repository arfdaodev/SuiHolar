import { useState } from 'react';
import axios from 'axios';
import { useSignMessage } from '@mysten/dapp-kit';
import { importKey, decryptArrayBuffer } from '../utils/crypto';

// --- Placeholder Types & Constants ---

// This represents the structure of your Project object on the frontend
export interface Project {
  id: string; // Sui object ID
  walrus_blob_id: string;
  seal_policy_id: string;
  // ... other project fields
}

const SEAL_API_ENDPOINT = 'https://api.sealprotocol.xyz/v1'; // Base URL for Seal API
const WALRUS_GATEWAY = 'https://gateway.walrus.xyz/blobs'; // Base URL for Walrus Gateway

// --- Custom Hook Implementation ---

export const useAccessArticle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { mutate: signMessage } = useSignMessage();

  const handleAccessArticle = async (project: Project, userJwt: string) => {
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      // 1. Define a message for the user to sign to prove ownership and intent
      const messageToSign = `I am requesting access to the research article for project ${project.id}. This does not cost any gas.`;
      const messageBytes = new TextEncoder().encode(messageToSign);

      // 2. Request signature from the user's wallet
      const signature = await new Promise<string>((resolve, reject) => {
        signMessage(
          { message: messageBytes },
          {
            onSuccess: (result) => resolve(result.signature),
            onError: (err) => reject(new Error('User rejected the signature request.')),
          }
        );
      });

      // 3. Request the decryption key from Seal Protocol
      console.log('Requesting key from Seal Protocol...');
      const keyResponse = await axios.post(
        `${SEAL_API_ENDPOINT}/request-key`,
        {
          policyId: project.seal_policy_id,
          signature: signature, // Send the signature for on-chain verification
          message: messageToSign, // Send the original message for verification
        },
        {
          headers: { Authorization: `Bearer ${userJwt}` },
        }
      );

      const { key: keyHex, iv: ivHex } = keyResponse.data;
      if (!keyHex || !ivHex) {
        throw new Error('Invalid key/IV received from Seal Protocol.');
      }

      // 4. Import the AES key
      const keyData = Buffer.from(keyHex, 'hex');
      const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
      const aesKey = await importKey(keyData);

      // 5. Fetch the encrypted article from Walrus
      console.log('Fetching encrypted article from Walrus...');
      const walrusResponse = await axios.get(`${WALRUS_GATEWAY}/${project.walrus_blob_id}`, {
        responseType: 'arraybuffer',
      });
      const encryptedArticleData = walrusResponse.data;

      // 6. Decrypt the article
      console.log('Decrypting article...');
      const decryptedArticleBuffer = await decryptArrayBuffer(encryptedArticleData, aesKey, iv);

      // 7. Create a viewable URL for the decrypted PDF
      const pdfBlob = new Blob([decryptedArticleBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(objectUrl);

      console.log('Article successfully decrypted and is ready for viewing.');
      return { success: true, url: objectUrl };

    } catch (err: any) {
      console.error('An error occurred while accessing the article:', err);
      if (err.response && err.response.status === 403) {
        // Handle specific rule failure from Seal API
        const specificError = 'Access Denied: A minimum funding of 10% is required to view the article.';
        setError(specificError);
        return { success: false, error: specificError };
      } else {
        const generalError = err.message || 'An unknown error occurred.';
        setError(generalError);
        return { success: false, error: generalError };
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to revoke the object URL to free up memory
  const cleanupPdfUrl = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return { handleAccessArticle, isLoading, error, pdfUrl, cleanupPdfUrl };
};