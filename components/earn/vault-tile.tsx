"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // if you don't have one, replace with a div + w-[%]
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

/** ----- THEME HINTS -----
 * - Keeps your lyra look: soft borders, subtle shadows, rounded-2xl, muted surfaces
 * - Recharts uses current CSS variables for colors; we set fills per slice but keep brand-neutral.
 */

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
export default function useLivePrices(pollMs = 8000): Prices {
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

    // Derived metrics for the KPIs (just an example calc)
    // Assume a 1,000 vault supply with 1 share = proportional claim
    const vaultSupply = 1_000; // shares
    const vaultValue = useMemo(() => {
        // pretend vault holds 1 BTC, 500 SOL, 10 ETH just for demo; scale with allocation vs prices
        const notional =
            1 * prices.BTC + 500 * prices.SOL + 10 * prices.ETH; // illustrative
        return notional;
    }, [prices]);

    const kpi = [
        { label: "Vault Value", value: usd(vaultValue, 0) },
        { label: "24h Volume", value: usd(vaultValue * 0.018, 0) },
        { label: "Supply", value: `${vaultSupply.toLocaleString()} shares` },
        { label: "Liquidity", value: usd(vaultValue * 0.73, 0) },
        { label: "APY", value: "8.2%" },
    ];
    const pieData = ALLOCATION.map(({ asset, pct }) => ({
        name: asset,
        value: Math.round(pct * 100),
        fill: ASSET_META[asset].color,
    }));


    return (
        <Card className="border-border/60 bg-card/95 shadow-xl shadow-primary/5 transition-all duration-200 hover:scale-[1.005] hover:ring-1 hover:ring-primary/40 hover:shadow-[0_0_44px_hsl(var(--primary)/0.20)]">

            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <CardTitle className="text-2xl font-semibold">ETF Vault (BTC • SOL • ETH)</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Diversified exposure: 40% BTC / 30% SOL / 30% ETH. Auto-rebalanced.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="btn-primary-lyra px-5 py-2.5">Deposit</Button>
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

                            <div className="mt-5 space-y-3">
                                {ALLOCATION.map(({ asset, pct }) => {
                                    const meta = ASSET_META[asset];
                                    return (
                                        <div key={asset} className="flex items-center gap-3">
                                            <a
                                                href={meta.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 hover:opacity-90"
                                                title={meta.name}
                                            >
                                                <span
                                                    className="inline-flex size-2.5 rounded-full"
                                                    style={{ background: meta.color }}
                                                />
                                                {/* icon + symbol */}
                                                <AssetIcon asset={asset} size={20} className="size-5" />
                                                <span className="w-20 text-xs font-medium">{asset}</span>
                                            </a>

                                            <div className="flex-1">
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{ width: `${pct * 100}%`, background: meta.color }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="w-12 text-right text-xs text-muted-foreground">
                                                {Math.round(pct * 100)}%
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

                        {/* Live Prices Bar */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            {([Asset.BTC, Asset.SOL, Asset.ETH] as const).map((a) => {
                                const meta = ASSET_META[a];
                                const price =
                                    a === Asset.BTC ? prices.BTC : a === Asset.SOL ? prices.SOL : prices.ETH;
                                return (
                                    <div
                                        key={a}
                                        className={cn(
                                            "group flex items-center justify-between rounded-xl border border-border/60 bg-card/50 p-3 backdrop-blur transition-colors",
                                            tileHover
                                        )}                                    >
                                        <div className="flex items-center gap-2">
                                            <AssetIcon asset={a} size={24} className="mr-1" />
                                            <div className="text-sm font-medium">{a}</div>
                                        </div>
                                        <div className="text-sm tabular-nums">
                                            {usd(price, a === Asset.SOL ? 3 : 2)}
                                        </div>
                                    </div>
                                );
                            })}
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
