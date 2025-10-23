"use client";

import { AnchorProvider, Program, web3, BN, Idl } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Keypair,
  TransactionInstruction,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token
} from "@solana/spl-token";
import VaultIDL from "./idl/vault.json";
import {
  VAULT_PROGRAM_ID,
  RPC_URL,
  VAULT_ADMIN,
  VAULT_NAME,
  BTC_MINT,
  ETH_MINT,
  SOL_MINT,
  BTC_USD_FEED,
  ETH_USD_FEED,
  SOL_USD_FEED,
  MARINADE_PROGRAM_ID,
  MARINADE_STATE,
  MSOL_MINT,
  MARINADE_STRATEGY_PROGRAM,
  NETWORK,
  MOCK_ORACLE
} from "./constants";

// Type the IDL properly
const IDL = VaultIDL as Idl;

/**
 * AnchorClientService - Manages all interactions with the Solana vault program
 * using Anchor's type-safe client generation
 */
export class AnchorClientService {
  private connection: Connection;
  private programId: PublicKey;
  private program: Program | null = null;

  constructor(
    endpoint: string = RPC_URL,
    programId: string = VAULT_PROGRAM_ID
  ) {
    this.connection = new Connection(endpoint, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
    this.programId = new PublicKey(programId);
  }

  /**
   * Initialize the Anchor program with a wallet
   */
  private async initProgram(signTransaction: (tx: Transaction) => Promise<Transaction>) {
    // Create a mock wallet for the provider
    const mockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction,
      signAllTransactions: async (txs: Transaction[]) => {
        const signed = [];
        for (const tx of txs) {
          signed.push(await signTransaction(tx));
        }
        return signed;
      },
    };

    const provider = new AnchorProvider(
      this.connection,
      mockWallet as any,
      {
        commitment: "confirmed",
        preflightCommitment: "confirmed",
      }
    );

    this.program = new Program(IDL, provider);
    return this.program;
  }

