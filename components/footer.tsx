'use client'

import { Youtube, Github, Mail, Globe, MapPin, Linkedin } from "lucide-react"
// import { X } from "../public/images/logo-x.png"

export default function Footer() {
    return (
        <footer className="bg-gradient-to-t from-card/80 via-background/60 to-transparent border-t border-primary/10 text-sm text-muted-foreground">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Brand / About */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <img src="/images/lyra-logo.png" alt="Lyra logo" className="h-14 w-auto" />
                        <div>
                            <h3 className="text-xl font-semibold text-primary">Lyra</h3>
                            <p className="text-xs text-muted-foreground">Break Free from Tradfi.</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground/90 max-w-sm">
                        Transact on Solana. Lyra provides an easy way to connect wallets, buy crypto, swap tokens, and invest in ETF's — powered by community tools and open integrations.
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/5 transition">
                            <Youtube className="h-5 w-5 text-primary" />
                        </a>
                        <a href="https://x.com/LyraMSquare" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/5 transition">
                            <img src="/images/logo-x.png" alt="X (Twitter)" className="h-5 w-5" style={{ filter: 'hue-rotate(120deg) saturate(1.5) brightness(1.2)' }} />
                        </a>

                        {/* <a href="https://reddit.com/" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/5 transition">
              <Reddit className="h-5 w-5 text-primary" />
            </a> */}
                        <a href="https://github.com/" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/5 transition">
                            <Github className="h-5 w-5 text-primary" />
                        </a>
                        <a href="https://www.linkedin.com/company/lyramsquare" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-primary/5 transition">
                            <Linkedin className="h-5 w-5 text-green-500" />
                        </a>
                    </div>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-primary font-semibold mb-3">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a className="hover:text-primary transition" href="/onramp">Onramp</a></li>
                            <li><a className="hover:text-primary transition" href="/swap">Swap</a></li>
                            <li><a className="hover:text-primary transition" href="/dashboard">Dashboard</a></li>
                            <li><a className="hover:text-primary transition" href="/docs">Docs</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-primary font-semibold mb-3">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a className="hover:text-primary transition" href="#">About</a></li>
                            <li><a className="hover:text-primary transition" href="#">Careers</a></li>
                            <li><a className="hover:text-primary transition" href="#">Grants</a></li>
                            <li><a className="hover:text-primary transition" href="#">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                {/* Contact / Newsletter */}
                <div className="space-y-4">
                    <h4 className="text-primary font-semibold">Stay connected</h4>
                    <p className="text-sm text-muted-foreground/90">Get product updates, developer guides, and community news.</p>

                    <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault()
                            // simple client-side behavior: copy contact hint to clipboard
                            void navigator.clipboard?.writeText("subscribe@lyra.example")
                        }}
                    >
                        <input
                            aria-label="Email"
                            placeholder="you@domain.com"
                            className="flex-1 bg-background border border-primary/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="ml-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95">
                            Subscribe
                        </button>
                    </form>

                    <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <div className="font-medium text-primary">Headquarters</div>
                            <div className="text-xs text-muted-foreground">Trento, TN</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Globe className="h-4 w-4 text-primary" />
                        <span>Available on Solana Devnet</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-primary/6 mt-6">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Lyra • Built for Solana.</p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-xs hover:text-primary transition">Terms</a>
                        <a href="#" className="text-xs hover:text-primary transition">Security</a>
                        <a href="mailto:hello@lyra.example" className="flex items-center gap-2 text-xs hover:text-primary transition">
                            <Mail className="h-4 w-4" /> Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
