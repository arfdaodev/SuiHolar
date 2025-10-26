import { useState, useCallback } from 'react';
import axios from 'axios';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { JsonRpcProvider } from '@mysten/sui.js/client';
import { useSignAndExecuteTransactionBlock, useCurrentAccount } from '@mysten/dapp-kit';
import { generateAesKey, encryptFile, importKeyFromBase64, decryptArrayBuffer } from '../utils/crypto';

// --- Types & Constants ---

export interface ProjectData {
  name: string;
  description: string;
  fundingGoal: number; // in SUI
  timelineMonths: number;
}

// Represents the structure of a fetched Project object from the Sui blockchain
export interface SuiProject {
  id: string;
  title: string;
  description: string;
  owner: string;
  funding_goal: string; // Comes as a string from the chain
  current_funding: string; // Comes as a string from the chain
  walrus_blob_id: string;
  // Add any other fields you need to display
}

const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID;
const MIST_PER_SUI = 1_000_000_000;
const EInvestmentExceedsLimit = 4; // Error code from the Move contract
const WALRUS_GATEWAY = 'https://gateway.walrus.xyz/blobs';
const provider = new JsonRpcProvider(); // Uses default RPC

// --- Consolidated Hook for All Project Actions ---

export const useProjectActions = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [isAccessingArticle, setIsAccessingArticle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<SuiProject[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();

  // --- Action 1: Create a new Project ---
  const handleCreateProject = async (data: ProjectData, pdfFile: File) => {
    setIsCreating(true);
    setError(null);

    if (!SUI_PACKAGE_ID) {
      const errMsg = 'SUI_PACKAGE_ID environment variable is not set.';
      setError(errMsg);
      setIsCreating(false);
      return { success: false, error: errMsg };
    }

    try {
      // 1. Crypto Step: Generate key and encrypt the file
      console.log('Encrypting file...');
      const aesKey = await generateAesKey();
      const { buffer: encryptedBuffer, iv, rawKey } = await encryptFile(pdfFile, aesKey);
      const ivAsBase64 = Buffer.from(iv).toString('base64');

      // 2. Walrus Upload Step: Upload encrypted file via our backend relay
      console.log('Uploading to Walrus via API relay...');
      const walrusFormData = new FormData();
      walrusFormData.append('file', new Blob([encryptedBuffer]), `${pdfFile.name}.enc`);
      const walrusResponse = await axios.post('/api/upload-walrus', walrusFormData);
      const blobId = walrusResponse.data.blobId;
      if (!blobId) throw new Error('Failed to get blobId from Walrus upload.');

      // 3. Key Registration Step: Store the key with our backend key manager simulation
      console.log('Registering encryption key with manage-key API...');
      await axios.post('/api/manage-key', {
        walrusBlobId: blobId,
        rawKey: rawKey, // The Base64 encoded key
        iv: ivAsBase64,
      });

      // 4. Sui Registration Step: Create the project on-chain
      console.log('Creating Sui transaction to register the project...');
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${SUI_PACKAGE_ID}::research_dao::create_research_project`,
        arguments: [
          txb.pure(data.name),
          txb.pure(data.description),
          txb.pure(data.fundingGoal * MIST_PER_SUI),
          txb.pure(data.timelineMonths),
          txb.pure(blobId), // walrus_blob_id
          txb.pure(blobId), // seal_policy_id (we use blobId as the unique identifier for our key manager)
        ],
      });

      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          { transactionBlock: txb, options: { showEffects: true } },
          {
            onSuccess: (result) => {
              console.log('Project creation transaction successful!', result);
              resolve();
            },
            onError: (err) => reject(new Error('Sui transaction failed. User rejected or an error occurred.')),
          }
        );
      });

      console.log('Project creation process completed successfully!');
      setIsCreating(false);
      return { success: true, blobId };

    } catch (err: any) {
      const errMsg = err.message || 'An unknown error occurred during project creation.';
      console.error(errMsg, err);
      setError(errMsg);
      setIsCreating(false);
      return { success: false, error: errMsg };
    }
  };

  // --- Action 2: Invest in a Project ---
  const handleInvest = async (projectId: string, amountInSui: number) => {
    setIsInvesting(true);
    setError(null);

    if (amountInSui <= 0) {
      const errMsg = 'Investment amount must be a positive number.';
      setError(errMsg);
      setIsInvesting(false);
      return { success: false, error: errMsg };
    }
    if (!SUI_PACKAGE_ID) {
      const errMsg = 'SUI_PACKAGE_ID environment variable is not set.';
      setError(errMsg);
      setIsInvesting(false);
      return { success: false, error: errMsg };
    }

    try {
      const txb = new TransactionBlock();
      const amountInMist = Math.floor(amountInSui * MIST_PER_SUI);
      const [investmentCoin] = txb.splitCoins(txb.gas, [txb.pure(amountInMist)]);
      txb.moveCall({
        target: `${SUI_PACKAGE_ID}::research_dao::invest`,
        arguments: [txb.object(projectId), investmentCoin],
      });

      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          { transactionBlock: txb, options: { showEffects: true } },
          {
            onSuccess: (result) => {
              console.log('Investment transaction successful!', result);
              resolve();
            },
            onError: (err) => {
              const errMsg = err.message || '';
              if (errMsg.includes(`Aborted with ${EInvestmentExceedsLimit}`)) {
                 reject(new Error('Investment Failed: Your total contribution cannot exceed 50% of the project funding goal.'));
              } else {
                 reject(new Error('Investment failed. Please approve the transaction or check your balance.'));
              }
            },
          }
        );
      });

      setIsInvesting(false);
      return { success: true };

    } catch (err: any) {
      const errMsg = err.message || 'An unknown error occurred during investment.';
      console.error(errMsg, err);
      setError(errMsg);
      setIsInvesting(false);
      return { success: false, error: errMsg };
    }
  };

  // --- Action 3: Fetch all visible projects ---
  const fetchVisibleProjects = useCallback(async () => {
    setIsFetchingProjects(true);
    setError(null);
    if (!SUI_PACKAGE_ID) {
      setError('SUI_PACKAGE_ID environment variable is not set.');
      setIsFetchingProjects(false);
      return;
    }
    try {
      const projectResponses = await provider.queryObjects({
        query: { StructType: `${SUI_PACKAGE_ID}::research_dao::Project` },
        options: { showContent: true },
      });

      const formattedProjects = projectResponses.data
        .filter(p => p.data?.content?.dataType === 'moveObject')
        .map(p => {
          const fields = (p.data?.content as any).fields;
          return {
            id: fields.id.id,
            title: fields.title,
            description: fields.description,
            owner: fields.owner,
            funding_goal: (BigInt(fields.funding_goal) / BigInt(MIST_PER_SUI)).toString(),
            current_funding: (BigInt(fields.current_funding) / BigInt(MIST_PER_SUI)).toString(),
            walrus_blob_id: fields.walrus_blob_id,
          };
        });

      setProjects(formattedProjects);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to fetch projects from the blockchain.';
      console.error(errMsg, err);
      setError(errMsg);
    } finally {
      setIsFetchingProjects(false);
    }
  }, []);

  // --- Action 4: Access a project's encrypted article ---
  const handleAccessArticle = async (projectId: string, blobId: string) => {
    setIsAccessingArticle(true);
    setError(null);
    setPdfUrl(null);

    if (!currentAccount) {
      const errMsg = 'Please connect your wallet to access an article.';
      setError(errMsg);
      setIsAccessingArticle(false);
      return { success: false, error: errMsg };
    }

    try {
      // 1. Request the key from our backend, which will perform the on-chain check
      console.log('Requesting key from /api/manage-key...');
      const keyResponse = await axios.get('/api/manage-key', {
        params: {
          walrusBlobId: blobId,
          investorAddress: currentAccount.address,
          projectId: projectId,
        },
      });

      const { aesKey, iv } = keyResponse.data;
      if (!aesKey || !iv) throw new Error('Invalid key/IV received from key manager.');

      // 2. Import the AES key
      const cryptoKey = await importKeyFromBase64(aesKey);
      const ivBytes = new Uint8Array(Buffer.from(iv, 'base64'));

      // 3. Fetch the encrypted article from Walrus
      console.log(`Fetching encrypted article from Walrus: ${blobId}`);
      const walrusResponse = await axios.get(`${WALRUS_GATEWAY}/${blobId}`, {
        responseType: 'arraybuffer',
      });

      // 4. Decrypt the article
      console.log('Decrypting article...');
      const decryptedBuffer = await decryptArrayBuffer(walrusResponse.data, cryptoKey, ivBytes);

      // 5. Create a viewable URL for the decrypted PDF
      const pdfBlob = new Blob([decryptedBuffer], { type: 'application/pdf' });
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(objectUrl);

      return { success: true, url: objectUrl };

    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'An unknown error occurred.';
      console.error(errMsg, err);
      setError(errMsg);
      return { success: false, error: errMsg };
    }
    finally {
      setIsAccessingArticle(false);
    }
  };

  const cleanupPdfUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [pdfUrl]);

  return { 
    handleCreateProject, 
    handleInvest, 
    fetchVisibleProjects,
    handleAccessArticle,
    projects,
    pdfUrl,
    cleanupPdfUrl,
    isCreating, 
    isInvesting, 
    isFetchingProjects,
    isAccessingArticle,
    error 
  };
};
