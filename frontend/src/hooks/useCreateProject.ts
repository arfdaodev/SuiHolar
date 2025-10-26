import { useState } from 'react';
import axios from 'axios';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { generateAesKey, encryptFile, exportKey } from '../utils/crypto';

// --- Placeholder Types & Constants ---

// Assume this type definition exists based on your project's needs
export interface ProjectData {
  name: string;
  description: string;
  // Add other project metadata fields here
}

// These should be defined in your config files or environment variables
const SUI_CONTRACT_PACKAGE_ID = '0x976482acdf9634d27b3a9ef1a37801dd4c094a8b3d2157487064abec88b9f79e'; // IMPORTANT: Replace with your actual Sui Contract Package ID
const SEAL_API_ENDPOINT = 'https://api.sealprotocol.xyz/v1/policies'; // Example endpoint

// --- Custom Hook Implementation ---

export const useCreateProject = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();

  const handleCreateProject = async (pdfFile: File, projectData: ProjectData) => {
    setIsCreating(true);
    setError(null);

    try {
      // 1. Generate AES Key for encryption
      console.log('Generating AES key...');
      const aesKey = await generateAesKey();

      // 2. Encrypt the PDF file using the generated key
      console.log('Encrypting file...');
      const { buffer: encryptedBuffer, iv } = await encryptFile(pdfFile, aesKey);

      // 3. Upload the encrypted file to Walrus via our Next.js API route
      console.log('Uploading encrypted file to Walrus...');
      const fileBlob = new Blob([encryptedBuffer], { type: 'application/octet-stream' });
      const walrusFormData = new FormData();
      walrusFormData.append('file', fileBlob, `${pdfFile.name}.enc`);

      const walrusResponse = await axios.post('/api/upload-walrus', walrusFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const walrusBlobId = walrusResponse.data.blobId;
      if (!walrusBlobId) {
        throw new Error('Failed to get blobId from Walrus upload response.');
      }
      console.log(`Successfully uploaded to Walrus. Blob ID: ${walrusBlobId}`);

      // 4. Create an access control policy on Seal Protocol
      console.log('Creating Seal Protocol policy...');
      const exportedKey = await exportKey(aesKey);
      
      // Convert key and IV to hex strings for the JSON payload
      const keyAsHex = Buffer.from(exportedKey).toString('hex');
      const ivAsHex = Buffer.from(iv).toString('hex');

      const sealPayload = {
        key: keyAsHex,
        iv: ivAsHex,
        access_control: {
          sui: {
            package_id: SUI_CONTRACT_PACKAGE_ID,
            function: 'is_authorized_investor', // The function on your contract that checks for access
          },
        },
      };

      const sealResponse = await axios.post(SEAL_API_ENDPOINT, sealPayload, {
        headers: {
          // IMPORTANT: Use a server-side proxy or secrets manager for API keys in production
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SEAL_API_KEY}`,
        },
      });
      const policyId = sealResponse.data.policyId;
      if (!policyId) {
        throw new Error('Failed to get policyId from Seal Protocol response.');
      }
      console.log(`Successfully created Seal policy. Policy ID: ${policyId}`);

      // 5. Create and execute the Sui transaction to store the project on-chain
      console.log('Creating Sui transaction...');
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${SUI_CONTRACT_PACKAGE_ID}::research_dao::create_research_project`,
        arguments: [
          txb.pure.string(projectData.name),
          txb.pure.string(projectData.description),
          txb.pure.string(walrusBlobId),
          txb.pure.string(policyId),
        ],
      });

      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          {
            transactionBlock: txb,
            options: { showEffects: true },
          },
          {
            onSuccess: (result) => {
              console.log('Sui transaction successful!', result);
              resolve();
            },
            onError: (err) => {
              console.error('Sui transaction failed:', err);
              reject(new Error('User rejected or failed to sign the Sui transaction.'));
            },
          }
        );
      });

      console.log('Project creation process completed successfully!');
      setIsCreating(false);
      return { success: true, walrusBlobId, policyId };

    } catch (err: any) {
      console.error('An error occurred during the project creation process:', err);
      setError(err.message || 'An unknown error occurred.');
      setIsCreating(false);
      return { success: false, error: err.message };
    }
  };

  return { handleCreateProject, isCreating, error };
};