"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { Transaction, SystemProgram, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { getBasicJupiterTokens, getJupiterOrder, postJupiterExecute } from "@/lib/api";
import { type Token } from "@/lib/tokens";
import { TokenSelectDialog } from "./token-select-dialog";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection } from "@solana/wallet-adapter-react";

type JupToken = {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
  isVerified?: boolean;
  usdPrice?: number;
};

const WSOL = "So11111111111111111111111111111111111111112";
const LAST_FROM_KEY = "swap:lastFromSymbol";
const LAST_TO_KEY = "swap:lastToSymbol";
const spotlightTokens = ["SOL", "USDC", "USDT", "JUP"];
function mintFor(t: Token) {
  if (!t.address || t.symbol.toUpperCase() === "SOL") return WSOL;
  return t.address;
}

function toAtomic(amount: string, decimals?: number) {
  const d = decimals ?? 6;
  const n = Number(amount);
  if (!isFinite(n) || n <= 0) return null;
  return Math.round(n * 10 ** d).toString();
}

function fromAtomic(amount: string | number, decimals?: number) {
  const d = decimals ?? 6;
  const v = typeof amount === "string" ? Number(amount) : amount;
  if (!isFinite(v)) return "0";
  return (v / 10 ** d).toString();
}

// const JUP_VERIFIED_URL = "https://lite-api.jup.ag/tokens/v2/tag?query=verified";

export function SwapCard() {
  const PLACEHOLDER: Token = {
    symbol: "—",
    name: "Loading…",
    address: "",
    icon: "/placeholder.svg",
    network: "Solana",
    archived: false,
    decimals: 0,
  };

  const [fromToken, setFromToken] = useState<Token>(PLACEHOLDER);
  const [toToken, setToToken] = useState<Token>(PLACEHOLDER);
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [openFor, setOpenFor] = useState<"from" | "to" | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteErr, setQuoteErr] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [signedTransaction, setSignedTransaction] = useState<string | null>(null);

  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);
  const [hasSufficientBalance, setHasSufficientBalance] = useState<boolean>(false);

  const { publicKey, connected, signTransaction, signMessage } = useWallet();
  const { connection } = useConnection();

  const [fromBalance, setFromBalance] = useState<number | null>(null);
  const [toBalance, setToBalance] = useState<number | null>(null);
  const [basicTokens, setBasicTokens] = useState<Token[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const resp = await getBasicJupiterTokens({ symbols: "SOL,USDT" });
        const mapped: Token[] = resp.data.map((t: any) => ({
          symbol: t.symbol,
          name: t.name,
          address: t.address,
          icon: t.icon,
          network: "Solana",
          archived: false,
          badge: t.badge,
          decimals: t.decimals,
          priceUsd: t.priceUsd,
        }));

        setBasicTokens(mapped);

        const savedFromSymbol = localStorage.getItem(LAST_FROM_KEY);
        const savedToSymbol = localStorage.getItem(LAST_TO_KEY);

        const bySym = (s: string | null) =>
          s ? mapped.find((x) => x.symbol.toUpperCase() === s.toUpperCase()) : null;

        const defaultFrom = bySym("SOL") ?? mapped[0] ?? PLACEHOLDER;
        const defaultTo = bySym("USDT") ?? mapped.find((x) => x.symbol.toUpperCase() !== defaultFrom.symbol.toUpperCase()) ?? mapped[1] ?? PLACEHOLDER;

        const fromToken = bySym(savedFromSymbol) ?? defaultFrom;
        const toToken = bySym(savedToSymbol) ?? (fromToken.symbol.toUpperCase() === defaultTo.symbol.toUpperCase() ? mapped[1] ?? defaultTo : defaultTo);

        setFromToken(fromToken);
        setToToken(toToken);
      } catch (e: any) {
        if (!ac.signal.aborted) console.error("Failed to load basic tokens:", e?.message);
        setFromToken(PLACEHOLDER);
        setToToken(PLACEHOLDER);
      }
    })();
    return () => ac.abort();
  }, []);
  //uncomment to get previous working one
  // useEffect(() => {
  //   const ac = new AbortController();
  //   (async () => {
  //     try {
  //       const resp = await getBasicJupiterTokens();
  //       const mapped: Token[] = resp.data.map((t: any) => ({
  //         symbol: t.symbol,
  //         name: t.name,
  //         address: t.address,
  //         icon: t.icon,
  //         network: "Solana",
  //         archived: false,
  //         badge: t.badge,
  //         decimals: t.decimals,
  //         priceUsd: t.priceUsd,
  //       }));

  //       const bySym = (s: string) => mapped.find((x) => x.symbol.toUpperCase() === s.toUpperCase());
  //       const sol = bySym("SOL") ?? mapped[0];
  //       const usdt = bySym("USDT") ?? mapped.find((x) => x.symbol.toUpperCase() !== sol?.symbol.toUpperCase()) ?? mapped[1];

  //       setFromToken(sol ?? PLACEHOLDER);
  //       setToToken(usdt ?? PLACEHOLDER);
  //     } catch (e: any) {
  //       if (!ac.signal.aborted) console.error("Failed to load basic tokens:", e?.message);
  //     }
  //   })();
  //   return () => ac.abort();
  // }, []);
  // Fetch balances dynamically
  // useEffect(() => {
  //   async function fetchBalances() {
  //     if (!publicKey || !connected) {
  //       setFromBalance(null);
  //       setToBalance(null);
  //       setHasSufficientBalance(false);
  //       return;
  //     }
  //     try {
  //       // Fetch SOL balance
  //       if (fromToken.symbol.toUpperCase() === "SOL" || mintFor(fromToken) === WSOL) {
  //         const balanceLamports = await connection.getBalance(publicKey);
  //         const solBalance = balanceLamports / 1e9;
  //         setFromBalance(solBalance);

  //         // Check if balance is sufficient
  //         const amount = Number(amountFrom);
  //         if (isFinite(amount) && amount > 0) {
  //           setHasSufficientBalance(solBalance >= amount);
  //         } else {
  //           setHasSufficientBalance(false);
  //         }
  //       } else {
  //         // Fetch SPL token balance (requires token account)
  //         const tokenMint = new PublicKey(mintFor(fromToken));
  //         const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
  //           mint: tokenMint,
  //         });
  //         const balance = tokenAccounts.value.reduce(
  //           (sum, acc) => sum + acc.account.data.parsed.info.tokenAmount.uiAmount,
  //           0
  //         );
  //         setFromBalance(balance);

  //         // Check if balance is sufficient
  //         const amount = Number(amountFrom);
  //         if (isFinite(amount) && amount > 0) {
  //           setHasSufficientBalance(balance >= amount);
  //         } else {
  //           setHasSufficientBalance(false);
  //         }
  //       }

  //       setToBalance(null); // Add SPL token balance fetching for toToken if needed
  //     } catch (err) {
  //       console.error("Error fetching balance:", err);
  //       setFromBalance(null);
  //       setHasSufficientBalance(false);
  //     }
  //   }
  //   fetchBalances();
  // }, [publicKey, connected, connection, fromToken, amountFrom]);
