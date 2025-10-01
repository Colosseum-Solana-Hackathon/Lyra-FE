import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import GradientBackdrop from "@/components/GradientBackdrop"
import { SolanaWalletProvider } from "@/components/wallet/wallet-provider"

export const metadata: Metadata = {
  title: "Lyra",
  description: "Lyra — sleek web3 swapping",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <SolanaWalletProvider>
            <GradientBackdrop>{children}</GradientBackdrop>
          </SolanaWalletProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
