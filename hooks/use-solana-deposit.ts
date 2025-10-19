"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { solanaService, DepositResult } from "@/lib/solana-service";

export interface UseSolanaDepositReturn {
  deposit: (amount: number) => Promise<DepositResult>;
  isLoading: boolean;
  error: string | null;
  lastTransaction: string | null;
  checkBalance: (amount: number) => Promise<boolean>;
}

export function useSolanaDeposit(): UseSolanaDepositReturn {
  const { publicKey, signTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<string | null>(null);

  const checkBalance = useCallback(async (amount: number): Promise<boolean> => {
    if (!publicKey) return false;
    
    try {
      return await solanaService.checkUserBalance(publicKey, amount);
    } catch (err: any) {
      console.error("Balance check failed:", err);
      return false;
    }
  }, [publicKey]);

  const deposit = useCallback(async (amount: number): Promise<DepositResult> => {
    if (!connected || !publicKey || !signTransaction) {
      setError("Please connect your wallet to make a deposit");
      return { success: false, error: "Wallet not connected" };
    }

    if (amount <= 0) {
      setError("Deposit amount must be greater than 0");
      return { success: false, error: "Invalid amount" };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user has sufficient balance
      const hasBalance = await checkBalance(amount);
      if (!hasBalance) {
        const errorMsg = "Insufficient SOL balance for this deposit";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      // Execute the deposit
      const result = await solanaService.depositSOL(
        publicKey,
        amount,
        signTransaction
      );

      if (result.success && result.transactionSignature) {
        setLastTransaction(result.transactionSignature);
      } else {
        setError(result.error || "Deposit failed");
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      console.error("Deposit error:", err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [connected, publicKey, signTransaction, checkBalance]);

  return {
    deposit,
    isLoading,
    error,
    lastTransaction,
    checkBalance,
  };
}
