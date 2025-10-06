"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { MoonPayFallback } from "./moonpay-fallback"
import { MoonPayLogo } from "./moonpay-logo"

const MoonPayBuyWidget = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayBuyWidget),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
  },
)

interface MoonPayWidgetProps {
  onClose: () => void
}

export function MoonPayWidget({ onClose }: MoonPayWidgetProps) {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStartPurchase = () => {
    setIsLoading(true)
    // Simulate loading time for widget initialization
    setTimeout(() => {
      setIsLoading(false)
      setIsWidgetVisible(true)
      
      // Check for "Coming soon" message after a delay
      setTimeout(() => {
        // This is a simple way to detect the "Coming soon" state
        // In a real implementation, you might want to listen for specific events
        const moonpayContent = document.querySelector('[data-testid="moonpay-widget"]') || 
                              document.querySelector('.moonpay-widget') ||
                              document.querySelector('iframe[src*="moonpay"]')
        
        if (moonpayContent) {
          const text = moonpayContent.textContent || ''
          if (text.includes('Coming soon') || text.includes('not available') || text.includes('region')) {
            handleWidgetError()
          }
        }
      }, 3000)
    }, 1000)
  }

  const handleWidgetClose = () => {
    setIsWidgetVisible(false)
  }

  const handleTransactionComplete = async () => {
    console.log("MoonPay transaction completed!")
    // You can add additional logic here for successful transactions
  }

  const handleWidgetError = () => {
    setShowFallback(true)
    setIsWidgetVisible(false)
  }

  const handleRetry = () => {
    setShowFallback(false)
    setIsWidgetVisible(false)
    setIsLoading(false)
  }

  if (!isClient) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showFallback) {
    return <MoonPayFallback onClose={onClose} onRetry={handleRetry} />
  }

  if (isWidgetVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-5xl h-[700px] border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  <MoonPayLogo size="md" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">MoonPay</CardTitle>
                  <CardDescription className="text-sm">Buy crypto with your credit card</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWidgetClose}
                className="text-muted-foreground hover:text-foreground hover:bg-accent/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 h-[calc(100%-120px)] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="w-full h-full min-h-[500px]">
                <MoonPayBuyWidget
                  variant="embedded"
                  baseCurrencyCode="usd"
                  baseCurrencyAmount="100"
                  defaultCurrencyCode="sol"
                  onTransactionCompleted={handleTransactionComplete}
                  onCloseOverlay={handleWidgetClose}
                  visible={isWidgetVisible}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg border-border/50 bg-card/95 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        <div className="relative z-10">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                <MoonPayLogo size="lg" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">MoonPay</CardTitle>
                <CardDescription className="text-base">Buy crypto with your credit card</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ready to Buy Crypto?
              </h3>
              <p className="text-muted-foreground text-lg">
                MoonPay offers instant crypto purchases with your credit or debit card. 
                Get your SOL in minutes with competitive rates.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 font-bold">$</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fees</span>
                    <span className="font-semibold">1-4.5%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-500 font-bold">⚡</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Time</span>
                    <span className="font-semibold">Instant</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-base">Features:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-2 rounded-full border border-purple-500/30">
                    Credit/Debit Cards
                  </span>
                  <span className="text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-2 rounded-full border border-purple-500/30">
                    150+ Countries
                  </span>
                  <span className="text-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-2 rounded-full border border-purple-500/30">
                    Instant Processing
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleStartPurchase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Loading MoonPay...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚀</span>
                    Start Purchase
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full h-10 hover:bg-accent/50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