  /**
   * Derive vault PDA
   */
  async getVaultPDA(admin: PublicKey, vaultName: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        admin.toBuffer(),
        Buffer.from(vaultName),
      ],
      this.programId
    );
  }

  /**
   * Derive vault token mint PDA
   */
  async getVaultTokenMintPDA(admin: PublicKey, vaultName: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault_mint"),
        admin.toBuffer(),
        Buffer.from(vaultName),
      ],
      this.programId
    );
  }

  /**
   * Get user's shares token account
   */
  async getUserSharesATA(user: PublicKey, vaultTokenMint: PublicKey): Promise<PublicKey> {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      vaultTokenMint,
      user
    );
  }

  /**
   * Create/Initialize a new vault
   */
  async createVault(
    adminPublicKey: PublicKey,
    vaultName: string,
    assets: Array<{ mint: PublicKey; weight: number; ata: PublicKey }>,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{
    success: boolean;
    txHash?: string;
    vaultPDA?: PublicKey;
    vaultTokenMint?: PublicKey;
    error?: string;
  }> {
    try {
      console.log(`[AnchorClient] Creating vault: ${vaultName}`);

      const program = await this.initProgram(signTransaction);

      // Derive PDAs
      const [vaultPDA] = await this.getVaultPDA(adminPublicKey, vaultName);
      const [vaultTokenMint] = await this.getVaultTokenMintPDA(adminPublicKey, vaultName);

      console.log("[AnchorClient] Vault PDA:", vaultPDA.toString());
      console.log("[AnchorClient] Vault Token Mint:", vaultTokenMint.toString());

      // Build the create vault instruction
      const tx = await program.methods
        .createVault(vaultName, assets)
        .accounts({
          vault: vaultPDA,
          admin: adminPublicKey,
          vaultTokenMint: vaultTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = adminPublicKey;

      console.log("[AnchorClient] Signing transaction...");

      // Sign the transaction
      const signedTx = await signTransaction(tx);

      console.log("[AnchorClient] Sending transaction...");

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      console.log("[AnchorClient] Transaction sent:", signature);

      // Wait for confirmation
      console.log("[AnchorClient] Waiting for confirmation...");
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log("[AnchorClient] Vault created successfully!");

      return {
        success: true,
        txHash: signature,
        vaultPDA,
        vaultTokenMint,
      };
    } catch (error: any) {
      console.error("[AnchorClient] Create vault failed:", error);

      let errorMessage = "Vault creation failed";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.logs) {
        console.error("[AnchorClient] Transaction logs:", error.logs);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if vault exists and create it if needed
   */
  async ensureVaultExists(
    adminPublicKey: PublicKey,
    vaultName: string,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const [vaultPDA] = await this.getVaultPDA(adminPublicKey, vaultName);

      // Check if vault account exists
      const vaultAccount = await this.connection.getAccountInfo(vaultPDA);

      if (vaultAccount) {
        console.log("[AnchorClient] Vault already exists");
        return { success: true };
      }

      console.log("[AnchorClient] Vault does not exist, creating it...");

      // Create the vault with the asset configuration from constants
      const assets = [
        {
          mint: new PublicKey(BTC_MINT),
          weight: 40,
          ata: await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            new PublicKey(BTC_MINT),
            vaultPDA,
            true
          )
        },
        {
          mint: new PublicKey(ETH_MINT),
          weight: 30,
          ata: await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            new PublicKey(ETH_MINT),
            vaultPDA,
            true
          )
        },
        {
          mint: new PublicKey(SOL_MINT),
          weight: 30,
          ata: await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            new PublicKey(SOL_MINT),
            vaultPDA,
            true
          )
        }
      ];

      const result = await this.createVault(adminPublicKey, vaultName, assets, signTransaction);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log("[AnchorClient] Vault created successfully");
      return { success: true };
    } catch (error: any) {
      console.error("[AnchorClient] Failed to ensure vault exists:", error);
      return { success: false, error: error.message || "Failed to create vault" };
    }
  }

  /**
   * Deposit SOL into the vault using Anchor
   */
  async depositSOL(
    userPublicKey: PublicKey,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    vaultName: string = VAULT_NAME
  ): Promise<{
    success: boolean;
    txHash?: string;
    sharesReceived?: number;
    error?: string;
  }> {
    try {
      console.log(`[AnchorClient] Initiating deposit of ${amount} SOL`);

      // Get vault admin from constants
      const vaultAdmin = new PublicKey(VAULT_ADMIN);

      // Ensure vault exists before attempting deposit
      const vaultCheck = await this.ensureVaultExists(vaultAdmin, vaultName, signTransaction);
      if (!vaultCheck.success) {
        return { success: false, error: vaultCheck.error };
      }

      // Initialize the program
      const program = await this.initProgram(signTransaction);

      // Derive PDAs
      const [vaultPDA] = await this.getVaultPDA(vaultAdmin, vaultName);
      const [vaultTokenMint] = await this.getVaultTokenMintPDA(vaultAdmin, vaultName);
      const userSharesATA = await this.getUserSharesATA(userPublicKey, vaultTokenMint);

      console.log("[AnchorClient] Account derivation:");
      console.log("  Vault PDA:", vaultPDA.toString());
      console.log("  Vault Token Mint:", vaultTokenMint.toString());
      console.log("  User Shares ATA:", userSharesATA.toString());

      // Decide oracle behavior: force MockOracle on devnet to match backend behavior
      let useMockOracle = true; // default to true; overridden below for mainnet
      try {
        // If vault explicitly set, respect it; otherwise keep devnet default (mock)
        const vaultAccount: any = await (program.account as any).vault.fetch(vaultPDA);
        const priceSource = Object.keys(vaultAccount.priceSource)[0];
        useMockOracle = priceSource === "mockOracle";
        console.log("[AnchorClient] Vault price source:", priceSource);
      } catch (e) {
        console.warn("[AnchorClient] Could not fetch vault config; using MockOracle on devnet");
      }

      // Asset mints for the vault
      const btcMint = new PublicKey(BTC_MINT);
      const ethMint = new PublicKey(ETH_MINT);
      const solMint = new PublicKey(SOL_MINT);

      // Get ATAs for vault's asset holdings
      const btcAta = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        btcMint,
        vaultPDA,
        true // allowOwnerOffCurve
      );

      const ethAta = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        ethMint,
        vaultPDA,
        true
      );

      const solAta = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        solMint,
        vaultPDA,
        true
      );

      // Oracle configuration - devnet uses MockOracle, mainnet uses Switchboard
      let btcQuote: PublicKey;
      let ethQuote: PublicKey;
      let solQuote: PublicKey;
      let mockOracle: PublicKey | null = null;

      if (useMockOracle) {
        // Devnet: MockOracle
        btcQuote = PublicKey.default;
        ethQuote = PublicKey.default;
        solQuote = PublicKey.default;
        mockOracle = new PublicKey(MOCK_ORACLE);

      } else {
        // Mainnet: Switchboard
        btcQuote = new PublicKey(BTC_USD_FEED);
        ethQuote = new PublicKey(ETH_USD_FEED);
        solQuote = new PublicKey(SOL_USD_FEED);

      }

      // Marinade accounts (required by the program)
      const marinadeProgram = new PublicKey(MARINADE_PROGRAM_ID);
      const marinadeState = new PublicKey(MARINADE_STATE);
      const msolMint = new PublicKey(MSOL_MINT);

      // Derive additional PDAs for Marinade
      const [reservePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("reserve")],
        marinadeProgram
      );

      const [msolMintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("st_mint")],
        marinadeProgram
      );

      const [liqPoolSolLegPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("liq_sol")],
        marinadeProgram
      );

      const [liqPoolMsolLegAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from("liq_mint_authority")],
        marinadeProgram
      );

      // Strategy mSOL ATA (using admin as dummy for now)
      const marinadeStrategyProgram = new PublicKey(MARINADE_STRATEGY_PROGRAM);
      const strategyMsolAta = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        msolMint,
        vaultAdmin, // Use vault admin as dummy
        false
      );

      // Liquidity pool mSOL leg
      const liqPoolMsolLeg = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        msolMint,
        liqPoolSolLegPda,
        true
      );

      // Convert amount to lamports
      const lamports = new BN(amount * LAMPORTS_PER_SOL);

      console.log("[AnchorClient] Building deposit transaction...");

      // Build the deposit instruction using Anchor with remaining accounts
      const tx = await program.methods
        .depositMultiAsset(vaultName, lamports)
        .accounts({
          vault: vaultPDA,
          user: userPublicKey,
          userSharesAta: userSharesATA,
          vaultTokenMint: vaultTokenMint,
          btcQuote: btcQuote,
          ethQuote: ethQuote,
          solQuote: solQuote,
          marinadeStrategyProgram: marinadeStrategyProgram,
          marinadeProgram: marinadeProgram,
          marinadeState: marinadeState,
          reservePda: reservePda,
          msolMint: msolMint,
          strategyMsolAta: strategyMsolAta,
          msolMintAuthority: msolMintAuthority,
          liqPoolSolLegPda: liqPoolSolLegPda,
          liqPoolMsolLeg: liqPoolMsolLeg,
          liqPoolMsolLegAuthority: liqPoolMsolLegAuthority,
          clock: SYSVAR_CLOCK_PUBKEY,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .remainingAccounts([
          // Asset mints and their ATAs (must match vault composition)
          { pubkey: btcMint, isWritable: false, isSigner: false },
          { pubkey: btcAta, isWritable: true, isSigner: false },
          { pubkey: ethMint, isWritable: false, isSigner: false },
          { pubkey: ethAta, isWritable: true, isSigner: false },
          { pubkey: solMint, isWritable: false, isSigner: false },
          { pubkey: solAta, isWritable: true, isSigner: false },
          // Mock oracle only if vault is configured for it
          ...(mockOracle ? [{ pubkey: mockOracle, isWritable: false, isSigner: false }] : []),
        ])
        .transaction();

      const remainingAccountsCount = mockOracle ? 7 : 6;
      console.log(`[AnchorClient] Remaining accounts: ${remainingAccountsCount}`);

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.lastValidBlockHeight = lastValidBlockHeight;
      tx.feePayer = userPublicKey;

      console.log("[AnchorClient] Signing transaction...");

      // Sign the transaction
      const signedTx = await signTransaction(tx);

      console.log("[AnchorClient] Sending transaction...");

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        signedTx.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      );

      console.log("[AnchorClient] Transaction sent:", signature);
      console.log(`[AnchorClient] View on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=${NETWORK}`);

      // Wait for confirmation
      console.log("[AnchorClient] Waiting for confirmation...");
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log("[AnchorClient] Transaction confirmed!");

      // Fetch the user's shares balance
      let sharesReceived = 0;
      try {
        const userSharesAccount = await this.connection.getTokenAccountBalance(userSharesATA);
        sharesReceived = Number(userSharesAccount.value.amount) / LAMPORTS_PER_SOL;
      } catch (e) {
        console.warn("[AnchorClient] Could not fetch shares balance:", e);
      }

      return {
        success: true,
        txHash: signature,
        sharesReceived,
      };
    } catch (error: any) {
      console.error("[AnchorClient] Deposit failed:", error);

      // Parse Anchor errors
      let errorMessage = "Transaction failed";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.logs) {
        console.error("[AnchorClient] Transaction logs:", error.logs);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get Marinade accounts (mimicking backend getMarinadeAccounts)
   */
  async getMarinadeAccounts(): Promise<{
    marinadeState: PublicKey;
    reservePda: PublicKey;
    liqPoolMsolLeg: PublicKey;
    liqPoolSolLegPda: PublicKey;
    liqPoolMsolLegAuthority: PublicKey;
    msolMintAuthority: PublicKey;
    treasuryMsolAccount: PublicKey;
  }> {
    // Use the same derivation logic as your backend script
    const marinadeProgramId = new PublicKey(MARINADE_PROGRAM_ID);
    const marinadeState = new PublicKey(MARINADE_STATE);
    
    // Derive PDAs (same as backend script)
    const [reservePda] = PublicKey.findProgramAddressSync(
      [marinadeState.toBuffer(), Buffer.from("reserve")],
      marinadeProgramId
    );

    const [msolMintAuthority] = PublicKey.findProgramAddressSync(
      [marinadeState.toBuffer(), Buffer.from("st_mint")],
      marinadeProgramId
    );

    const [liqPoolSolLegPda] = PublicKey.findProgramAddressSync(
      [marinadeState.toBuffer(), Buffer.from("liq_sol")],
      marinadeProgramId
    );

    const [liqPoolMsolLegAuthority] = PublicKey.findProgramAddressSync(
      [marinadeState.toBuffer(), Buffer.from("liq_st_authority")],
      marinadeProgramId
    );

    // Known token accounts from Marinade (static addresses)
    const liqPoolMsolLeg = new PublicKey("7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE");
    const treasuryMsolAccount = new PublicKey("B1aLzaNMeFVAyQ6f3XbbUyKcH2YPHu2fqiEagmiF23VR");

    return {
      marinadeState,
      reservePda,
      liqPoolMsolLeg,
      liqPoolSolLegPda,
      liqPoolMsolLegAuthority,
      msolMintAuthority,
      treasuryMsolAccount,
    };
  }

  /**
   * Get vault asset ATA (same as backend)
   */
  async getVaultAssetATA(vaultPDA: PublicKey, assetMint: PublicKey): Promise<PublicKey> {
    return await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      assetMint,
      vaultPDA,
      true
    );
  }

  /**
   * Get strategy account PDA (same as backend)
   */
  async getStrategyAccountPDA(vaultPDA: PublicKey): Promise<PublicKey> {
    const [strategyPDA] = await PublicKey.findProgramAddressSync(
      [Buffer.from("marinade_strategy"), vaultPDA.toBuffer()],
      new PublicKey(MARINADE_STRATEGY_PROGRAM)
    );
    return strategyPDA;
  }

  /**
   * Withdraw from the vault using Anchor
   */
