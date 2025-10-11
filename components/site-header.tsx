"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import  ConnectButton from "@/components/wallet/connect-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/lyra-logo.png" alt="Lyra logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="text-xl font-bold">Lyra</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/onramp" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            OnRamp
          </Link>
          <Link href="/swap" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Swap
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/earn" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Earn
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden rounded-full px-3 py-1.5 text-xs badge-status md:inline">SOL ETF • Live</span>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
