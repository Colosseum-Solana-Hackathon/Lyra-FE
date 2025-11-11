"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { apiClient } from "@/utils/apiClient";
import { WalletConnectionData, WalletConnectionResponse } from "@/lib/api";
import { NETWORK } from "@/lib/constants";

/**
 * Custom hook to track wallet connections and send data to backend
 * 
 * This hook automatically tracks when a wallet successfully connects and sends
 * essential data to the backend API including:
 * - Wallet address (public key)
 * - Wallet provider (Phantom, Solflare, etc.)
 * - Connection timestamp
 * - Network (mainnet/devnet)
 * - User agent
 * - Session ID
 */
export function useWalletTracking() {
  const { publicKey, wallet, connected, connecting, disconnecting } = useWallet();
  const hasTrackedRef = useRef(false);
  const lastPublicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track when wallet is fully connected (not just connecting)
    // Make sure we have a public key and we're not in a transitional state
    if (connected && publicKey && !connecting && !disconnecting) {
      const publicKeyString = publicKey.toString();
      
      // Prevent duplicate tracking for the same wallet in the same session
      if (hasTrackedRef.current && lastPublicKeyRef.current === publicKeyString) {
        return;
      }

      // Track the connection
      const trackConnection = async () => {
        try {
          // Get or create session ID
          let sessionId: string | undefined;
          if (typeof window !== "undefined") {
            sessionId = sessionStorage.getItem("wallet_session_id") || undefined;
            if (!sessionId) {
              sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
              sessionStorage.setItem("wallet_session_id", sessionId);
            }
          }

          const walletData: WalletConnectionData = {
            walletAddress: publicKeyString,
            walletProvider: wallet?.adapter?.name || "Unknown",
            connectedAt: new Date().toISOString(),
            network: NETWORK || (process.env.NEXT_PUBLIC_ENV === "production" ? "mainnet-beta" : "devnet"),
            userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
            sessionId,
          };

          console.log("Tracking wallet connection:", walletData);
          
          // Use apiClient for unauthenticated request (wallet connection doesn't require auth)
          const response = await apiClient.requestPublic<WalletConnectionResponse>(
            "/api/wallet/connect",
            {
              method: "POST",
              body: JSON.stringify(walletData),
            }
          );
          console.log("Wallet connection tracked successfully:", response);
          
          // Mark as tracked to prevent duplicates
          hasTrackedRef.current = true;
          lastPublicKeyRef.current = publicKeyString;
        } catch (error) {
          console.error("Failed to track wallet connection:", error);
          // Don't throw - we don't want to break the app if tracking fails
          // The error is logged for debugging purposes
        }
      };

      trackConnection();
    }

    // Reset tracking when wallet disconnects
    if (!connected && !connecting) {
      hasTrackedRef.current = false;
      lastPublicKeyRef.current = null;
    }
  }, [connected, publicKey, wallet, connecting, disconnecting]);
}
