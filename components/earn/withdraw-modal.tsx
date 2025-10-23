"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Wallet, TrendingDown, ExternalLink, Zap, Delete, Percent } from "lucide-react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useSolanaWithdraw } from "@/hooks/use-solana-withdraw"
import { PublicKey } from "@solana/web3.js"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

type WithdrawStep = "amount" | "confirming" | "loading" | "success" | "error"

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [step, setStep] = useState<WithdrawStep>("amount")
  const [amount, setAmount] = useState("")
  const [usdValue, setUsdValue] = useState(0)
  const [txHash, setTxHash] = useState("")
  const [sharesRedeemed, setSharesRedeemed] = useState(0)
  const [userShares, setUserShares] = useState(0)
  const [inputMode, setInputMode] = useState<'Shares' | 'USDC'>('Shares')
  const [inputError, setInputError] = useState<string | null>(null)
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)
  
  // Solana integration
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const { withdraw, isLoading, error, lastTransaction, checkShares } = useSolanaWithdraw()
  
  // Mock SOL price (in production, fetch from API)
  const solPrice = 150.25

  useEffect(() => {
    if (amount) {
      if (inputMode === 'Shares') {
        // For shares, calculate USD value based on share price
        setUsdValue(parseFloat(amount) * solPrice)
      } else {
        // For USDC, the amount is already in USD
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
    const sharesToRedeem = inputMode === 'Shares' ? numAmount : numAmount / solPrice

    if (sharesToRedeem > userShares) {
      setInputError(`Insufficient shares. You have ${userShares.toFixed(4)} shares available.`)
    } else if (sharesToRedeem < 0.001) {
      setInputError('Minimum withdraw amount is 0.001 shares')
    } else {
      setInputError(null)
    }
  }, [amount, inputMode, userShares, solPrice])

  // Fetch user shares when wallet connects
  useEffect(() => {
    const fetchUserShares = async () => {
      if (connected && publicKey && connection) {
        try {
          // Fetch vault token balance from wallet
          // The vault token mint address from your constants
          const vaultTokenMint = "Bgh1fPAzo15Jgv1dzjfc4hbw2YxAKwe46hoRUEAcTvWK" // From your constants
          
          // Get token accounts for the user
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(vaultTokenMint)
          })
          
          if (tokenAccounts.value.length > 0) {
            // Get the balance from the first token account
            const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount
            setUserShares(balance || 0)
            console.log("Vault token balance:", balance)
          } else {
            setUserShares(0)
            console.log("No vault token account found")
          }
        } catch (error) {
          console.error("Failed to fetch user shares:", error)
          setUserShares(0)
        }
      } else {
        setUserShares(0)
      }
    }

    fetchUserShares()
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

  const handleAmountChange = (newAmount: string) => {
    // Allow only numbers and one decimal point
    if (newAmount === "" || /^\d*\.?\d*$/.test(newAmount)) {
      setAmount(newAmount)
      setSelectedPercentage(null)
    }
  }

  const handlePercentageClick = (percentage: number) => {
    const maxShares = userShares
    const calculatedShares = (maxShares * percentage) / 100
    
    if (inputMode === 'Shares') {
      setAmount(calculatedShares.toFixed(6))
    } else {
      // Convert shares to USDC equivalent
      const usdcAmount = calculatedShares * solPrice
      setAmount(usdcAmount.toFixed(2))
    }
    setSelectedPercentage(percentage)
  }

  const handleClear = () => {
    setAmount("")
    setSelectedPercentage(null)
  }

  const handleWithdraw = async () => {
    if (!connected || !publicKey) {
      setInputError("Please connect your wallet to withdraw")
      return
    }

    if (inputError) {
      return
    }

    setStep("loading")
    
    try {
      const numAmount = parseFloat(amount)
      // For withdrawal, we always pass the number of shares to redeem
      // The backend will calculate the SOL amount based on current share price
      const sharesToRedeem = inputMode === 'Shares' ? numAmount : numAmount / solPrice
      
      console.log(`[WithdrawModal] Redeeming ${sharesToRedeem} shares`)
      
      const result = await withdraw(sharesToRedeem)
      
      if (result.success) {
        setTxHash(result.transactionHash || "")
        setSharesRedeemed(result.sharesRedeemed || sharesToRedeem)
        setStep("success")
      } else {
        setInputError(result.error || "Withdrawal failed")
        setStep("error")
      }
    } catch (error) {
      console.error("Withdraw failed:", error)
      setStep("error")
    }
  }

  const handleClose = () => {
    setStep("amount")
    setAmount("")
    setUsdValue(0)
    setTxHash("")
    setSharesRedeemed(0)
    setSelectedPercentage(null)
    setInputError(null)
    onClose()
  }

  const renderAmountStep = () => (
    <div className="space-y-4">

      {/* Wallet Connection Status */}
      {!connected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 sm:h-5 sm:w-5" />
            <p className="text-sm text-yellow-800">Connect wallet to withdraw</p>
          </div>
        </div>
      )}

      {/* Shares Display */}
      {connected && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
              <span className="text-sm font-medium text-purple-900 sm:text-base">Vault Shares</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-purple-900 sm:text-base">
                {userShares.toFixed(4)} shares
              </div>
              <div className="text-xs text-purple-600 sm:text-sm">
                ≈ ${(userShares * solPrice).toFixed(2)} value
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Mode Toggle */}
      {connected && userShares > 0 && (
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 h-8 sm:h-10 text-xs sm:text-sm font-medium transition-all ${
              inputMode === 'Shares' 
                ? 'bg-green-100 text-green-800 border border-green-200 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => {
              setInputMode('Shares')
              setAmount('')
              setSelectedPercentage(null)
            }}
          >
            Shares
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
      {connected && userShares > 0 && (
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
          {inputMode === 'Shares' 
            ? `≈ $${usdValue.toFixed(2)} USD` 
            : `≈ ${(usdValue / solPrice).toFixed(4)} shares`
          }
        </div>
      </div>

      {/* Error Display */}
      {inputError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-800">{inputError}</p>
          </div>
        </div>
      )}

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
          onClick={() => setAmount(amount.slice(0, -1))}
          disabled={step !== "amount" || !amount}
        >
          <Delete className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          onClick={handleClose}
          className="flex-1 h-12 sm:h-14 text-sm sm:text-base active:scale-95 transition-transform"
          disabled={step !== "amount"}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => setStep("confirming")}
          disabled={!connected || !amount || !!inputError}
          className="flex-1 h-12 sm:h-14 bg-primary hover:bg-primary/90 text-sm sm:text-base font-medium disabled:opacity-50 active:scale-95 transition-transform"
        >
          Withdraw
        </Button>
      </div>
    </div>
  )

  const renderConfirmingStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-1">Confirm Withdrawal</h2>
        <p className="text-sm text-muted-foreground">Review your withdrawal details</p>
      </div>

      {/* Withdrawal Summary */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="text-sm font-semibold">{amount} {inputMode}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value:</span>
            <span className="text-sm font-semibold">${usdValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Shares to Redeem:</span>
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
          onClick={handleWithdraw}
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
        <h2 className="text-lg font-bold mb-1">Processing Withdrawal</h2>
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
        <h2 className="text-lg font-bold mb-1 text-green-600">Withdrawal Successful!</h2>
        <p className="text-sm text-muted-foreground">Your SOL has been withdrawn</p>
      </div>

      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-3">
        <div className="space-y-2">
            <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Amount:</span>
            <span className="text-xs font-semibold text-foreground">{amount} {inputMode}</span>
            </div>
            <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Shares Redeemed:</span>
            <span className="text-xs font-semibold text-foreground">{sharesRedeemed.toLocaleString()}</span>
            </div>
          {txHash && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Transaction:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded text-foreground">
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
        <h2 className="text-lg font-bold mb-1 text-red-600">Withdrawal Failed</h2>
        <p className="text-sm text-muted-foreground">Something went wrong</p>
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Withdraw from Vault</DialogTitle>
        </DialogHeader>
        
        <div className="px-1 py-2">
          {step === "amount" && renderAmountStep()}
          {step === "confirming" && renderConfirmingStep()}
          {step === "loading" && renderLoadingStep()}
          {step === "success" && renderSuccessStep()}
          {step === "error" && renderErrorStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}
