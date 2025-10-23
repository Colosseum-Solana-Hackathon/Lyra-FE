"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // if you don't have one, replace with a div + w-[%]
import { cn } from "@/lib/utils";
import { ArrowUpRight, TrendingDown } from "lucide-react";
import { DepositModal } from "./deposit-modal";
import { WithdrawModal } from "./withdraw-modal";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";


/** ----- THEME HINTS -----
 * - Keeps your lyra look: soft borders, subtle shadows, rounded-2xl, muted surfaces
 * - Recharts uses current CSS variables for colors; we set fills per slice but keep brand-neutral.
 */
type CumPoint = { t: string; total: number };

/**
 * Keeps a rolling time series of the vault's cumulative value.
 * Appends a new point whenever vaultValue changes (≈ every price poll).
 * Uses a light random-walk so it feels alive between updates.
 */
function useCumulativeSeries(
    currentTotal: number,
    opts: { points?: number; drift?: number; pollMs?: number } = {}
) {
    const points = opts.points ?? 40;
    const drift = opts.drift ?? 0.008; // ±0.8% variance between points
    const [data, setData] = useState<CumPoint[]>([]);

    // seed once on mount
    useEffect(() => {
        let v = currentTotal;
        const now = Date.now();
        const seeded: CumPoint[] = [];
        for (let i = points - 1; i >= 0; i--) {
            const ts = new Date(now - i * 8_000).toLocaleTimeString(undefined, {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
            // walk backwards so the seed looks organic
            v = Math.max(1, v * (1 + (Math.random() - 0.5) * drift));
            seeded.push({ t: ts, total: v });
        }
        setData(seeded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // append on each new currentTotal
    useEffect(() => {
        setData((prev) => {
            const last = prev[prev.length - 1]?.total ?? currentTotal;
            const nextVal = Math.max(1, last * (1 + (Math.random() - 0.5) * drift));
            const ts = new Date().toLocaleTimeString(undefined, {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
            });
            const next = [...prev, { t: ts, total: nextVal }];
            return next.slice(-points);
        });
    }, [currentTotal, drift, points]);

    return data;
}

// Static vault composition (can be props later)
// Static vault composition (can be props later)
// ---- Assets enum + metadata ----
export enum Asset {
    BTC = "BTC",
    SOL = "SOL",
    ETH = "ETH",
}
// Static vault composition (can be props later)
const ALLOCATION: Array<{ asset: Asset; pct: number }> = [
    { asset: Asset.BTC, pct: 0.40 },
    { asset: Asset.SOL, pct: 0.30 },
    { asset: Asset.ETH, pct: 0.30 },
];
const tileHover =
    "rounded-2xl transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-[1px] hover:bg-primary/10 hover:border-primary/60 hover:ring-2 hover:ring-primary/40 hover:shadow-[0_0_40px_hsl(var(--primary)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

// Brand-ish colors & icons (you can swap to local /public svgs later)
export const ASSET_META: Record<
    Asset,
    { name: string; color: string; icon: string; href: string }
> = {
    [Asset.BTC]: {
        name: "Bitcoin",
        color: "#F2A900", // yellow
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png", href: "https://bitcoin.org/",
    },
    [Asset.SOL]: {
        name: "Solana",
        color: "#9945FF", // purple
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        href: "https://solana.com/",
    },
    [Asset.ETH]: {
        name: "Ethereum",
        color: "#627EEA", // blue
        icon: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
        href: "https://ethereum.org/",
    },
};
// Renders an asset icon from ASSET_META safely
function AssetIcon({
    asset,
    size = 20,
    className,
}: {
    asset: Asset;
    size?: number;
    className?: string;
}) {
    const meta = ASSET_META[asset];
    // If you later move icons into /public, just set meta.icon to "/tokens/btc.svg" etc.
    return (
        <span
            className={cn(
                "relative overflow-hidden rounded-full ring-1 ring-border/60 inline-flex items-center justify-center",
                className
            )}
            style={{ width: size, height: size }}
        >
            {/* Next/Image with external URLs needs domain allow-list; until then, unoptimized */}
            <Image
                src={meta.icon}
                alt={meta.name}
                width={size}
                height={size}
                unoptimized
                onError={(e) => {
                    // graceful fallback: colored dot
                    (e.target as HTMLImageElement).style.display = "none";
                }}
            />
        </span>
    );
}


type Prices = { BTC: number; SOL: number; ETH: number };

// Tries Clipper’s public data; if it fails, uses a gentle random-walk mock.
export default function useLivePrices(pollMs = 3000): Prices {
    const [prices, setPrices] = useState<Prices>({ BTC: 68000, SOL: 150, ETH: 3500 });
    const last = useRef(prices);

    useEffect(() => {
        let stop = false;

        async function tick() {
            try {
                // Try Clipper public data (CORS permitting). You can replace with your backend.
                const r = await fetch("https://clipper.exchange/data", { cache: "no-store" });
                if (r.ok) {
                    const json = await r.json();
                    // Expecting a shape where we can read prices (fallbacks if shape differs)
                    const next: Prices = {
                        BTC: Number(json?.prices?.BTC ?? json?.BTC ?? prices.BTC),
                        SOL: Number(json?.prices?.SOL ?? json?.SOL ?? prices.SOL),
                        ETH: Number(json?.prices?.ETH ?? json?.ETH ?? prices.ETH),
                    };
                    if (!Number.isFinite(next.BTC) || !Number.isFinite(next.SOL) || !Number.isFinite(next.ETH)) {
                        throw new Error("Unexpected price shape");
                    }
                    if (!stop) setPrices(next);
                    last.current = next;
                    return;
                }
                throw new Error("Network not OK");
            } catch {
                // Random walk fallback (±0.6% drift)
                const drift = (n: number) => {
                    const d = 1 + (Math.random() - 0.5) * 0.012;
                    return Math.max(0.0001, n * d);
                };
                const next = {
                    BTC: drift(last.current.BTC),
                    SOL: drift(last.current.SOL),
                    ETH: drift(last.current.ETH),
                };
                if (!stop) setPrices(next);
                last.current = next;
            }
        }

        tick();
        const id = setInterval(tick, pollMs);
        return () => {
            stop = true;
            clearInterval(id);
        };
    }, [pollMs]);

    return prices;
}

function usd(n: number | undefined, digits = 2) {
    if (!Number.isFinite(n as number)) return "—";
    return n!.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: digits });
}

export function VaultTile() {
    const prices = useLivePrices();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [hasVaultTokens, setHasVaultTokens] = useState(false);
    
    // Wallet connection
    const { connected, publicKey } = useWallet();
    const { connection } = useConnection();
    
    // Check for vault tokens
    useEffect(() => {
        const checkVaultTokens = async () => {
            if (!connected || !publicKey || !connection) {
                setHasVaultTokens(false);
                return;
            }
            
            try {
                // Check for vault token balance
                const vaultTokenMint = "Bgh1fPAzo15Jgv1dzjfc4hbw2YxAKwe46hoRUEAcTvWK"; // From your constants
                
                const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                    mint: new PublicKey(vaultTokenMint)
                });
                
                if (tokenAccounts.value.length > 0) {
                    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
                    setHasVaultTokens((balance || 0) > 0);
                    console.log("Vault token balance for button:", balance);
                } else {
                    setHasVaultTokens(false);
                    console.log("No vault token account found");
                }
            } catch (error) {
                console.error("Failed to check vault tokens:", error);
                setHasVaultTokens(false);
            }
        };
        
        checkVaultTokens();
    }, [connected, publicKey, connection]);
    
    // keep a small rolling history for sparklines
    const [hist, setHist] = useState<Array<{ t: number; BTC: number; SOL: number; ETH: number }>>([]);

    useEffect(() => {
        setHist((prev) => {
            const next = [...prev, { t: Date.now(), BTC: prices.BTC, SOL: prices.SOL, ETH: prices.ETH }];
            return next.length > 120 ? next.slice(-120) : next; // last 120 points
        });
    }, [prices]);

    // current $ contribution of each asset (weighted by vault allocation)
    const contrib = useMemo(() => ({
        BTC: prices.BTC * 0.40,
        SOL: prices.SOL * 0.30,
        ETH: prices.ETH * 0.30,
        total: prices.BTC * 0.40 + prices.SOL * 0.30 + prices.ETH * 0.30,
    }), [prices]);

    // single-row dataset for stacked bar
    const barData = useMemo(() => [
        { name: "Vault", BTC: contrib.BTC, SOL: contrib.SOL, ETH: contrib.ETH }
    ], [contrib]);

    // Derived metrics for the KPIs (just an example calc)
    // Assume a 1,000 vault supply with 1 share = proportional claim
    const vaultSupply = 1_000; // shares
    const vaultValue = useMemo(() => {
        // pretend vault holds 1 BTC, 500 SOL, 10 ETH just for demo; scale with allocation vs prices
        const notional =
            1 * prices.BTC + 500 * prices.SOL + 10 * prices.ETH; // illustrative
        return notional;
    }, [prices]);
    const cumSeries = useCumulativeSeries(vaultValue);

    const kpi = [
        { label: "Vault Value", value: usd(vaultValue, 0) },
        { label: "24h Volume", value: usd(vaultValue * 0.018, 0) },
        { label: "Supply", value: `${vaultSupply.toLocaleString()} shares` },
        { label: "Liquidity", value: usd(vaultValue * 0.73, 0) },
        { label: "APY", value: "8.2%" },
        { label: "TVL", value: usd(vaultValue * 0.73, 0) }, // demo: mirror Liquidity or wire your real TVL

    ];
    const pieData = ALLOCATION.map(({ asset, pct }) => ({
        name: asset,
        value: Math.round(pct * 100),
        fill: ASSET_META[asset].color,
    }));


    return (
        <>
            <Card className="border-border/60 bg-card/95 shadow-xl shadow-primary/5 transition-all duration-200 hover:scale-[1.005] hover:ring-1 hover:ring-primary/40 hover:shadow-[0_0_44px_hsl(var(--primary)/0.20)]">

            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle className="text-2xl font-semibold">ETF Vault (BTC • SOL • ETH)</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Diversified exposure: 40% BTC / 30% SOL / 30% ETH. Auto-rebalanced.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        className="btn-primary-lyra px-5 py-2.5"
                        onClick={() => setIsDepositModalOpen(true)}
                    >
                        Deposit
                    </Button>
                    <Button 
                        className={`px-5 py-2.5 border border-red-200 text-black ${
                            hasVaultTokens 
                                ? 'bg-red-100 hover:bg-red-200 hover:border-red-300' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => hasVaultTokens && setIsWithdrawModalOpen(true)}
                        disabled={!hasVaultTokens}
                        title={!hasVaultTokens ? "No vault tokens to withdraw" : "Withdraw from vault"}
                    >
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Withdraw
                    </Button>
                    <Button variant="outline" className="px-4">
                        Details <ArrowUpRight className="ml-1 size-4" />
                    </Button>
                </div>
            </CardHeader>

            <Separator className="mx-4" />

            <CardContent className="p-6 lg:p-8">
                {/* TOP ROW: Pie + KPIs */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Pie / Composition */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-border/60 bg-muted/10 p-4 lg:p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium">Allocation</h3>
                                <span className="text-xs text-muted-foreground">Interactive</span>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: 12,
                                            }}
                                            formatter={(v, n) => [`${v}%`, n as string]}
                                        />
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={95}
                                            paddingAngle={2}
                                            stroke="hsl(var(--background))"
                                            isAnimationActive
                                        >
                                            {pieData.map((s, i) => (
                                                <Cell key={i} fill={s.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 space-y-4">
                                {ALLOCATION.map(({ asset, pct }) => {
                                    const meta = ASSET_META[asset];
                                    const price = asset === Asset.BTC ? prices.BTC : asset === Asset.SOL ? prices.SOL : prices.ETH;
                                    const spark = hist.slice(-40); // recent points for the sparkline

                                    return (
                                        <div
                                            key={asset}
                                            className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5
                   hover:border-primary/60 hover:bg-primary/10
                   transition-all duration-200 ease-out hover:scale-[1.01] hover:-translate-y-[0.5px]
                   hover:ring-2 hover:ring-primary/30"
                                        >
                                            {/* dot + icon + symbol */}
                                            <span className="inline-flex size-2.5 rounded-full" style={{ background: meta.color }} />
                                            <AssetIcon asset={asset} size={20} className="size-5" />
                                            <span className="w-12 text-xs font-medium">{asset}</span>

                                            {/* allocation bar */}
                                            <div className="flex-1">
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div className="h-2 rounded-full" style={{ width: `${pct * 100}%`, background: meta.color }} />
                                                </div>
                                            </div>

                                            {/* percentage */}
                                            <div className="w-10 text-right text-xs text-muted-foreground">
                                                {Math.round(pct * 100)}%
                                            </div>

                                            {/* live price + sparkline */}
                                            <div className="ml-2 flex items-center gap-3">
                                                <div className="text-xs tabular-nums">{usd(price, asset === Asset.SOL ? 3 : 2)}</div>
                                                <div className="h-8 w-24">
                                                    <ResponsiveContainer>
                                                        <LineChart data={spark}>
                                                            <XAxis dataKey="t" hide />
                                                            <YAxis hide domain={["auto", "auto"]} />
                                                            <Line
                                                                type="monotone"
                                                                dataKey={asset}    // "BTC" | "SOL" | "ETH" fields exist on each item
                                                                stroke={meta.color}
                                                                strokeWidth={2}
                                                                dot={false}
                                                                isAnimationActive
                                                            />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>


                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="lg:col-span-7">
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {kpi.map((x) => (
                                <div
                                    key={x.label}
                                    className={cn(
                                        "rounded-2xl border border-border/60 bg-card/60 p-5 md:p-6 transition-colors",
                                        "hover:border-primary/60",
                                        tileHover
                                    )}                                  >
                                    <div className="text-xs text-muted-foreground">{x.label}</div>
                                    <div className="mt-1 text-xl font-semibold">{x.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Cumulative value by asset (clean 100% horizontal bar) */}
                        {/* Cumulative value over time (line) */}
                        <div className="mt-6 rounded-2xl border border-border/60 bg-muted/10 p-4 md:p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-medium">Cumulative Value (Vault)</h3>
                                <span className="text-xs text-muted-foreground">live • random walk</span>
                            </div>

                            <div className="h-56 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={cumSeries} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                                        {/* Grid */}
                                        <CartesianGrid
                                            stroke="rgba(255,255,255,0.12)"   // light white grid
                                            strokeDasharray="3 3"
                                            vertical
                                            horizontal
                                        />
                                        {/* X axis (white labels & line) */}
                                        <XAxis
                                            dataKey="t"
                                            tick={{ fill: "#ffffff", fontSize: 11 }} // white ticks
                                            tickLine={{ stroke: "#ffffff", strokeWidth: 0.8 }} // little white tick marks
                                            axisLine={{ stroke: "#ffffff", strokeWidth: 1 }}   // white axis line
                                            minTickGap={24}
                                        />
                                        {/* Y axis (white labels & line) */}
                                        <YAxis
                                            tickFormatter={(v) => usd(v, 0)}
                                            tick={{ fill: "#ffffff", fontSize: 11 }} // white ticks
                                            tickLine={{ stroke: "#ffffff", strokeWidth: 0.8 }}
                                            axisLine={{ stroke: "#ffffff", strokeWidth: 1 }}
                                            width={72}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: 12,
                                            }}
                                            formatter={(v: number) => [usd(v, 0), "Vault"]}
                                            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                                        />
                                        {/* GREEN line */}
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="rgb(34,197,94)"     // emerald-500 green
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 4, fill: "rgb(34,197,94)" }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>

                            </div>
                        </div>





                        {/* Small stats strip */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <StripStat label="Rebalance Threshold" value="±5%" />
                            <StripStat label="Management Fee" value="0%" />
                            <StripStat label="Performance Fee" value="0%" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
            <DepositModal 
                isOpen={isDepositModalOpen} 
                onClose={() => setIsDepositModalOpen(false)} 
            />
            <WithdrawModal 
                isOpen={isWithdrawModalOpen} 
                onClose={() => setIsWithdrawModalOpen(false)} 
            />
        </>
    );
}

function StripStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-semibold">{value}</div>
        </div>
    );
}
