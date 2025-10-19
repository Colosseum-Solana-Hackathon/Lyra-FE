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

// Re-export types for external use
export type { DepositResult, VaultInfo, UserPosition, WithdrawResult, TransactionStatus, VaultEvent };

// ETF Vault Smart Contract Configuration
// These would be replaced with actual deployed program addresses
const ETF_PROGRAM_ID = new PublicKey("11111111111111111111111111111111"); // Your deployed program ID
const VAULT_ACCOUNT = new PublicKey("11111111111111111111111111111112"); // Your vault account
const TREASURY_ACCOUNT = new PublicKey("11111111111111111111111111111113"); // Your treasury account

/**
 * Enhanced Solana Service with Mock API Integration
 * 
 * This service acts as a wrapper around the mock Solana API,
 * providing a clean interface for the frontend components.
 * 
 * In production, replace the mock API calls with actual RPC calls
 * to your deployed Solana smart contract.
 */
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;
  private vaultAccount: PublicKey;
  private treasuryAccount: PublicKey;

  constructor(
    endpoint: string = "https://api.devnet.solana.com",
    programId?: PublicKey,
    vaultAccount?: PublicKey,
    treasuryAccount?: PublicKey
  ) {
    this.connection = new Connection(endpoint, "confirmed");
    this.programId = programId || ETF_PROGRAM_ID;
    this.vaultAccount = vaultAccount || VAULT_ACCOUNT;
    this.treasuryAccount = treasuryAccount || TREASURY_ACCOUNT;
  }

  /**
   * Deposit SOL into the ETF vault
   * 
   * This method uses the mock API service to simulate the deposit process.
   * In production, replace with actual RPC calls to your smart contract.
   */
  async depositSOL(
    userPublicKey: PublicKey,
    amount: number, // in SOL
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<DepositResult> {
    try {
      console.log(`[SolanaService] Initiating deposit of ${amount} SOL`);
      
      // Use the mock API service for deposit
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
   * Create deposit instruction for the ETF program
   */
  private createDepositInstruction(
    userPublicKey: PublicKey,
    lamports: number
  ): TransactionInstruction {
    // This is a simplified instruction structure
    // In a real implementation, you would use Anchor or define the instruction data properly
    
    const instructionData = Buffer.alloc(8);
    instructionData.writeUInt32LE(0, 0); // Deposit instruction discriminator
    instructionData.writeUInt32LE(lamports, 4); // Amount in lamports
    
    return new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true },
        { pubkey: this.vaultAccount, isSigner: false, isWritable: true },
        { pubkey: this.treasuryAccount, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: instructionData,
    });
  }

  /**
   * Get vault information
   * 
   * Uses the mock API service to fetch vault data.
   * In production, replace with actual RPC calls to your smart contract.
   */
  async getVaultInfo(): Promise<VaultInfo> {
    try {
      console.log("[SolanaService] Fetching vault info");
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
   * Uses the mock API service to check user balance.
   * In production, use connection.getBalance() for real balance checks.
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
   * Uses the mock API service to check transaction status.
   * In production, use connection.getTransaction() for real status checks.
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
   * Returns recent deposit, withdrawal, and rebalance events.
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
}

// Export a singleton instance
export const solanaService = new SolanaService();
