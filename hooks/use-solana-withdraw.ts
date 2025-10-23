import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { anchorClient } from "@/lib/anchor-client";

export interface WithdrawResult {
  success: boolean;
  error?: string;
  transactionHash?: string;
  sharesRedeemed?: number;
}

export interface UseSolanaWithdrawReturn {
  withdraw: (amount: number) => Promise<WithdrawResult>;
  isLoading: boolean;
  error: string | null;
  lastTransaction: string | null;
  checkShares: (amount: number) => Promise<boolean>;
}

export function useSolanaWithdraw(): UseSolanaWithdrawReturn {
  const { publicKey, signTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  const checkShares = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey) return false;
    
    try {
      // Get user's actual vault token balance
      const connection = anchorClient.getConnection();
      const vaultTokenMint = "Bgh1fPAzo15Jgv1dzjfc4hbw2YxAKwe46hoRUEAcTvWK"; // From constants
      
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: new PublicKey(vaultTokenMint)
      });
      
      if (tokenAccounts.value.length > 0) {
        const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        return (balance || 0) >= amount;
      }
      
      return false;
    } catch (err: any) {
      console.error("Shares check failed:", err);
      return false;
    }
  }, [publicKey]);

  const withdraw = useCallback(async (amount: number): Promise<WithdrawResult> => {
    if (!connected || !publicKey || !signTransaction) {
      setError("Please connect your wallet to make a withdrawal");
      return { success: false, error: "Wallet not connected" };
    }

    if (amount <= 0) {
      setError("Withdrawal amount must be greater than 0");
      return { success: false, error: "Invalid amount" };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user has sufficient shares
      const hasShares = await checkShares(amount);
      if (!hasShares) {
        setError("Insufficient shares for withdrawal");
        return { success: false, error: "Insufficient shares" };
      }

      console.log(`[WithdrawHook] Initiating withdrawal of ${amount} shares`);

      // Call the actual Solana program withdrawal
      const result = await anchorClient.withdrawSOL(
        publicKey,
        amount,
        signTransaction
      );

      if (result.success) {
        console.log(`[WithdrawHook] Withdrawal successful: ${result.txHash}`);
        setLastTransaction(result.txHash || null);
        
        return {
          success: true,
          transactionHash: result.txHash,
          sharesRedeemed: result.solReceived || amount
        };
      } else {
        console.error(`[WithdrawHook] Withdrawal failed: ${result.error}`);
        setError(result.error || "Withdrawal failed");
        return { 
          success: false, 
          error: result.error || "Withdrawal failed" 
        };
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Withdrawal failed";
      console.error("[WithdrawHook] Withdrawal error:", err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, signTransaction, checkShares]);

  return {
    withdraw,
    isLoading,
    error,
    lastTransaction,
    checkShares,
  };
}
