"use client";
import { useWallet } from "@solana/wallet-adapter-react";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from 'next/dynamic';
import "@solana/wallet-adapter-react-ui/styles.css";

export default function ConnectButton() {
  const { publicKey } = useWallet();
  const WalletMultiButtonDynamic = dynamic(
    async()=> 
    (await import ('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    {ssr:false}
  )
  return (
    <div className="flex items-center gap-3">
      <div className=" font-medium text-black hover:opacity-90 transition">
        <WalletMultiButtonDynamic className="!bg-transparent !shadow-none !text-black !font-semibold !px-0 !py-0" />
      </div>
    </div>
  );
}
