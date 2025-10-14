"use client"

import { Button } from "@/components/ui/button"
import { Delete } from "lucide-react"

interface NumpadProps {
  onNumberClick: (number: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
  disabled?: boolean
}

export function Numpad({ onNumberClick, onBackspace, onClear, onConfirm, disabled = false }: NumpadProps) {
  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"]
  ]

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {numbers.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <Button
            key={`${rowIndex}-${colIndex}`}
            variant="outline"
            className="h-16 w-16 text-xl font-medium hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 hover:scale-105"
            onClick={() => {
              if (item === "⌫") {
                onBackspace()
              } else {
                onNumberClick(item)
              }
            }}
            disabled={disabled}
          >
            {item === "⌫" ? <Delete className="h-5 w-5" /> : item}
          </Button>
        ))
      )}
      <Button
        variant="outline"
        className="col-span-2 h-16 text-lg font-medium hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all duration-200"
        onClick={onClear}
        disabled={disabled}
      >
        Clear
      </Button>
      <Button
        className="h-16 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg font-medium transition-all duration-200 hover:scale-105"
        onClick={onConfirm}
        disabled={disabled}
      >
        ✓
      </Button>
    </div>
  )
}
