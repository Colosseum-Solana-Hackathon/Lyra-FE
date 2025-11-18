"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Shield, Zap, HelpCircle, Users, DollarSign, Activity, ArrowRight, Wallet, ArrowLeftRight, BarChart3, CreditCard, CheckCircle2, Layers, Lock, Star, PlayCircle } from "lucide-react"

// Hook for animated counter
function useCounter(end: number, duration: number = 2000, decimals: number = 1, isPercentage: boolean = false, suffix: string = '') {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const current = end * easeOutQuart
      
      setCount(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  const formatNumber = (value: number): string => {
    if (isPercentage) {
      return `${value.toFixed(decimals)}%`
    }
    
    if (value >= 1000000) {
      const formatted = (value / 1000000).toFixed(decimals)
      // Remove trailing .0 for whole numbers when decimals is 1
      const cleaned = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted
      return `$${cleaned}M${suffix}`
    } else if (value >= 1000) {
      const formatted = (value / 1000).toFixed(decimals)
      // Remove trailing .0 for whole numbers when decimals is 1
      const cleaned = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted
      return `${cleaned}K${suffix}`
    }
    return value.toFixed(decimals) + suffix
  }

  return { count, formattedValue: formatNumber(count), ref }
}

// Component for animated stat
function AnimatedStat({ 
  end, 
  label, 
  icon: Icon, 
  duration = 2000, 
  decimals = 1, 
  isPercentage = false,
  suffix = ''
}: { 
  end: number
  label: string
  icon: React.ElementType
  duration?: number
  decimals?: number
  isPercentage?: boolean
  suffix?: string
}) {
  const { count, formattedValue, ref } = useCounter(end, duration, decimals, isPercentage, suffix)

  return (
    <div className="text-center" ref={ref}>
      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
        <Icon className="size-6 text-primary" />
      </div>
      <div className="text-3xl font-bold mb-1">{formattedValue}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

// Hook for reveal animation
function useRevealAnimation(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay])

  return { isVisible, ref }
}

// Component for reveal animation wrapper
function RevealCard({ 
  children, 
  delay = 0,
  index = 0 
}: { 
  children: React.ReactNode
  delay?: number
  index?: number
}) {
  const { isVisible, ref } = useRevealAnimation(delay)

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : 'opacity-0 translate-y-[30px] translate-x-0 md:translate-y-0 md:translate-x-[-50px]'
        }
      `}
      style={{
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

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

        {/* Platform Stats Section */}
        <section className="relative border-t border-border/40 bg-background/50 py-16">
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AnimatedStat
                end={100}
                label="Total Value Locked"
                icon={DollarSign}
                duration={2000}
                decimals={1}
                isPercentage={false}
                suffix=""
              />
              <AnimatedStat
                end={10}
                label="Active Users"
                icon={Users}
                duration={2000}
                decimals={1}
                isPercentage={false}
                suffix="+"
              />
              <AnimatedStat
                end={500}
                label="24h Volume"
                icon={Activity}
                duration={2000}
                decimals={1}
                isPercentage={false}
                suffix="+"
              />
              <AnimatedStat
                end={10.2}
                label="Avg. APY"
                icon={TrendingUp}
                duration={2000}
                decimals={1}
                isPercentage={true}
                suffix=""
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative border-t border-border/40 bg-background py-24">
          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Star className="size-4" />
                Getting Started
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start trading ETFs on Solana in three simple steps
              </p>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Arrow between Step 1 and Step 2 - positioned at end of first column plus half gap */}
              <div className="absolute left-[calc((100%-4rem)/3+1rem)] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:flex items-center justify-center">
                <div className="rounded-full bg-background border border-primary/20 p-2 shadow-lg">
                  <ArrowRight className="size-5 text-primary/50" />
                </div>
              </div>
              
              {/* Arrow between Step 2 and Step 3 - positioned at end of second column plus half gap */}
              <div className="absolute left-[calc(2*(100%-4rem)/3+3rem)] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:flex items-center justify-center">
                <div className="rounded-full bg-background border border-primary/20 p-2 shadow-lg">
                  <ArrowRight className="size-5 text-primary/50" />
                </div>
              </div>

              <RevealCard delay={0} index={0}>
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full transition-all duration-300 hover:bg-green-500/10 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/20 p-3 mb-4 w-fit">
                      <Wallet className="size-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">STEP 1</span>
                    </div>
                    <CardTitle>Connect Your Wallet</CardTitle>
                    <CardDescription>
                      Link your Solana wallet (Phantom, Solflare, or Backpack) to get started. Your funds stay in your wallet—we never hold custody.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </RevealCard>

              <RevealCard delay={150} index={1}>
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full transition-all duration-300 hover:bg-green-500/10 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/20 p-3 mb-4 w-fit">
                      <CreditCard className="size-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">STEP 2</span>
                    </div>
                    <CardTitle>Deposit Funds</CardTitle>
                    <CardDescription>
                      Buy crypto directly with a card via OnRamp, or send tokens from another wallet. Funds are available instantly.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </RevealCard>

              <RevealCard delay={300} index={2}>
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full transition-all duration-300 hover:bg-green-500/10 hover:scale-105 hover:shadow-lg cursor-pointer">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/20 p-3 mb-4 w-fit">
                      <TrendingUp className="size-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">STEP 3</span>
                    </div>
                    <CardTitle>Start Trading & Earning</CardTitle>
                    <CardDescription>
                      Swap tokens instantly, deposit into yield vaults, or track your portfolio. All with minimal fees on Solana.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </RevealCard>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="relative border-t border-border/40 bg-background/50 py-24">
          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything You Need in One Platform
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Discover powerful DeFi tools built for Solana
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4 group-hover:bg-primary/20 transition-colors">
                    <ArrowLeftRight className="size-6 text-primary" />
                  </div>
                  <CardTitle>Swap</CardTitle>
                  <CardDescription>
                    Trade tokens instantly with minimal slippage. Access deep liquidity across Solana.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild className="w-full group-hover:text-primary">
                    <Link href="/swap">
                      Try Swap <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="size-6 text-primary" />
                  </div>
                  <CardTitle>Earn</CardTitle>
                  <CardDescription>
                    Deposit into yield-generating vaults. Earn passive income from automated DeFi strategies.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild className="w-full group-hover:text-primary">
                    <Link href="/earn">
                      View Vaults <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="size-6 text-primary" />
                  </div>
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>
                    Track your portfolio, view performance, and manage all your positions in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild className="w-full group-hover:text-primary">
                    <Link href="/dashboard">
                      View Dashboard <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group border-primary/20 bg-gradient-to-br from-card to-card/50 hover:border-primary/40 transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4 group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="size-6 text-primary" />
                  </div>
                  <CardTitle>OnRamp</CardTitle>
                  <CardDescription>
                    Buy crypto with credit or debit card. Fast, secure, and seamless integration with trusted partners.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" asChild className="w-full group-hover:text-primary">
                    <Link href="/onramp">
                      Buy Crypto <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security & Trust Section */}
        <section className="relative border-t border-border/40 bg-background py-24">
          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Shield className="size-4" />
                Security First
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Thousands
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your security is our top priority
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4">
                    <Lock className="size-6 text-primary" />
                  </div>
                  <CardTitle>Non-Custodial</CardTitle>
                  <CardDescription>
                    Your funds remain in your wallet. We never hold custody of your assets—you maintain full control.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4">
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                  <CardTitle>Audited Smart Contracts</CardTitle>
                  <CardDescription>
                    All smart contracts undergo rigorous security audits by leading blockchain security firms before deployment.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 mb-4">
                    <Layers className="size-6 text-primary" />
                  </div>
                  <CardTitle>Built on Solana</CardTitle>
                  <CardDescription>
                    Leveraging Solana's secure proof-of-stake consensus and fast transaction speeds for reliable performance.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Multi-sig wallets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Open source code</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Bug bounty program</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-500" />
                <span>Regular security updates</span>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="relative border-t border-border/40 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 py-24">
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Zap className="size-4" />
              Ready to Get Started?
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Join the Future of DeFi Trading
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect your wallet and start trading ETFs on Solana today. No registration required—just connect and trade.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="btn-primary-lyra">
                <Link href="/swap">
                  Start Trading Now
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/earn">
                  Explore Yield Vaults
                  <PlayCircle className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative border-t border-border/40 bg-background/50 py-24">
          <div className="relative z-10 mx-auto max-w-4xl px-6">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <HelpCircle className="size-4" />
                Frequently Asked Questions
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Common Questions About Lyra
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about trading ETFs on Solana
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="wallet-connection" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How do I connect my wallet to start trading?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To start trading on Lyra, click the "Connect Wallet" button in the top right corner of the page. 
                  We support popular Solana wallets including Phantom, Solflare, and Backpack. Once connected, 
                  you can immediately start swapping tokens, depositing into yield vaults, and managing your portfolio.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="trading-fees" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  What are the trading fees on Lyra?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Lyra charges competitive fees for swaps and transactions. Swap fees typically range from 0.1% to 0.3% 
                  depending on the trading pair. All fees are transparently displayed before you confirm any transaction. 
                  Network fees on Solana are minimal (usually less than $0.01), making it cost-effective to trade frequently.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How secure is Lyra? Are my funds safe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Security is our top priority. Lyra uses audited smart contracts and operates on the Solana blockchain, 
                  which provides robust security through its proof-of-stake consensus mechanism. Your funds remain in your 
                  wallet—we never hold custody of your assets. All smart contracts undergo rigorous security audits before deployment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="supported-tokens" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  What tokens can I trade on Lyra?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Lyra supports a wide range of Solana-based tokens including SOL, USDC, USDT, and various other SPL tokens. 
                  Our platform also offers access to ETF-like vaults that provide diversified exposure to multiple assets in a 
                  single token. Check the Swap page to see all available trading pairs and liquidity options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="deposits" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How do I deposit funds to start trading?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can deposit funds in two ways: First, use our OnRamp feature to buy crypto directly with a credit or debit 
                  card through our trusted partners. Alternatively, you can send tokens from another Solana wallet or exchange 
                  directly to your connected wallet address. Once the funds arrive in your wallet, they're immediately available for trading.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="yield-vaults" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  What are yield-generating vaults and how do they work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yield-generating vaults are automated strategies that pool user funds and deploy them across various DeFi 
                  protocols to earn yield. When you deposit into a vault, you receive vault tokens representing your share. 
                  These tokens accumulate value as the vault earns returns through lending, liquidity provision, or other strategies. 
                  You can withdraw your funds plus earned yield at any time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="withdrawals" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  How long do withdrawals take?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Withdrawals on Lyra are processed almost instantly thanks to Solana's fast block times. Standard withdrawals 
                  typically complete within seconds. For vault withdrawals, there may be a brief delay while the smart contract 
                  processes your request and redeems your vault tokens. You'll always see the estimated time before confirming.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="etf-explanation" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  What is an ETF on Solana and how is it different from traditional ETFs?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A Solana ETF (Exchange Traded Fund) on Lyra is a tokenized basket of assets that tracks a diversified portfolio. 
                  Unlike traditional ETFs which trade on stock exchanges and have regulatory overhead, Solana ETFs are fully 
                  decentralized, trade 24/7, have instant settlement, and operate without intermediaries. They provide the same 
                  diversification benefits as traditional ETFs but with the speed and transparency of blockchain technology.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="minimum-amount" className="rounded-lg border border-border/60 bg-card/50 px-4">
                <AccordionTrigger className="text-left font-semibold">
                  Is there a minimum deposit or trading amount?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Lyra has very low minimum requirements, making it accessible to traders of all sizes. Most trading pairs have 
                  no minimum amount, though you'll need enough SOL to cover transaction fees (typically less than $0.01). For 
                  yield vaults, minimum deposits vary by vault but are generally very low. Check individual vault details for 
                  specific requirements.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions? We're here to help.
              </p>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Visit Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