useEffect(() => {
  async function fetchBalances() {
    if (!publicKey || !connected) {
      setFromBalance(null);
      setToBalance(null);
      setHasSufficientBalance(false);
      return;
    }
    try {
      // Fetch balance for fromToken
      let fromBalanceValue: number | null = null;
      if (fromToken.address && (fromToken.symbol.toUpperCase() === "SOL" || mintFor(fromToken) === WSOL)) {
        const balanceLamports = await connection.getBalance(publicKey);
        fromBalanceValue = balanceLamports / 1e9;
      } else if (fromToken.address) {
        try {
          const tokenMint = new PublicKey(mintFor(fromToken));
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: tokenMint,
          });
          fromBalanceValue = tokenAccounts.value.reduce(
            (sum, acc) => sum + acc.account.data.parsed.info.tokenAmount.uiAmount,
            0
          );
        } catch (err) {
          console.warn(`No token account found for ${fromToken.symbol}:`, err);
          fromBalanceValue = 0;
        }
      }
      setFromBalance(fromBalanceValue);

      // Check if balance is sufficient
      const amount = Number(amountFrom);
      if (isFinite(amount) && amount > 0) {
        setHasSufficientBalance(fromBalanceValue !== null && fromBalanceValue >= amount);
      } else {
        setHasSufficientBalance(false);
      }

      // Fetch balance for toToken
      let toBalanceValue: number | null = null;
      if (toToken.address && (toToken.symbol.toUpperCase() === "SOL" || mintFor(toToken) === WSOL)) {
        const balanceLamports = await connection.getBalance(publicKey);
        toBalanceValue = balanceLamports / 1e9;
      } else if (toToken.address) {
        try {
          const tokenMint = new PublicKey(mintFor(toToken));
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: tokenMint,
          });
          toBalanceValue = tokenAccounts.value.reduce(
            (sum, acc) => sum + acc.account.data.parsed.info.tokenAmount.uiAmount,
            0
          );
        } catch (err) {
          console.warn(`No token account found for ${toToken.symbol}:`, err);
          toBalanceValue = 0;
        }
      }
      setToBalance(toBalanceValue);
    } catch (err) {
      console.error("Error fetching balances:", err);
      setFromBalance(null);
      setToBalance(null);
      setHasSufficientBalance(false);
    }
  }
  fetchBalances();
}, [publicKey, connected, connection, fromToken, toToken, amountFrom]);
  // Fetch quote and store requestId
  // useEffect(() => {
  //   setRequestId(null);
  //   setSignedTransaction(null);
  //   setQuoteErr(null);
  //   setAmountTo("");

  //   if (!amountFrom || !fromToken || !toToken) return;

  //   const inputMint = mintFor(fromToken);
  //   const outputMint = mintFor(toToken);
  //   const atomic = toAtomic(amountFrom, fromToken.decimals);
  //   if (!atomic) return;

  //   const controller = new AbortController();

  //   (async () => {
  //     try {
  //       setQuoteLoading(true);
  //       setQuoteErr(null);

  //       const data = await getJupiterOrder(
  //         {
  //           inputMint,
  //           outputMint,
  //           amount: atomic,
  //         },
  //         { signal: controller.signal }
  //       );

  //       const outAmount =
  //         data?.outAmount ??
  //         data?.outAmountMin ??
  //         data?.routePlan?.[0]?.swapInfo?.outAmount ??
  //         null;

  //       if (!outAmount) {
  //         setQuoteErr("No route found");
  //         setAmountTo("");
  //         return;
  //       }

  //       setAmountTo(fromAtomic(outAmount, toToken.decimals));
  //       setRequestId(data.requestId);
  //       console.log("Quote fetched:", { requestId: data.requestId });
  //     } catch (e: any) {
  //       if (!controller.signal.aborted) {
  //         setQuoteErr(e?.message ?? "Failed to fetch quote");
  //         setAmountTo("");
  //       }
  //     } finally {
  //       if (!controller.signal.aborted) setQuoteLoading(false);
  //     }
  //   })();

  //   return () => controller.abort();
  // }, [amountFrom, fromToken, toToken]);
