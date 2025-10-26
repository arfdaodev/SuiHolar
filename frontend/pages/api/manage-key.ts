import { NextApiRequest, NextApiResponse } from 'next';
import { JsonRpcProvider, SuiObjectData } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// --- Configuration ---

// WARNING: This is an in-memory database for simulation purposes only.
// Data will be lost on server restart. Use a persistent database in production.
const keyDatabase = new Map<string, { aesKey: string; iv: string }>();

const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID;

// Initialize the Sui RPC provider. Uses SUI_RPC_URL env var if set, otherwise defaults.
const provider = new JsonRpcProvider();

/**
 * This API route simulates the Seal Protocol by:
 * 1. Storing encryption keys (via POST).
 * 2. Releasing them only after a successful on-chain check (via GET).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!SUI_PACKAGE_ID) {
    return res.status(500).json({ error: 'NEXT_PUBLIC_SUI_PACKAGE_ID environment variable is not set.' });
  }

  if (req.method === 'POST') {
    // --- Store the key and IV associated with a Walrus Blob ID ---
    try {
      const { walrusBlobId, rawKey, iv } = req.body;

      if (!walrusBlobId || !rawKey || !iv) {
        return res.status(400).json({ error: 'Request body must contain walrusBlobId, rawKey, and iv.' });
      }

      keyDatabase.set(walrusBlobId, { aesKey: rawKey, iv: iv });
      console.log(`[API/manage-key] Stored key for blobId: ${walrusBlobId}`);
      return res.status(200).json({ message: 'Key stored successfully.' });
    } catch (error: any) {
        console.error('[API/manage-key] POST Error:', error);
        return res.status(500).json({ error: 'Failed to store key.', details: error.message });
    }

  } else if (req.method === 'GET') {
    // --- Check on-chain authorization and retrieve the key ---
    try {
      const { walrusBlobId, investorAddress, projectId } = req.query;

      if (!walrusBlobId || !investorAddress || !projectId) {
        return res.status(400).json({ error: 'Query parameters must include walrusBlobId, investorAddress, and projectId.' });
      }

      // 1. Build a transaction block to call the view function (this is read-only and won't be executed)
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${SUI_PACKAGE_ID}::research_dao::is_authorized_investor`,
        arguments: [txb.object(projectId as string), txb.pure.address(investorAddress as string)],
      });

      // 2. Use devInspectTransactionBlock for a dry-run to get the return value
      const result = await provider.devInspectTransactionBlock({
        sender: investorAddress as string,
        transactionBlock: txb,
      });

      // @ts-ignore - The SUI RPC types can be complex; we directly parse the expected return.
      const returnValues = result.results?.[0]?.returnValues;
      if (!returnValues || result.effects.status.status !== 'success') {
        throw new Error('On-chain function call failed or returned no values.');
      }
      
      // 3. Extract the u64 percentage value from the return
      const [percentageBytes, type] = returnValues[0];
      if (type !== 'u64') throw new Error(`Expected u64 return type, but got ${type}`);
      const investmentPercentage = Buffer.from(percentageBytes).readBigUInt64LE(0);

      console.log(`[API/manage-key] Investor ${investorAddress} has a ${investmentPercentage}% stake in project ${projectId}.`);

      // 4. KURAL: Check if the investment percentage is >= 10%
      if (investmentPercentage >= 10) {
        const keyData = keyDatabase.get(walrusBlobId as string);
        if (keyData) {
          console.log(`[API/manage-key] Access granted. Returning key for blobId: ${walrusBlobId}`);
          return res.status(200).json(keyData);
        } else {
          return res.status(404).json({ error: 'Key not found for the given walrusBlobId.' });
        }
      } else {
        console.log(`[API/manage-key] Access denied for investor ${investorAddress}.`);
        return res.status(403).json({ error: 'Access Denied: A minimum funding of 10% is required to view the article.' });
      }

    } catch (error: any) {
      console.error('[API/manage-key] GET Error:', error);
      return res.status(500).json({ error: 'Internal server error while checking authorization.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
