"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OnrampWidget } from "@/components/onramp/onramp-widget"
import { OnrampTabs } from "@/components/onramp/onramp-tabs"
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  DollarSign,
  Clock,
  Users,
  Star
} from "lucide-react"

const OnrampPage = () => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)

  const onrampProviders = [
    {
      name: "Moonpay",
      description: "Buy crypto with your credit card instantly",
      features: ["Instant purchases", "Credit/Debit cards", "150+ countries"],
      fees: "1-4.5%",
      time: "Instant",
      rating: 4.8,
      logo: "🌙",
      color: "from-purple-500 to-pink-500",
      popular: true
    },
    {
      name: "Transak",
      description: "Global fiat to crypto gateway",
      features: ["Bank transfers", "Apple Pay", "Google Pay"],
      fees: "0.5-2.5%",
      time: "1-5 min",
      rating: 4.6,
      logo: "💳",
      color: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Ramp",
      description: "Non-custodial crypto purchases",
      features: ["Self-custody", "Low fees", "EU regulated"],
      fees: "0.63-2.9%",
      time: "1-3 min",
      rating: 4.7,
      logo: "🚀",
      color: "from-green-500 to-emerald-500",
      popular: false
    },
    {
      name: "Coinbase Pay",
      description: "Seamless integration with Coinbase",
      features: ["Coinbase integration", "Instant deposits", "USDC support"],
      fees: "0.5-1.5%",
      time: "Instant",
      rating: 4.5,
      logo: "🔵",
      color: "from-indigo-500 to-blue-500",
      popular: false
    }
  ]

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description: "All providers are fully regulated and secure"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Processing",
      description: "Get your crypto in seconds, not hours"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Access",
      description: "Available in 150+ countries worldwide"
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Best Rates",
      description: "Competitive fees and real-time pricing"
    }
  ]

  return (
    <main className="min-h-dvh bg-background">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            Trusted by 1M+ users
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight">
            Buy Crypto with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fiat Currency
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-2xl mx-auto px-4">
            Seamlessly purchase cryptocurrency using your preferred payment method. 
            Choose from multiple trusted providers with competitive rates and instant processing.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Onramp Tabbed Widget */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-4">
            Choose Your Onramp
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Switch tabs to compare Moonpay, Transak, and Coinbase. Continue to proceed.
        </p>
      </div>

        <OnrampTabs
          providers={onrampProviders.filter(p => p.name !== 'Ramp')}
          onContinue={(p) => setSelectedProvider(p)}
        />
      </section>

      {/* Onramp Widget Modal */}
      {selectedProvider && (
        <OnrampWidget 
          provider={selectedProvider} 
          onClose={() => setSelectedProvider(null)} 
        />
      )}
    </main>
  )
}

export default OnrampPage;
