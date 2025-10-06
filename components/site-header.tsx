"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import  ConnectButton from "@/components/wallet/connect-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className={cn("size-8 rounded-full bg-primary ring-2 ring-primary/40 shadow-lg shadow-primary/30")} />
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
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden rounded-full px-3 py-1.5 text-xs badge-status md:inline">SOL ETF • Live</span>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
