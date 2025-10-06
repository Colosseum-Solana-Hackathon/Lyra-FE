"use client"

import { ReactNode } from "react"
import dynamic from "next/dynamic"

const MoonPayProvider = dynamic(
  () => import('@moonpay/moonpay-react').then((mod) => mod.MoonPayProvider),
  { ssr: false },
)

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <MoonPayProvider 
      apiKey={process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "pk_test_123"} 
      debug={process.env.NODE_ENV === "development"}
    >
      {children}
    </MoonPayProvider>
  )
}
