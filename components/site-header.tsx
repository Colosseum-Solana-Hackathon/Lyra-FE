"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import  ConnectButton from "@/components/wallet/connect-button"

export function SiteHeader() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/onramp", label: "OnRamp" },
    { href: "/swap", label: "Swap" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/earn", label: "Earn" },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/images/lyra-logo.png" alt="Lyra logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-bold">Lyra</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden rounded-full px-3 py-1.5 text-xs badge-status md:inline">SOL ETF • Live</span>
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
