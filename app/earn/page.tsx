// app/earn/page.tsx
import { SiteHeader } from "@/components/site-header";
import { VaultTile } from "@/components/earn/vault-tile";

export default function EarnPage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="lyra-gradient lyra-grid-overlay">
        <SiteHeader />
        <section className="px-6 py-10 lg:py-14">
          <div className="mx-auto max-w-6xl">
            <header className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Earn</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Deposit into the ETF vault and earn yield from rebalancing & fees.
              </p>
            </header>

            <div className="grid gap-6">
              <VaultTile />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
