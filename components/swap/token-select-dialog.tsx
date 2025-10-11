"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import type { Token } from "@/lib/tokens"
import { cn } from "@/lib/utils"
import { getJupiterTokens, getJupiterTokensSearch } from "@/lib/api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (t: Token) => void
  tokens?: Token[]
  spotlight?: string[]
}
type JupToken = {
  id: string
  name: string
  symbol: string
  icon?: string
  decimals: number
  isVerified?: boolean
  usdPrice?: number
}

// const JUP_VERIFIED_URL =
//   "https://lite-api.jup.ag/tokens/v2/toptrending/24h?limit=10"

export function TokenSelectDialog({ open, onOpenChange, onSelect, tokens, spotlight = [] }: Props) {
  const [q, setQ] = React.useState("")
  const [tab, setTab] = React.useState<"active" | "archived">("active")
  const [remote, setRemote] = React.useState<Token[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const source: Token[] = (tokens && tokens.length > 0) ? tokens : remote
  const list = React.useMemo(() => {
  return tab === "active" ? source.filter((t) => !t.archived) : source.filter((t) => t.archived);
}, [source, tab]);

  const spotlightTokens = source.filter((t) => spotlight.includes(t.symbol))
  React.useEffect(() => {
  if (!open) return;
  if (tokens && tokens.length > 0) return; // parent provided tokens; skip fetching

  const ac = new AbortController();
  (async () => {
    try {
      setLoading(true);
      setError(null);
      const data = q
        ? await getJupiterTokensSearch({ q, page, limit })
        : await getJupiterTokens({ page, limit });
      const mapped: Token[] = data.tokens.map((t) => ({
        symbol: t.symbol,
        name: t.name,
        address: t.id,
        icon: t.icon,
        network: t.network ?? "Solana",
        archived: t.archived ?? false,
        badge: t.badge ?? (t.isVerified ? "Verified" : undefined),
        decimals: t.decimals,
        priceUsd: t.usdPrice,
      }));
      setRemote(mapped);
    } catch (e: any) {
      if (!ac.signal.aborted) setError(e?.message ?? "Failed to load tokens");
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  })();

  return () => ac.abort();
}, [open, tokens?.length, page, limit, q]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-lg gap-0 border-border/60 bg-card p-0", "shadow-2xl ring-1 ring-(--lyra-primary)/10")}
      >
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 p-4">
          <DialogTitle className="text-xl font-semibold">Select a token</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="p-4">
          <Input placeholder="Search name or paste address" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {spotlightTokens.length > 0 && (
          <div className="px-4">
            <p className="mb-2 text-xs text-muted-foreground">Spotlight</p>
            <div className="flex flex-wrap gap-2">
              {spotlightTokens.map((t) => (
                <button
                  type="button"
                  // key={t.symbol}
                  key={`${t.symbol}-${t.address}`}

                  onClick={() => onSelect(t)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 hover:bg-accent"
                >
                  <img alt={t.name} src={t.icon || "/placeholder.svg"} className="size-5 rounded-full" />
                  <span className="text-sm font-medium">{t.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="my-4 px-4">
          <Separator />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          {/* <TabsContent value="active" className="mt-4">
            <TokenList items={list} onSelect={onSelect} />
          </TabsContent> */}
          <TabsContent value="active" className="mt-4">
            <TokenList items={list} onSelect={onSelect} loading={loading} error={error} />
          </TabsContent>
          {/* <TabsContent value="archived" className="mt-4">
            <TokenList items={list} onSelect={onSelect} emptyHint="No archived tokens match." />
          </TabsContent> */}
          <TabsContent value="archived" className="mt-4">
            <TokenList items={list} onSelect={onSelect} emptyHint="No archived tokens match." loading={loading} error={error} />
          </TabsContent>

        </Tabs>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tokens per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to first page when limit changes
              }}
              className="rounded border border-border/60 bg-card px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={remote.length < limit || loading}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <div className="text-xs text-muted-foreground">Manage token lists in settings</div>
          <Button variant="link" className="px-0">
            Manage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TokenList({
  items,
  onSelect,
  emptyHint = "No results.",
  loading,
  error,
}: {
  items: Token[]
  onSelect: (t: Token) => void
  emptyHint?: string,
  loading?: boolean,
  error?: string | null,
  decimals?: number
  priceUsd?: number
}) {
  return (
    <ScrollArea className="h-[320px] rounded-lg border border-border/60">
      <ul className="divide-y divide-border/60">
        {/* {items.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">{emptyHint}</li>}
        {items.map((t) => ( */}
        {loading && <li className="p-6 text-center text-sm text-muted-foreground">Loading tokens…</li>}
        {!!error && <li className="p-6 text-center text-sm text-red-500">Error: {error}</li>}
        {!loading && !error && items.length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">{emptyHint}</li>
        )}
        {!loading && !error && items.map((t) => (
          // <li key={t.symbol}>
          <li key={`${t.symbol}-${t.address}`}>
            <button
              type="button"
              onClick={() => onSelect(t)}
              className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-accent"
            >
              <img alt={t.name} src={t.icon || "/placeholder.svg"} className="size-8 rounded-full" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{t.symbol}</span>
                  {t.badge && (
                    <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 text-[10px]">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{t.name}</p>
              </div>
              {/* <span className="ml-auto text-xs text-muted-foreground">{t.network}</span> */}
              <div className="ml-auto text-right">
                {/* optional if you mapped priceUsd above */}
                {typeof (t as any).priceUsd === "number" && (
                  <div className="text-xs font-medium">${(t as any).priceUsd.toFixed(4)}</div>
                )}
                <div className="text-xs text-muted-foreground">{t.network}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
