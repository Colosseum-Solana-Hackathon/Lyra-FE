import { SiteHeader } from "@/components/site-header"
import { SwapCard } from "@/components/swap/swap-card"

export default function SwapPage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="lyra-gradient lyra-grid-overlay">
        <SiteHeader />
        <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            <h1 className="mb-8 text-center text-3xl font-bold lg:text-4xl">Swap Tokens</h1>
            <SwapCard />
          </div>
        </div>
      </div>
    </main>
  )
}
