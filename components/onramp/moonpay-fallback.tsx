"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, ArrowLeft, RefreshCw } from "lucide-react"
import { MoonPayLogo } from "./moonpay-logo"

interface MoonPayFallbackProps {
  onClose: () => void
  onRetry: () => void
}

export function MoonPayFallback({ onClose, onRetry }: MoonPayFallbackProps) {
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Globe className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                MoonPay Unavailable
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                MoonPay is currently blocked by your browser's security settings or network configuration. 
                This is common in development environments. Try using a different browser or network.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/20">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-500 font-bold">$</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Fees</span>
                    <span className="font-semibold">1-4.5%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/20">
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
                onClick={onRetry}
              >
                <RefreshCw className="h-5 w-5 mr-3" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="w-full h-10 hover:bg-accent/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Options
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold text-purple-400">MoonPay</span>
              </p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
