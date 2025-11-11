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
import { useWalletTracking } from "@/hooks/use-wallet-tracking";

// Import default wallet button styles
import "@solana/wallet-adapter-react-ui/styles.css";

// Component to handle wallet tracking
function WalletTracker() {
  useWalletTracking();
  return null;
}

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
        <WalletModalProvider>
          <WalletTracker />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

