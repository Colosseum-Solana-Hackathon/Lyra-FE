import { SiteHeader } from "@/components/site-header"

export default function DashboardPage() {
  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          This is a placeholder dashboard. Connect wallet gating can be added later.
        </p>
      </div>
    </main>
  )
}
