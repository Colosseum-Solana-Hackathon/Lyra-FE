"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, Star } from "lucide-react"
import { MoonPayWidget } from "./moonpay-widget"

type OnrampProvider = {
  name: string
  description: string
  features: string[]
  fees: string
  time: string
  rating: number
  logo: string
  color: string
  popular?: boolean
}

export function OnrampTabs({
  providers,
  onContinue,
}: {
  providers: OnrampProvider[]
  onContinue: (provider: OnrampProvider) => void
}) {
  const [showMoonPayWidget, setShowMoonPayWidget] = useState(false)
  const first = providers[0]?.name ?? "Moonpay"

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Select an Onramp</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Compare options, fees, and processing times. Continue when ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-6">
        <Tabs defaultValue={first} className="w-full">
          <TabsList className="w-full">
            {providers.map((p) => (
              <TabsTrigger key={p.name} value={p.name} className="flex-1 px-3 py-2">
                <span className={`mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${p.color}`}>{p.logo}</span>
                {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {providers.map((p) => (
            <TabsContent key={p.name} value={p.name} className="mt-4">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-border/50 bg-card/60">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${p.color} flex items-center justify-center text-lg`}>{p.logo}</div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl truncate">{p.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">{p.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Fees:</span>
                        <span className="font-medium">{p.fees}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{p.time}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-xs sm:text-sm">Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {p.features.map((f, i) => (
                          <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Summary</CardTitle>
                    <CardDescription>Quick overview for {p.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{p.rating} / 5</span>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
                      onClick={() => {
                        console.log('Onramp: Button clicked for', p.name)
                        if (p.name === "Moonpay") {
                          console.log('Onramp: Setting showMoonPayWidget to true')
                          setShowMoonPayWidget(true)
                        } else {
                          onContinue(p)
                        }
                      }}
                    >
                      Continue with {p.name}
                    </Button>
                    <Button variant="outline" className="w-full">Learn more</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
      {/* MoonPay Widget Modal */}
      {showMoonPayWidget && (
        <>
          {console.log('Onramp: Rendering MoonPay widget modal')}
          <MoonPayWidget onClose={() => {
            console.log('Onramp: Closing MoonPay widget')
            setShowMoonPayWidget(false)
          }} />
        </>
      )}
    </Card>
  )
}


