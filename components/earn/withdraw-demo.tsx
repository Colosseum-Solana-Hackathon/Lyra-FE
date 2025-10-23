"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { WithdrawModal } from "./withdraw-modal"
import { TrendingDown } from "lucide-react"

export function WithdrawDemo() {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Withdraw from Vault</h2>
        <p className="text-muted-foreground">Redeem your shares for SOL</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Vault Shares</h3>
            <p className="text-sm text-muted-foreground">Redeem your shares</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Your Shares:</span>
            <span className="font-semibold">10.5 shares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estimated Value:</span>
            <span className="font-semibold">~$1,575 USD</span>
          </div>
        </div>

        <Button 
          onClick={() => setIsWithdrawOpen(true)}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
        >
          Withdraw Shares
        </Button>
      </div>

      <WithdrawModal 
        isOpen={isWithdrawOpen} 
        onClose={() => setIsWithdrawOpen(false)} 
      />
    </div>
  )
}
