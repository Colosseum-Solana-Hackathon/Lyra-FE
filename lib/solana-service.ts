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
import { useWallet } from "@solana/wallet-adapter-react";
import { solanaApi, DepositResult, VaultInfo, UserPosition, WithdrawResult, TransactionStatus, VaultEvent } from "./solana-api";
import { VAULT_ADDRESS, VAULT_PROGRAM_ID, RPC_URL } from "./constants";

// Re-export types for external use
export type { DepositResult, VaultInfo, UserPosition, WithdrawResult, TransactionStatus, VaultEvent };

/**
 * Solana Service for ETF Vault Interactions
 * 
 * This service provides a clean interface for interacting with your deployed
 * Solana ETF vault program on devnet.
 */
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;
  private vaultAccount: PublicKey;

  constructor(
    endpoint: string = RPC_URL,
    programId?: PublicKey,
    vaultAccount?: PublicKey
  ) {
    this.connection = new Connection(endpoint, "confirmed");
    this.programId = programId || new PublicKey(VAULT_PROGRAM_ID);
    this.vaultAccount = vaultAccount || new PublicKey(VAULT_ADDRESS);
  }

  /**
   * Deposit SOL into the ETF vault
   * 
   * This method calls your deployed Solana program to deposit SOL.
   */
  async depositSOL(
    userPublicKey: PublicKey,
    amount: number, // in SOL
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<DepositResult> {
    try {
      console.log(`[SolanaService] Initiating deposit of ${amount} SOL`);
      
      // Call the real Solana API
      const result = await solanaApi.depositSOL(
        userPublicKey.toString(),
        amount,
        signTransaction
      );
      
      console.log(`[SolanaService] Deposit result:`, result);
      return result;
      
    } catch (error: any) {
      console.error("[SolanaService] Deposit failed:", error);
      return {
        success: false,
        error: error.message || "Transaction failed"
      };
    }
  }

  /**
   * Get vault information from on-chain data
   * 
   * Fetches real-time vault data from your deployed program.
   */
  async getVaultInfo(): Promise<VaultInfo> {
    try {
      console.log("[SolanaService] Fetching vault info from on-chain data");
      return await solanaApi.getVaultInfo();
    } catch (error) {
      console.error("[SolanaService] Failed to fetch vault info:", error);
      throw error;
    }
  }

  /**
   * Get user's position in the vault
   * 
   * Returns detailed information about the user's shares and performance.
   */
  async getUserPosition(userPublicKey: PublicKey): Promise<UserPosition> {
    try {
      console.log(`[SolanaService] Fetching position for user ${userPublicKey.toString()}`);
      return await solanaApi.getUserPosition(userPublicKey.toString());
    } catch (error) {
      console.error("[SolanaService] Failed to fetch user position:", error);
      throw error;
    }
  }

  /**
   * Check if user has sufficient SOL balance
   * 
   * Uses real Solana RPC to check user balance.
   */
  async checkUserBalance(userPublicKey: PublicKey, requiredAmount: number): Promise<boolean> {
    try {
      console.log(`[SolanaService] Checking balance for ${requiredAmount} SOL`);
      return await solanaApi.checkUserBalance(userPublicKey.toString(), requiredAmount);
    } catch (error) {
      console.error("[SolanaService] Failed to check user balance:", error);
      return false;
    }
  }

  /**
   * Get transaction status
   * 
   * Uses real Solana RPC to check transaction status.
   */
  async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    try {
      console.log(`[SolanaService] Checking transaction status: ${signature}`);
      return await solanaApi.getTransactionStatus(signature);
    } catch (error: any) {
      console.error("[SolanaService] Failed to get transaction status:", error);
      return { confirmed: false, success: false, error: error.message };
    }
  }

  /**
   * Withdraw SOL from the vault
   * 
   * Burns user shares and returns SOL based on current share price.
   */
  async withdrawSOL(
    userPublicKey: PublicKey,
    shares: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<WithdrawResult> {
    try {
      console.log(`[SolanaService] Initiating withdrawal of ${shares} shares`);
      return await solanaApi.withdrawSOL(
        userPublicKey.toString(),
        shares,
        signTransaction
      );
    } catch (error: any) {
      console.error("[SolanaService] Withdrawal failed:", error);
      return { success: false, error: error.message || "Withdrawal failed" };
    }
  }

  /**
   * Get recent vault events
   * 
   * Returns recent deposit, withdrawal, and rebalance events from on-chain data.
   */
  async getRecentEvents(limit: number = 10): Promise<VaultEvent[]> {
    try {
      console.log(`[SolanaService] Fetching ${limit} recent events`);
      return await solanaApi.getRecentEvents(limit);
    } catch (error) {
      console.error("[SolanaService] Failed to fetch events:", error);
      return [];
    }
  }

  /**
   * Get connection instance for direct RPC calls
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get vault account
   */
  getVaultAccount(): PublicKey {
    return this.vaultAccount;
  }
}

// Export a singleton instance
export const solanaService = new SolanaService();