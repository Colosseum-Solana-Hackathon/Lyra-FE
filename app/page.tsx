import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { TrendingUp, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="lyra-gradient lyra-grid-overlay">
        <SiteHeader />
        <section className="relative">
          <div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32 lg:pt-32">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center gap-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  <Zap className="size-4" />
                  Solana-Based ETF Platform
                </div>
                <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Invest in the Future of{" "}
                  <span className="bg-gradient-to-r from-primary to-[var(--lyra-accent)] bg-clip-text text-transparent">
                    Solana
                  </span>
                </h1>
                <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
                  Lyra brings institutional-grade Solana ETF exposure to DeFi. Trade, swap, and manage your SOL-based
                  portfolio with cutting-edge web3 infrastructure.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="lg" asChild className="btn-primary-lyra">
                    <Link href="/swap">Start Trading</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </div>

                <div className="grid gap-6 pt-8 sm:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <TrendingUp className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Real-Time Pricing</h3>
                      <p className="text-sm text-muted-foreground">Live SOL market data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Shield className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure & Audited</h3>
                      <p className="text-sm text-muted-foreground">Battle-tested contracts</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Zap className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Lightning Fast</h3>
                      <p className="text-sm text-muted-foreground">Powered by Solana</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-lg">
                  <img
                    src="/futuristic-solana-blockchain-network-visualization.jpg"
                    alt="Solana ETF Network Visualization"
                    className="rounded-2xl border border-primary/20 shadow-2xl shadow-primary/20"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
