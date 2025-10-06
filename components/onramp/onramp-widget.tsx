"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ExternalLink, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react"

interface OnrampWidgetProps {
  provider: {
    name: string
    description: string
    features: string[]
    fees: string
    time: string
    rating: number
    logo: string
    color: string
    popular: boolean
  }
  onClose: () => void
}

export function OnrampWidget({ provider, onClose }: OnrampWidgetProps) {
  const [step, setStep] = useState<'select' | 'amount' | 'payment' | 'processing' | 'success'>('select')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const amounts = [50, 100, 250, 500, 1000, 2500]
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" />, available: true },
    { id: 'bank', name: 'Bank Transfer', icon: <Banknote className="h-5 w-5" />, available: provider.name === 'Transak' || provider.name === 'Ramp' },
    { id: 'mobile', name: 'Apple/Google Pay', icon: <Smartphone className="h-5 w-5" />, available: provider.name === 'Transak' }
  ]

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setStep('payment')
  }

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method)
    setStep('processing')
    setIsLoading(true)
    
    // Simulate processing
    setTimeout(() => {
      setIsLoading(false)
      setStep('success')
    }, 3000)
  }

  const handleStartOver = () => {
    setStep('select')
    setSelectedAmount(null)
    setSelectedPaymentMethod(null)
    setIsLoading(false)
  }

  const renderStep = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Choose Amount</h3>
              <p className="text-muted-foreground">Select how much crypto you want to purchase</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {amounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  className="h-14 sm:h-16 flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-primary/10 hover:border-primary/20"
                  onClick={() => handleAmountSelect(amount)}
                >
                  <span className="text-sm sm:text-lg font-semibold">${amount}</span>
                  <span className="text-xs text-muted-foreground">≈ {amount * 0.0004} SOL</span>
                </Button>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Fees: {provider.fees} • Processing: {provider.time}
              </p>
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Payment Method</h3>
              <p className="text-muted-foreground">Choose your preferred payment method</p>
            </div>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant="outline"
                  className={`w-full h-14 sm:h-16 flex items-center justify-between ${
                    !method.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/10 hover:border-primary/20'
                  }`}
                  onClick={() => method.available && handlePaymentMethodSelect(method.id)}
                  disabled={!method.available}
                >
                  <div className="flex items-center gap-3">
                    {method.icon}
                    <span className="font-medium">{method.name}</span>
                  </div>
                  {!method.available && (
                    <Badge variant="secondary" className="text-xs">Not Available</Badge>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${selectedAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fees:</span>
                <span className="font-medium">{provider.fees}</span>
              </div>
            </div>
          </div>
        )

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">
                Please wait while we process your {provider.name} transaction...
              </p>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-500">Payment Successful!</h3>
              <p className="text-muted-foreground">
                Your crypto has been purchased and will arrive in your wallet shortly.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleStartOver}
                className="w-full"
              >
                Buy More Crypto
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${provider.color} flex items-center justify-center text-xl`}>
                {provider.logo}
              </div>
              <div>
                <CardTitle className="text-lg">{provider.name}</CardTitle>
                <CardDescription className="text-sm">{provider.description}</CardDescription>
              </div>
            </div>
            {step !== 'select' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('select')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  )
}
