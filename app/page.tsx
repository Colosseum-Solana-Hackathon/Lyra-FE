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
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/30">
                  <Zap className="size-4" />
                  Break Free From TradFi Markets
                </div>

                <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Finance ETFs on Solana with {" "}
                  <span className="bg-gradient-to-r from-primary to-[var(--lyra-accent)] bg-clip-text text-transparent">
                    Lyra
                  </span>
                </h1>
                <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
                  Lyra provides <span className="text-green-500 font-semibold">institutional-grade ETF exposure</span> to DeFi on <span className="text-green-500 font-semibold">Solana</span>.
                  Trade, swap, and manage your crypto effortlessly with <span className="text-green-500 font-semibold">diversified,</span>  yield-generating vaults and <span className="text-green-500 font-semibold">seamless onramps</span>.
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
                    alt="Solana ETF Trading Platform - Advanced DeFi Interface"
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
