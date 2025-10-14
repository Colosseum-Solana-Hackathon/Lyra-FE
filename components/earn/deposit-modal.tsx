"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Numpad } from "./numpad"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Wallet, TrendingUp } from "lucide-react"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

type DepositStep = "amount" | "confirming" | "loading" | "success" | "error"

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [step, setStep] = useState<DepositStep>("amount")
  const [amount, setAmount] = useState("")
  const [usdValue, setUsdValue] = useState(0)
  const [txHash, setTxHash] = useState("")
  
  // Mock SOL price
  const solPrice = 150.25

  useEffect(() => {
    if (amount) {
      setUsdValue(parseFloat(amount) * solPrice)
    } else {
      setUsdValue(0)
    }
  }, [amount])

  const handleNumberClick = (number: string) => {
    if (number === ".") {
      if (!amount.includes(".")) {
        setAmount(prev => prev + ".")
      }
    } else {
      setAmount(prev => prev + number)
    }
  }

  const handleBackspace = () => {
    setAmount(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setAmount("")
  }

  const handleConfirmAmount = () => {
    if (parseFloat(amount) > 0) {
      setStep("confirming")
    }
  }

  const handleDeposit = async () => {
    setStep("loading")
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock transaction hash
    const mockTxHash = "5J7X...9K2M"
    setTxHash(mockTxHash)
    
    // Simulate success (90% chance)
    if (Math.random() > 0.1) {
      setStep("success")
    } else {
      setStep("error")
    }
  }

  const resetModal = () => {
    setStep("amount")
    setAmount("")
    setUsdValue(0)
    setTxHash("")
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Deposit SOL</h2>
        <p className="text-muted-foreground">Enter the amount you want to deposit</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Deposit Amount
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {amount || "0"} SOL
              </div>
              <div className="text-lg text-muted-foreground">
                ≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
            
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                SOL Price: ${solPrice}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Numpad
        onNumberClick={handleNumberClick}
        onBackspace={handleBackspace}
        onClear={handleClear}
        onConfirm={handleConfirmAmount}
        disabled={step !== "amount"}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirmAmount}
          disabled={!amount || parseFloat(amount) <= 0}
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          Continue
        </Button>
      </div>
    </div>
  )

  const renderConfirmingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Confirm Deposit</h2>
        <p className="text-muted-foreground">Review your deposit details</p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Deposit Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold">{amount} SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">USD Value:</span>
            <span className="font-semibold">${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Expected Shares:</span>
            <span className="font-semibold">~{Math.round(usdValue / 100)} shares</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Network Fee:</span>
            <span className="font-semibold">~0.00025 SOL</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleDeposit}
          className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          Confirm Deposit
        </Button>
      </div>
    </div>
  )

  const renderLoadingStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Processing Deposit</h2>
        <p className="text-muted-foreground">Your transaction is being processed on Solana</p>
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm">Validating transaction</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-sm">Confirming on blockchain</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span className="text-sm text-muted-foreground">Finalizing deposit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2 text-green-600">Deposit Successful!</h2>
        <p className="text-muted-foreground">Your SOL has been deposited into the ETF vault</p>
      </div>

      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount Deposited:</span>
              <span className="font-semibold">{amount} SOL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Hash:</span>
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{txHash}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shares Received:</span>
              <span className="font-semibold">~{Math.round(usdValue / 100)} shares</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleClose}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
      >
        View Portfolio
      </Button>
    </div>
  )

  const renderErrorStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2 text-red-600">Transaction Failed</h2>
        <p className="text-muted-foreground">Your deposit could not be processed</p>
      </div>

      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              The transaction may have failed due to:
            </div>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Insufficient SOL for gas fees</li>
              <li>• Network congestion</li>
              <li>• Wallet connection issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
          Try Again
        </Button>
        <Button onClick={handleClose} className="flex-1">
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Deposit SOL</DialogTitle>
        </DialogHeader>
        
        {step === "amount" && renderAmountStep()}
        {step === "confirming" && renderConfirmingStep()}
        {step === "loading" && renderLoadingStep()}
        {step === "success" && renderSuccessStep()}
        {step === "error" && renderErrorStep()}
      </DialogContent>
    </Dialog>
  )
}
