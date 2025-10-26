import { useState } from 'react';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';

// --- Constants ---

// This should be defined in your config files or environment variables
const SUI_CONTRACT_PACKAGE_ID = '0x976482acdf9634d27b3a9ef1a37801dd4c094a8b3d2157487064abec88b9f79e'; // IMPORTANT: Replace with your actual Sui Contract Package ID
const MIST_PER_SUI = 1_000_000_000;

// Move contract error codes (from research_dao.move)
const EInvestmentExceedsLimit = 4;

// --- Custom Hook Implementation ---

export const useInvestInProject = () => {
  const [isInvesting, setIsInvesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransactionBlock();

  const handleInvest = async (projectId: string, amountInSui: number) => {
    setIsInvesting(true);
    setError(null);

    if (amountInSui <= 0) {
        setError('Investment amount must be a positive number.');
        setIsInvesting(false);
        return { success: false, error: 'Investment amount must be a positive number.' };
    }

    try {
      const txb = new TransactionBlock();
      const amountInMist = Math.floor(amountInSui * MIST_PER_SUI);

      // 1. Split the required SUI amount from the user's coins to create the payment coin
      const [investmentCoin] = txb.splitCoins(txb.gas, [txb.pure(amountInMist)]);

      // 2. Call the 'invest' function on the smart contract
      txb.moveCall({
        target: `${SUI_CONTRACT_PACKAGE_ID}::research_dao::invest`,
        arguments: [
          txb.object(projectId), // The `Project` object to invest in
          investmentCoin,        // The `Coin<SUI>` object representing the investment payment
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
              console.log('Investment transaction successful!', result);
              // You can add further success handling here, e.g., refetching project data
              resolve();
            },
            onError: (err) => {
              console.error('Investment transaction failed:', err);
              
              // Check for the specific Move abort error from the contract
              const errorMessage = err.message || '';
              if (errorMessage.includes(`Aborted with ${EInvestmentExceedsLimit}`)) {
                 reject(new Error('Investment Failed: Your total contribution cannot exceed 50% of the project funding goal.'));
              } else {
                 reject(new Error('Investment failed. Please approve the transaction or check your balance.'));
              }
            },
          }
        );
      });

      console.log('Investment process completed successfully!');
      setIsInvesting(false);
      return { success: true };

    } catch (err: any) {
      console.error('An error occurred during the investment process:', err);
      setError(err.message || 'An unknown error occurred.');
      setIsInvesting(false);
      return { success: false, error: err.message };
    }
  };

  return { handleInvest, isInvesting, error };
};