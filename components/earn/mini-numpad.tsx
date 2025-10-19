"use client"

import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

interface MiniNumpadProps {
  onNumberClick: (number: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
  disabled?: boolean
}

export function MiniNumpad({ onNumberClick, onBackspace, onClear, onConfirm, disabled = false }: MiniNumpadProps) {
  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"]
  ]

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {numbers.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <Button
            key={`${rowIndex}-${colIndex}`}
            variant="outline"
            size="sm"
            className="h-10 w-10 text-sm font-medium hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
            onClick={() => {
              if (item === "⌫") {
                onBackspace()
              } else {
                onNumberClick(item)
              }
            }}
            disabled={disabled}
          >
            {item === "⌫" ? <Delete className="h-3 w-3" /> : item}
          </Button>
        ))
      )}
      <Button
        variant="outline"
        size="sm"
        className="col-span-2 h-10 text-sm font-medium hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-200"
        onClick={onClear}
        disabled={disabled}
      >
        Clear
      </Button>
      <Button
        size="sm"
        className="h-10 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-sm font-medium transition-all duration-200"
        onClick={onConfirm}
        disabled={disabled}
      >
        ✓
      </Button>
    </div>
  )
}
