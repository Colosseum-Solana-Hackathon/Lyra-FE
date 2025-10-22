"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MiniNumpad } from "./mini-numpad"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Wallet, TrendingUp, ExternalLink, Zap, Delete, Percent } from "lucide-react"
import { useSolanaDeposit } from "@/hooks/use-solana-deposit"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"

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
  const [sharesReceived, setSharesReceived] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [inputMode, setInputMode] = useState<'SOL' | 'USDC'>('SOL')
  const [inputError, setInputError] = useState<string | null>(null)
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)
  
  // Solana integration
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const { deposit, isLoading, error, lastTransaction, checkBalance } = useSolanaDeposit()
  
  // Mock SOL price (in production, fetch from API)
  const solPrice = 150.25

  useEffect(() => {
    if (amount) {
      if (inputMode === 'SOL') {
      setUsdValue(parseFloat(amount) * solPrice)
      } else {
        setUsdValue(parseFloat(amount))
      }
    } else {
      setUsdValue(0)
    }
  }, [amount, inputMode, solPrice])

  // Validate input and set errors
  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setInputError(null)
      return
    }

    const numAmount = parseFloat(amount)
    const solAmount = inputMode === 'SOL' ? numAmount : numAmount / solPrice

    if (solAmount > userBalance) {
      setInputError(`Insufficient balance. You have ${userBalance.toFixed(4)} SOL available.`)
    } else if (solAmount < 0.001) {
      setInputError('Minimum deposit amount is 0.001 SOL')
    } else {
      setInputError(null)
    }
  }, [amount, inputMode, userBalance, solPrice])

  // Fetch user balance when wallet connects
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (connected && publicKey && connection) {
        try {
          // Use the actual Solana connection to fetch balance
          const balance = await connection.getBalance(publicKey)
          const solBalance = balance / 1_000_000_000 // Convert lamports to SOL
          setUserBalance(solBalance)
        } catch (error) {
          console.error("Failed to fetch user balance:", error)
          setUserBalance(0)
        }
      } else {
        setUserBalance(0)
      }
    }

    fetchUserBalance()
  }, [connected, publicKey, connection])

  const handleNumberClick = (number: string) => {
    if (number === ".") {
      if (!amount.includes(".")) {
        handleAmountChange(amount + ".")
      }
    } else {
      handleAmountChange(amount + number)
    }
  }

  const handleBackspace = () => {
    const newAmount = amount.slice(0, -1)
    handleAmountChange(newAmount)
  }

  const handleClear = () => {
    handleAmountChange("")
  }

  // Handle percentage selection
  const handlePercentageClick = (percentage: number) => {
    if (userBalance > 0) {
      const solAmount = (userBalance * percentage) / 100
      if (inputMode === 'SOL') {
        setAmount(solAmount.toFixed(6))
      } else {
        // For USDC, convert SOL amount to USDC equivalent
        const usdcAmount = solAmount * solPrice // Assuming 1 SOL = solPrice USDC
        setAmount(usdcAmount.toFixed(2))
      }
      setSelectedPercentage(percentage)
    }
  }

  // Handle custom amount input
  const handleAmountChange = (value: string) => {
    setAmount(value)
    setSelectedPercentage(null) // Clear percentage selection when manually entering amount
  }

  const handleConfirmAmount = () => {
    if (parseFloat(amount) > 0) {
      setStep("confirming")
    }
  }

  const handleDeposit = async () => {
    if (!connected) {
      setStep("error")
      return
    }

    setStep("loading")
    
    try {
      // Convert to SOL amount for deposit
      const solAmount = inputMode === 'SOL' ? parseFloat(amount) : (parseFloat(amount) / solPrice)
      const result = await deposit(solAmount)
      
      if (result.success) {
        setTxHash(result.txHash || "")
        setSharesReceived(result.sharesReceived || 0)
        setStep("success")
      } else {
        setStep("error")
      }
    } catch (err: any) {
      console.error("Deposit failed:", err)
      setStep("error")
    }
  }

  const resetModal = () => {
    setStep("amount")
    setAmount("")
    setUsdValue(0)
    setTxHash("")
    setSharesReceived(0)
    setInputMode('SOL')
    setInputError(null)
    setSelectedPercentage(null)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const renderAmountStep = () => {
    const solAmount = inputMode === 'SOL' ? parseFloat(amount || '0') : (parseFloat(amount || '0') / solPrice)
    const isDepositValid = amount && parseFloat(amount) > 0 && !inputError

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Deposit SOL</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-lg hover:bg-gray-100 sm:h-10 sm:w-10 sm:text-xl"
            onClick={handleClose}
          >
            ×
          </Button>
      </div>

        {!connected && (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Connect wallet to deposit</p>
          </div>
        )}

        {/* Balance Display */}
        {connected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />
                <span className="text-sm font-medium text-blue-900 sm:text-base">SOL Balance</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-blue-900 sm:text-base">
                  {userBalance.toFixed(4)} SOL
                </div>
                <div className="text-xs text-blue-600 sm:text-sm">
                  ≈ ${(userBalance * solPrice).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Currency Mode Toggle */}
        {connected && userBalance > 0 && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 h-8 sm:h-10 text-xs sm:text-sm font-medium transition-all ${
                inputMode === 'SOL' 
                  ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                setInputMode('SOL')
                setAmount('')
                setSelectedPercentage(null)
              }}
            >
              SOL
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 h-8 sm:h-10 text-xs sm:text-sm font-medium transition-all ${
                inputMode === 'USDC' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => {
                setInputMode('USDC')
                setAmount('')
                setSelectedPercentage(null)
              }}
            >
              USDC
            </Button>
          </div>
        )}

        {/* Percentage Selection */}
        {connected && userBalance > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Select</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[25, 50, 75].map((percentage) => {
                const isSelected = selectedPercentage === percentage
                
                return (
                  <Button
                    key={percentage}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={`h-10 sm:h-12 text-sm sm:text-base font-medium transition-all ${
                      isSelected 
                        ? "bg-primary text-white shadow-lg ring-2 ring-primary/20" 
                        : "hover:bg-primary/10 hover:border-primary/50"
                    }`}
                    onClick={() => handlePercentageClick(percentage)}
                  >
                    {percentage}%
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Amount Display */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary mb-1">
            {amount || "0"} {inputMode}
          </div>
          <div className="text-sm sm:text-base text-muted-foreground">
            {inputMode === 'SOL' 
              ? `≈ $${usdValue.toFixed(2)} USD` 
              : `≈ ${solAmount.toFixed(4)} SOL`
            }
          </div>
          {selectedPercentage && (
            <div className="text-xs sm:text-sm text-primary font-medium mt-1">
              {selectedPercentage}% of balance
            </div>
          )}
          
          {/* Error Display */}
          {inputError && (
            <div className="mt-2 text-xs text-red-600 flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {inputError}
            </div>
          )}
          
          {isDepositValid && (
            <div className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Ready to deposit
            </div>
          )}
        </div>

        {/* Enhanced Keypad with Better Spacing */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <Button
              key={item}
              variant="outline"
              size="sm"
              className="h-12 sm:h-14 text-base sm:text-lg font-medium hover:bg-primary/10 focus:ring-2 focus:ring-primary/20 active:scale-95 transition-transform"
              onClick={() => handleNumberClick(item.toString())}
              disabled={step !== "amount"}
            >
              {item}
            </Button>
          ))}
          
          {/* Decimal Point - Visually Separated */}
          <Button
            variant="outline"
            size="sm"
            className="h-12 sm:h-14 text-base sm:text-lg font-medium hover:bg-primary/10 focus:ring-2 focus:ring-primary/20 border-dashed active:scale-95 transition-transform"
            onClick={() => handleNumberClick(".")}
            disabled={step !== "amount" || amount.includes(".")}
          >
            .
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-12 sm:h-14 text-base sm:text-lg font-medium hover:bg-primary/10 focus:ring-2 focus:ring-primary/20 active:scale-95 transition-transform"
            onClick={() => handleNumberClick("0")}
            disabled={step !== "amount"}
          >
            0
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-12 sm:h-14 text-base sm:text-lg font-medium hover:bg-red-100 hover:border-red-300 focus:ring-2 focus:ring-red-200 active:scale-95 transition-transform"
            onClick={handleBackspace}
            disabled={step !== "amount" || !amount}
          >
            <Delete className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1 h-12 sm:h-14 text-sm sm:text-base active:scale-95 transition-transform"
            disabled={step !== "amount"}
          >
            Clear
        </Button>
        <Button 
          onClick={handleConfirmAmount}
            disabled={!connected || !isDepositValid}
            className="flex-1 h-12 sm:h-14 bg-primary hover:bg-primary/90 text-sm sm:text-base font-medium disabled:opacity-50 active:scale-95 transition-transform"
        >
            Deposit
        </Button>
      </div>
    </div>
  )
  }

  const renderConfirmingStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold">Confirm Deposit</h2>
        <p className="text-sm text-muted-foreground">Review your transaction</p>
      </div>

      {/* Compact Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-semibold">{amount} SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value:</span>
            <span className="text-sm font-semibold">${usdValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Shares:</span>
            <span className="text-sm font-semibold">~{Math.round(usdValue / 100)}</span>
          </div>
        </div>
          </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setStep("amount")} 
          className="flex-1 h-10 text-sm"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back
        </Button>
        <Button 
          onClick={handleDeposit}
          className="flex-1 h-10 bg-primary hover:bg-primary/90 text-sm font-medium"
        >
          Confirm
        </Button>
      </div>
    </div>
  )

  const renderLoadingStep = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      
      <div>
        <h2 className="text-lg font-bold mb-1">Processing Deposit</h2>
        <p className="text-sm text-muted-foreground">Confirming on Solana</p>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <span className="text-xs">Validating transaction</span>
            </div>
          <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span className="text-xs">Confirming on blockchain</span>
            </div>
            </div>
          </div>
    </div>
  )

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-lg font-bold mb-1 text-green-600">Deposit Successful!</h2>
        <p className="text-sm text-muted-foreground">Your SOL has been deposited</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Amount:</span>
            <span className="text-xs font-semibold">{amount} SOL</span>
            </div>
            <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Shares:</span>
            <span className="text-xs font-semibold">{sharesReceived.toLocaleString()}</span>
            </div>
          {txHash && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Transaction:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-xs">
                  {txHash.slice(0, 8)}...
                </span>
                <a
                  href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
            </div>
          </div>

      <Button 
        onClick={handleClose}
        className="w-full h-10 bg-primary hover:bg-primary/90 text-sm font-medium"
      >
        Done
      </Button>
    </div>
  )

  const renderErrorStep = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      
      <div>
        <h2 className="text-lg font-bold mb-1 text-red-600">Transaction Failed</h2>
        <p className="text-sm text-muted-foreground">Deposit could not be processed</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="text-xs text-red-800">
          {error ? `Error: ${error}` : "Transaction failed. Please try again."}
            </div>
          </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => setStep("amount")} 
          className="flex-1 h-10 text-sm"
        >
          Try Again
        </Button>
        <Button 
          onClick={handleClose} 
          className="flex-1 h-10 bg-primary hover:bg-primary/90 text-sm font-medium"
        >
          Close
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
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
