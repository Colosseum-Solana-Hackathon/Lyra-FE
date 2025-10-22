"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Wallet } from "lucide-react"
import { MoonPayFallback } from "./moonpay-fallback"
import { MoonPayLogo } from "./moonpay-logo"
import { useWallet } from "@solana/wallet-adapter-react"

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
  
  // Wallet connection state
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    setIsClient(true)
    // Only auto-trigger if wallet is connected
    if (connected) {
      console.log('MoonPay: Component mounted, wallet connected, auto-starting purchase')
      handleStartPurchase()
    } else {
      console.log('MoonPay: Component mounted, wallet not connected')
    }
  }, [connected])

  const handleStartPurchase = () => {
    console.log('MoonPay: Starting purchase flow')
    
    // Lock page scroll when modal opens
    document.body.style.overflow = 'hidden'
    
    // Show loading state first
    setIsLoading(true)
    setIsWidgetVisible(false)
    console.log('MoonPay: Set loading true, widget visible false')
    
    // Wait for iframe to load completely before showing
    setTimeout(() => {
      // Check if MoonPay iframe is loaded
      const checkIframeLoaded = () => {
        const iframe = document.querySelector('iframe[src*="moonpay"]') as HTMLIFrameElement
        if (iframe) {
          console.log('MoonPay: Iframe found, checking if loaded')
          iframe.onload = () => {
            console.log('MoonPay: Iframe loaded successfully')
            setIsLoading(false)
            setIsWidgetVisible(true)
          }
          // Fallback if onload doesn't fire
          setTimeout(() => {
            console.log('MoonPay: Fallback - showing widget after timeout')
            setIsLoading(false)
            setIsWidgetVisible(true)
          }, 2000)
        } else {
          console.log('MoonPay: Iframe not found yet, showing widget anyway')
          setIsLoading(false)
          setIsWidgetVisible(true)
        }
      }
      
      checkIframeLoaded()
    }, 2000) // Initial delay to let iframe start loading
  }

  const handleWidgetClose = () => {
    setIsWidgetVisible(false)
    // Restore page scroll when modal closes
    document.body.style.overflow = 'unset'
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
    // Restore page scroll when retrying
    document.body.style.overflow = 'unset'
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

  // Show wallet connection prompt if not connected
  if (!connected) {
    return (
      <>
        {/* Blur background */}
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" />
        
        {/* Wallet connection modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-muted-foreground">
                    Please connect your Solana wallet to access MoonPay and start purchasing crypto.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show loading modal when loading but widget not visible yet
  if (isLoading && !isWidgetVisible) {
    return (
      <>
        {/* Blur background */}
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" />
        
        {/* Loading modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                    Loading MoonPay
                  </h3>
                  <p className="text-muted-foreground">
                    Preparing your crypto purchase experience...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (showFallback) {
    return <MoonPayFallback onClose={onClose} onRetry={handleRetry} />
  }

  if (isWidgetVisible) {
    return (
      <>
        {/* Blur background */}
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" />
        
        {/* Main modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-card/98 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Beautiful header */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <MoonPayLogo size="md" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      MoonPay
                    </h2>
                    <p className="text-sm text-muted-foreground">Buy crypto with your credit card</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWidgetClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-full w-10 h-10"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* MoonPay widget container */}
            <div className="flex-1 overflow-hidden flex justify-end pr-8">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-card/95 backdrop-blur-sm z-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Loading MoonPay</h3>
                    <p className="text-muted-foreground">Preparing your crypto purchase experience...</p>
                  </div>
                </div>
              )}
              
              <div className="w-full h-full max-w-3xl">
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
          </div>
        </div>
      </>
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