useEffect(() => {
  setRequestId(null);
  setSignedTransaction(null);
  setQuoteErr(null);
  setAmountTo("");

  if (!amountFrom || !fromToken.address || !toToken.address || fromToken === PLACEHOLDER || toToken === PLACEHOLDER) {
    setQuoteErr("Please select valid tokens");
    return;
  }

  const inputMint = mintFor(fromToken);
  const outputMint = mintFor(toToken);
  const atomic = toAtomic(amountFrom, fromToken.decimals);
  if (!atomic) {
    setQuoteErr("Invalid amount entered");
    return;
  }

  const controller = new AbortController();

  (async () => {
    try {
      setQuoteLoading(true);
      setQuoteErr(null);

      const data = await getJupiterOrder(
        {
          inputMint,
          outputMint,
          amount: atomic,
        },
        { signal: controller.signal }
      );

      const outAmount =
        data?.outAmount ??
        data?.outAmountMin ??
        data?.routePlan?.[0]?.swapInfo?.outAmount ??
        null;

      if (!outAmount) {
        setQuoteErr("No route found");
        setAmountTo("");
        return;
      }

      setAmountTo(fromAtomic(outAmount, toToken.decimals));
      setRequestId(data.requestId);
      console.log("Quote fetched:", { requestId: data.requestId, inputMint, outputMint, amount: atomic });
    } catch (e: any) {
      if (!controller.signal.aborted) {
        setQuoteErr(e?.message ?? "Failed to fetch quote");
        setAmountTo("");
        console.error("Quote fetch error:", e?.message, { inputMint, outputMint, amount: atomic });
      }
    } finally {
      if (!controller.signal.aborted) setQuoteLoading(false);
    }
  })();

  return () => controller.abort();
}, [amountFrom, fromToken, toToken]);
  async function handleSwap() {
    if (!connected || !publicKey || !signTransaction) {
      alert("Please connect your wallet to proceed.");
      return;
    }

    if (!requestId) {
      alert("No valid quote available. Please try again.");
      return;
    }

    if (!hasSufficientBalance) {
      alert("Insufficient balance for this swap.");
      return;
    }

    try {
      setSwapLoading(true);
      setSwapError(null);

      // Option 1: Sign a minimal transaction (recommended for Solana swaps)
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // No-op transfer to self
          lamports: 0,
        })
      );
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      const signedTx = await signTransaction(tx);
      const signedTxBase64 = signedTx.serialize().toString("base64");
      setSignedTransaction(signedTxBase64);
      console.log("Signed transaction:", signedTxBase64);

      // Option 2: Sign a message (if backend supports it)
      /*
      const message = new TextEncoder().encode(`Swap request: ${requestId}`);
      const signature = await signMessage(message);
      const signedTxBase64 = Buffer.from(signature).toString("base64");
      setSignedTransaction(signedTxBase64);
      console.log("Signed message:", signedTxBase64);
      */

      // Send to backend
      const result = await postJupiterExecute({
        signedTransaction: signedTxBase64,
        requestId,
      });

      console.log("Swap executed successfully:", result);
      setAmountFrom("");
      setAmountTo("");
      setRequestId(null);
      setSignedTransaction(null);
    } catch (e: any) {
      console.error("Swap failed:", e);
      const errorMessage =
        e.name === "WalletSignTransactionError"
          ? "Transaction rejected by wallet"
          : e.message ?? "Swap failed";
      setSwapError(errorMessage);
    } finally {
      setSwapLoading(false);
    }
  }

  const switchTokens = () => {
    const a = fromToken;
    setFromToken(toToken);
    setToToken(a);
    setAmountFrom(amountTo);
    setAmountTo(amountFrom);
  };

  const balanceHint = (t: Token, bal: number | null) => {
    if (!connected) return "Connect wallet to see balance";
    if (bal === null) return "—";
    return `Balance: ${bal.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${t.symbol}`;
  };

  return (

    <Card className="w-full border-border/60 bg-card shadow-xl shadow-primary/5">
      <CardHeader className="pb-6">
        <CardTitle className="text-center text-2xl font-semibold tracking-tight lg:text-3xl">
          Swap
        </CardTitle>
        <Separator className="mx-auto mt-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 lg:p-5 transition-all duration-200 hover:border-primary/70 focus-within:border-primary">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpenFor("from")}
              className="group inline-flex select-none items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              aria-label={`Select ${fromToken.symbol} as source token`}>
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

        <div className="flex justify-center -my-2">
          <button
            onClick={switchTokens}
            className="group inline-flex items-center justify-center rounded-full bg-muted p-2 border border-border/60 
               hover:bg-primary/10 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Switch tokens"
          >
            <RefreshCcw className="size-5 text-primary transition-transform duration-300 group-hover:rotate-180" />
          </button>
        </div>

        {/* <TokenSelectDialog
          open={!!openFor}
          onOpenChange={(open) => !open && setOpenFor(null)}
          onSelect={(token) => {
            if (openFor === "from") {
              setFromToken(token);
              localStorage.setItem(LAST_FROM_KEY, mintFor(token));
            } else if (openFor === "to") {
              setToToken(token);
              localStorage.setItem(LAST_TO_KEY, mintFor(token));
            }
            setOpenFor(null);
          }}
          spotlight={spotlightTokens}
        /> */}
        <TokenSelectDialog
          open={!!openFor}
          onOpenChange={(open) => !open && setOpenFor(null)}
          onSelect={(token) => {
            if (openFor === "from") {
              setFromToken(token);
              localStorage.setItem(LAST_FROM_KEY, token.symbol);
              if (!basicTokens.some((t) => t.symbol.toUpperCase() === token.symbol.toUpperCase())) {
                setBasicTokens((prev) => [...prev, token]);
              }
            } else if (openFor === "to") {
              setToToken(token);
              localStorage.setItem(LAST_TO_KEY, token.symbol);
              if (!basicTokens.some((t) => t.symbol.toUpperCase() === token.symbol.toUpperCase())) {
                setBasicTokens((prev) => [...prev, token]);
              }
            }
            setOpenFor(null);
          }}
          spotlight={spotlightTokens}
        />
        <div className="rounded-xl border border-border/60 bg-muted/10 p-4 lg:p-5 transition-all duration-200 hover:border-primary/70 focus-within:border-primary">
          <div className="flex items-center  gap-4">
            <button
              onClick={() => setOpenFor("to")}
              className="group inline-flex select-none items-center gap-2 rounded-lg border border-border/60 bg-card px-4 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
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
                // className="text-right text-2xl lg:text-3xl"
                className="text-right text-2xl lg:text-3xl bg-transparent border-none focus:outline-none focus:ring-0"

              />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground lg:text-base">
            {quoteLoading
              ? "Fetching best route…"
              : quoteErr
                ? `Quote error: ${quoteErr}`
                : balanceHint(toToken, toBalance)}
          </p>
        </div>

        {!connected ? (
          <WalletMultiButton className="w-full btn-primary-lyra text-base lg:text-lg py-6" />
        ) : (
          <Button
            className="w-full btn-primary-lyra text-base lg:text-lg py-6"
            onClick={handleSwap}
            disabled={swapLoading || !connected || !requestId || !hasSufficientBalance}
          >
            {swapLoading ? "Swapping..." : "Swap"}
          </Button>
        )}
        {swapError && (
          <p className="mt-2 text-sm text-red-500 text-center">{swapError}</p>
        )}
      </CardContent>
    </Card>
  );
}