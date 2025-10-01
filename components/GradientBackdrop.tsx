import type { ReactNode } from "react"

export default function GradientBackdrop({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh lyra-gradient lyra-grid-overlay">{children}</div>
}
