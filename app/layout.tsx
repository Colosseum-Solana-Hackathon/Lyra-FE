import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import GradientBackdrop from "@/components/GradientBackdrop"
import { SolanaWalletProvider } from "@/components/wallet/wallet-provider"
import { ClientProviders } from "@/components/providers/client-providers"
import Footer from "@/components/footer" // add this import (adjust path if needed)
import AppLoader from "@/components/app-loader"

export const metadata: Metadata = {
  title: "Lyra",
  description: "Lyra — Hedged Crypto ETFs",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark antialiased">
       <head>
        <link rel="icon" href="/favicon.ico" sizes="196x196" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <SolanaWalletProvider>
            <ClientProviders>
              <GradientBackdrop>{children}</GradientBackdrop>
            </ClientProviders>
          </SolanaWalletProvider>
        </Suspense>
        <Footer />
        <AppLoader />

        <Analytics />
      </body>
    </html>
  )
}
