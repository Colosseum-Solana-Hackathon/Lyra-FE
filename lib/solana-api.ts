"use client";

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  Keypair
} from "@solana/web3.js";
import { 
  VAULT_PROGRAM_ID, 
  VAULT_ADDRESS, 
  RPC_URL,
  BTC_USD_FEED,
  ETH_USD_FEED,
  SOL_USD_FEED,
  MARINADE_PROGRAM_ID,
  MARINADE_STATE,
  MSOL_MINT
} from "./constants";
import { anchorClient } from "./anchor-client";

// Type definitions for Solana program interactions
export interface DepositResult {
  success: boolean;
  txHash?: string;
  sharesReceived?: number;
  error?: string;
}

export interface WithdrawResult {
  success: boolean;
  txHash?: string;
  solReceived?: number;
  error?: string;
}

export interface VaultInfo {
  totalValueLocked: number;
  sharePrice: number;
  totalShares: number;
  apy: number;
  lastRebalance: string;
  assets: Array<{
    symbol: string;
    amount: number;
    value: number;
    percentage: number;
  }>;
}

export interface UserPosition {
  userAddress: string;
  shares: number;
  solValue: number;
  usdValue: number;
  pnl: number;
  pnlPercentage: number;
  depositHistory: Array<{
    date: string;
    amount: number;
    shares: number;
  }>;
}

export interface TransactionStatus {
  confirmed: boolean;
  success: boolean;
  error?: string;
}

export interface VaultEvent {
  id: string;
  type: 'deposit' | 'withdraw' | 'rebalance';
  amount: number;
  timestamp: string;
  txHash: string;
  userAddress?: string;
}

// Real Solana API service for interacting with deployed program using Anchor
export class SolanaApi {
  private connection: Connection;
  private programId: PublicKey;
  private vaultAccount: PublicKey;

  constructor() {
    this.connection = new Connection(RPC_URL, "confirmed");
    this.programId = new PublicKey(VAULT_PROGRAM_ID);
    this.vaultAccount = new PublicKey(VAULT_ADDRESS);
  }

  /**
   * Deposit SOL into the ETF vault using Anchor client
   */
  async depositSOL(
    userAddress: string,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<DepositResult> {
    try {
      console.log(`[SolanaApi] Depositing ${amount} SOL for user ${userAddress}`);
      
      const userPublicKey = new PublicKey(userAddress);
      
      // Use Anchor client for the deposit
      const result = await anchorClient.depositSOL(
        userPublicKey,
        amount,
        signTransaction
      );

      return result;
    } catch (error: any) {
      console.error("[SolanaApi] Deposit failed:", error);
      return {
        success: false,
        error: error.message || "Transaction failed"
      };
    }
  }

  /**
   * Withdraw SOL from the ETF vault using Anchor client
   */
  async withdrawSOL(
    userAddress: string,
    shares: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<WithdrawResult> {
    try {
      console.log(`[SolanaApi] Withdrawing ${shares} shares for user ${userAddress}`);
      
      const userPublicKey = new PublicKey(userAddress);
      
      // Use Anchor client for the withdrawal
      const result = await anchorClient.withdrawSOL(
        userPublicKey,
        shares,
        signTransaction
      );

      return result;
    } catch (error: any) {
      console.error("[SolanaApi] Withdrawal failed:", error);
      return {
        success: false,
        error: error.message || "Withdrawal failed"
      };
    }
  }

  /**
   * Get vault information from on-chain data
   */
  async getVaultInfo(): Promise<VaultInfo> {
    try {
      // Fetch vault account data
      const vaultAccountInfo = await this.connection.getAccountInfo(this.vaultAccount);
      
      if (!vaultAccountInfo) {
        throw new Error("Vault account not found");
      }

      // Parse vault data (replace with actual program data structure)
      // This is a simplified example - you'll need to implement proper deserialization
      const totalValueLocked = 1000000; // Replace with actual data
      const sharePrice = 1.05; // Replace with actual data
      const totalShares = 950000; // Replace with actual data
      const apy = 8.5; // Replace with actual data

      return {
        totalValueLocked,
        sharePrice,
        totalShares,
        apy,
        lastRebalance: new Date().toISOString(),
        assets: [
          { symbol: "SOL", amount: 500000, value: 500000, percentage: 50 },
          { symbol: "BTC", amount: 0.1, value: 300000, percentage: 30 },
          { symbol: "ETH", amount: 2.5, value: 200000, percentage: 20 }
        ]
      };
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
      throw error;
    }
  }

  /**
   * Get user's position in the vault
   */
  async getUserPosition(userAddress: string): Promise<UserPosition> {
    try {
      // Fetch user position from on-chain data
      // This is a simplified example - implement actual program data fetching
      const shares = 1000; // Replace with actual data
      const solValue = shares * 1.05;
      const usdValue = solValue * 100; // Replace with actual SOL price

      return {
        userAddress,
        shares,
        solValue,
        usdValue,
        pnl: 50,
        pnlPercentage: 5.0,
        depositHistory: [
          {
            date: new Date().toISOString(),
            amount: 1.0,
            shares: 1000
          }
        ]
      };
    } catch (error) {
      console.error("Failed to fetch user position:", error);
      throw error;
    }
  }

  /**
   * Check if user has sufficient SOL balance
   */
  async checkUserBalance(userAddress: string, requiredAmount: number): Promise<boolean> {
    try {
      const userPublicKey = new PublicKey(userAddress);
      const balance = await this.connection.getBalance(userPublicKey);
      const requiredLamports = requiredAmount * LAMPORTS_PER_SOL;
      
      return balance >= requiredLamports;
    } catch (error) {
      console.error("Failed to check user balance:", error);
      return false;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    try {
      const transaction = await this.connection.getTransaction(signature);
      
      if (!transaction) {
        return { confirmed: false, success: false };
      }

      return {
        confirmed: true,
        success: transaction.meta?.err ? false : true,
        error: transaction.meta?.err?.toString()
      };
    } catch (error: any) {
      console.error("Failed to get transaction status:", error);
      return { confirmed: false, success: false, error: error.message };
    }
  }

  /**
   * Get recent vault events
   */
  async getRecentEvents(limit: number = 10): Promise<VaultEvent[]> {
    try {
      // Fetch recent events from on-chain data
      // This is a simplified example - implement actual event fetching
      return [
        {
          id: "1",
          type: "deposit",
          amount: 1.0,
          timestamp: new Date().toISOString(),
          txHash: "recent-tx-hash",
          userAddress: "user-address"
        }
      ];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  }

}

// Export singleton instance
export const solanaApi = new SolanaApi();