"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Wallet, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Dummy data
const portfolioData = {
  totalValue: 12450.67,
  dayChange: 324.50,
  dayChangePercent: 2.68,
  holdings: [
    { symbol: "SOL", name: "Solana", amount: 45.2, value: 6750.40, change: 2.1, icon: "🔸" },
    { symbol: "USDC", name: "USD Coin", amount: 2500.00, value: 2500.00, change: 0.0, icon: "💵" },
    { symbol: "ETH", name: "Ethereum", amount: 1.8, value: 3200.27, change: -1.2, icon: "⬡" },
  ]
}

const recentTrades = [
  { type: "buy", token: "SOL", amount: "5.2 SOL", value: "$775.20", time: "2 min ago", status: "completed" },
  { type: "sell", token: "USDC", amount: "1,200 USDC", value: "$1,200.00", time: "15 min ago", status: "completed" },
  { type: "buy", token: "ETH", amount: "0.5 ETH", value: "$890.45", time: "1 hour ago", status: "completed" },
]

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track your Solana ETF investments and trading activity
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className={`mt-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">${portfolioData.totalValue.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  {portfolioData.dayChange > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-semibold ${portfolioData.dayChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolioData.dayChange > 0 ? '+' : ''}{portfolioData.dayChangePercent}%
                  </span>
                  <span className="text-sm text-muted-foreground">24h</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {portfolioData.dayChange > 0 ? '+' : ''}${portfolioData.dayChange.toFixed(2)} today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Grid */}
        <div className={`mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {portfolioData.holdings.map((holding, index) => (
            <Card key={holding.symbol} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{holding.icon}</span>
                    <span>{holding.symbol}</span>
                  </div>
                  <Badge variant={holding.change > 0 ? "default" : "secondary"}>
                    {holding.change > 0 ? '+' : ''}{holding.change}%
                  </Badge>
                </CardTitle>
                <CardDescription>{holding.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-medium">{holding.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Value</span>
                    <span className="font-semibold">${holding.value.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className={`mt-8 transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Trading Activity
              </CardTitle>
              <CardDescription>Your latest ETF trades and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${trade.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {trade.type === 'buy' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.amount}</p>
                        <p className="text-sm text-muted-foreground">{trade.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{trade.value}</p>
                      <Badge variant="outline" className="text-xs">{trade.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className={`mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 transition-all duration-1000 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
            <DollarSign className="h-6 w-6" />
            <span>Buy ETF</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Trade</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Activity className="h-6 w-6" />
            <span>Analytics</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Wallet className="h-6 w-6" />
            <span>Manage</span>
          </Button>
        </div>
      </div>
    </main>
  )
}
