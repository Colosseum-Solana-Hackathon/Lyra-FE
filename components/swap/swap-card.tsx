"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, RefreshCcw } from "lucide-react"
import { type Token, TOKENS, findTokenBySymbol } from "@/lib/tokens"
import { TokenSelectDialog } from "./token-select-dialog"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useConnection } from "@solana/wallet-adapter-react"

export function SwapCard() {
  const [fromToken, setFromToken] = useState<Token>(findTokenBySymbol("USDC")!) 
  const [toToken, setToToken] = useState<Token>(findTokenBySymbol("USDC")!)
  const [amountFrom, setAmountFrom] = useState("")
  const [amountTo, setAmountTo] = useState("")
  const [openFor, setOpenFor] = useState<"from" | "to" | null>(null)

  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()

  const [fromBalance, setFromBalance] = useState<number | null>(null)
  const [toBalance, setToBalance] = useState<number | null>(null)

  useMemo(() => {
    async function fetchBalances() {
      if (!publicKey) return
      try {
        const balanceLamports = await connection.getBalance(publicKey)
        const solBalance = balanceLamports / 1e9
        setFromBalance(solBalance)

        setToBalance(null)
      } catch (err) {
        console.error("Error fetching balance:", err)
      }
    }
    if (connected) fetchBalances()
  }, [publicKey, connected, connection, fromToken, toToken])

  const title = useMemo(() => "Swap", [])

  const onSelect = (t: Token) => {
    if (openFor === "from") setFromToken(t)
    if (openFor === "to") setToToken(t)
    setOpenFor(null)
  }

  const switchTokens = () => {
    const a = fromToken
    setFromToken(toToken)
    setToToken(a)
    setAmountFrom(amountTo)
    setAmountTo(amountFrom)
  }

  const balanceHint = (t: Token, bal: number | null) => {
    if (!connected) return "Connect wallet to see balance"
    if (bal === null) return "—"
    return `Balance: ${bal.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${t.symbol}`
  }

  return (
    <>
      <Card className="w-full border-border/60 bg-card shadow-xl shadow-primary/5">
        <CardHeader className="pb-6">
          <CardTitle className="text-center text-2xl font-semibold tracking-tight lg:text-3xl">{title}</CardTitle>
          <Separator className="mx-auto mt-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 lg:p-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpenFor("from")}
                className="group inline-flex select-none items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 hover:bg-accent lg:px-5 lg:py-3.5"
                aria-label="Change source token"
              >
                <img
                  alt={fromToken.name}
                  src={fromToken.icon || "/placeholder.svg"}
                  className="size-7 rounded-full lg:size-8"
                />
                <span className="text-base font-medium lg:text-lg">{fromToken.symbol}</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-aria-expanded:rotate-180 lg:size-5" />
              </button>

              <div className="ml-auto w-[55%]">
                <Input
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amountFrom}
                  onChange={(e) => setAmountFrom(e.target.value)}
                  className="text-right text-2xl lg:text-3xl"
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground lg:text-base">
              {balanceHint(fromToken, fromBalance)}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={switchTokens}
              className="inline-flex items-center justify-center rounded-full border border-border/60 p-3 hover:bg-accent lg:p-3.5"
              aria-label="Switch tokens"
            >
              <RefreshCcw className="size-5 lg:size-6" />
            </button>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 lg:p-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpenFor("to")}
                className="group inline-flex select-none items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 hover:bg-accent lg:px-5 lg:py-3.5"
                aria-label="Change destination token"
              >
                <img
                  alt={toToken.name}
                  src={toToken.icon || "/placeholder.svg"}
                  className="size-7 rounded-full lg:size-8"
                />
                <span className="text-base font-medium lg:text-lg">{toToken.symbol}</span>
                <ChevronDown className="size-4 text-muted-foreground transition-transform group-aria-expanded:rotate-180 lg:size-5" />
              </button>

              <div className="ml-auto w-[55%]">
                <Input
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amountTo}
                  onChange={(e) => setAmountTo(e.target.value)}
                  className="text-right text-2xl lg:text-3xl"
                />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground lg:text-base">
              {balanceHint(toToken, toBalance)}
            </p>
          </div>

          {!connected ? (
            <WalletMultiButton className="w-full btn-primary-lyra text-base lg:text-lg py-6" />
          ) : (
            <Button className="w-full btn-primary-lyra text-base lg:text-lg py-6">Swap (demo)</Button>
          )}
        </CardContent>
      </Card>

      <TokenSelectDialog
        open={openFor !== null}
        onOpenChange={(v) => !v && setOpenFor(null)}
        onSelect={onSelect}
        tokens={TOKENS}
        spotlight={["SOL", "USDC"]}
      />
    </>
  )
}