// lib/anchor-client.ts - Update the withdrawSOL function
async withdrawSOL(
  userPublicKey: PublicKey,
  shares: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  vaultName: string = VAULT_NAME
): Promise<{
  success: boolean;
  txHash?: string;
  solReceived?: number;
  error?: string;
}> {
  try {
    console.log(`[AnchorClient] Initiating withdrawal of ${shares} shares`);

    // Get vault admin from constants
    const vaultAdmin = new PublicKey(VAULT_ADMIN);

    // Ensure vault exists before attempting withdrawal
    const vaultCheck = await this.ensureVaultExists(vaultAdmin, vaultName, signTransaction);
    if (!vaultCheck.success) {
      return { success: false, error: vaultCheck.error };
    }

    const program = await this.initProgram(signTransaction);
    
    const [vaultPDA] = await this.getVaultPDA(vaultAdmin, vaultName);
    const [vaultTokenMint] = await this.getVaultTokenMintPDA(vaultAdmin, vaultName);
    const userSharesATA = await this.getUserSharesATA(userPublicKey, vaultTokenMint);

    // Get Marinade accounts (same as backend)
    const marinadeAccounts = await this.getMarinadeAccounts();
    
    // Get vault ATAs for each asset (same as backend)
    const btcVaultAta = await this.getVaultAssetATA(vaultPDA, new PublicKey(BTC_MINT));
    const ethVaultAta = await this.getVaultAssetATA(vaultPDA, new PublicKey(ETH_MINT));
    const solVaultAta = await this.getVaultAssetATA(vaultPDA, new PublicKey(SOL_MINT));

    const btcQuote = PublicKey.default; // Not used with MockOracle
    const ethQuote = PublicKey.default; // Not used with MockOracle
    const solQuote = PublicKey.default; // Not used with MockOracle

    const sharesBN = new BN(shares * LAMPORTS_PER_SOL);

    // Check if vault has a strategy configured
    const vaultAccount: any = await (program.account as any).vault.fetch(vaultPDA);
    const hasStrategy = vaultAccount.marinadeStrategy !== null;
    
    // Build remaining accounts array
    const remainingAccounts = [
      { pubkey: new PublicKey(BTC_MINT), isWritable: false, isSigner: false },
      { pubkey: btcVaultAta, isWritable: true, isSigner: false },
      { pubkey: new PublicKey(ETH_MINT), isWritable: false, isSigner: false },
      { pubkey: ethVaultAta, isWritable: true, isSigner: false },
      { pubkey: new PublicKey(SOL_MINT), isWritable: false, isSigner: false },
      { pubkey: solVaultAta, isWritable: true, isSigner: false },
      { pubkey: new PublicKey(MOCK_ORACLE), isWritable: false, isSigner: false },
    ];

    // Only add strategy account if vault has a strategy configured
    if (hasStrategy) {
      const strategyAccount = await this.getStrategyAccountPDA(vaultPDA);
      remainingAccounts.push({ pubkey: strategyAccount, isWritable: true, isSigner: false });
    }

    // Get mSOL ATA for strategy (same as backend)
    const strategyAccount = hasStrategy ? await this.getStrategyAccountPDA(vaultPDA) : PublicKey.default;
    const msolAta = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(MSOL_MINT),
      strategyAccount,
      true
    );

    console.log(`[AnchorClient] Vault has strategy: ${hasStrategy}`);
    console.log(`[AnchorClient] Remaining accounts count: ${remainingAccounts.length}`);

    // Build transaction (exactly like backend)
    const tx = await program.methods
      .withdrawMultiAsset(vaultName, sharesBN)
      .accounts({
        vault: vaultPDA,
        user: userPublicKey,
        solReceiver: userPublicKey, // System-owned account for Marinade
        userSharesAta: userSharesATA,
        vaultTokenMint: vaultTokenMint,
        btcQuote: btcQuote,
        ethQuote: ethQuote,
        solQuote: solQuote,
        marinadeStrategyProgram: new PublicKey(MARINADE_STRATEGY_PROGRAM),
        marinadeProgram: new PublicKey(MARINADE_PROGRAM_ID),
        marinadeState: marinadeAccounts.marinadeState,
        msolMint: new PublicKey(MSOL_MINT),
        liqPoolMsolLeg: marinadeAccounts.liqPoolMsolLeg,
        liqPoolSolLegPda: marinadeAccounts.liqPoolSolLegPda,
        strategyMsolAta: msolAta,
        treasuryMsolAccount: marinadeAccounts.treasuryMsolAccount,
        clock: SYSVAR_CLOCK_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .remainingAccounts(remainingAccounts)
      .transaction();

    // Rest of transaction handling...
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.lastValidBlockHeight = lastValidBlockHeight;
    tx.feePayer = userPublicKey;

    const signedTx = await signTransaction(tx);
    const signature = await this.connection.sendRawTransaction(signedTx.serialize());

    await this.connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    return {
      success: true,
      txHash: signature,
      solReceived: shares, // Simplified - you'd calculate actual based on share price
    };

  } catch (error: any) {
    console.error("[AnchorClient] Withdrawal failed:", error);
    return { success: false, error: error.message || "Withdrawal failed" };
  }
}

  /**
   * Fetch vault account data
   */
  async fetchVaultData(
    vaultAdmin: PublicKey,
    vaultName: string,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<any> {
    try {
      const program = await this.initProgram(signTransaction);
      const [vaultPDA] = await this.getVaultPDA(vaultAdmin, vaultName);

      // Fetch the account data directly using connection
      const accountInfo = await this.connection.getAccountInfo(vaultPDA);

      if (!accountInfo) {
        throw new Error("Vault account not found");
      }

      // For now, return raw account data
      // You can deserialize this using Anchor's coder if needed
      return {
        address: vaultPDA.toString(),
        data: accountInfo.data,
        lamports: accountInfo.lamports,
        owner: accountInfo.owner.toString(),
      };
    } catch (error) {
      console.error("[AnchorClient] Failed to fetch vault data:", error);
      throw error;
    }
  }

  /**
   * Get connection for direct RPC calls
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
}

// Export singleton instance
export const anchorClient = new AnchorClientService();

