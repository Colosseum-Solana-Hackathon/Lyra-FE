"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function ConnectButton() {
  const { publicKey } = useWallet();

  return (
    <div className="flex items-center gap-3">
      <div className=" font-medium text-black hover:opacity-90 transition">
        <WalletMultiButton className="!bg-transparent !shadow-none !text-black !font-semibold !px-0 !py-0" />
      </div>

      {publicKey ? (
        <span className="rounded-md bg-emerald-900/40 px-3 py-1 text-sm font-medium text-emerald-400 border border-emerald-500/30">
          ✅ {publicKey.toBase58().slice(0, 4)}...
          {publicKey.toBase58().slice(-4)}
        </span>
      ) : (
        <span className="rounded-md bg-red-900/40 px-3 py-1 text-sm font-medium text-red-400 border border-red-500/30">
          Not Connected
        </span>
      )}
    </div>
  );
}



// "use client"

// import { Button } from "@/components/ui/button"
// import { useWallet } from "./wallet-provider"

// function short(addr: string) {
//   return addr.slice(0, 6) + "…" + addr.slice(-4)
// }

// export function ConnectButton() {
//   const { address, chainId, connect, disconnect, connecting } = useWallet()

//   if (!address)
//     return (
//       <Button className="btn-primary-lyra" onClick={connect} disabled={connecting}>
//         {connecting ? "Connecting…" : "Connect to a wallet"}
//       </Button>
//     )

//   return (
//     <div className="flex items-center gap-2">
//       <span className="rounded-md border border-border/60 bg-card px-2.5 py-1 text-xs text-muted-foreground">
//         Chain {chainId}
//       </span>
//       <Button variant="outline" onClick={disconnect} className="border-border/60 bg-transparent">
//         {short(address)}
//       </Button>
//     </div>
//   )
// }
