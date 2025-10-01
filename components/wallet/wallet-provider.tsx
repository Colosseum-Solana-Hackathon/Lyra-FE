// src/providers/WalletProvider.tsx
"use client";

import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  // BackpackWalletAdapter,
  // SolletExtensionWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Import default wallet button styles
import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // RPC endpoint (use mainnet-beta or devnet)
  const endpoint = "https://api.devnet.solana.com";

  // Supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // new SolflareWalletAdapter({ network: "devnet" }),
      // new BackpackWalletAdapter(),
      // new SolletExtensionWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

