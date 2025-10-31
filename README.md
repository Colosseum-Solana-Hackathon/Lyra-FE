# Lyra Frontend

A modern, production-ready frontend for **Lyra** - a Solana-based ETF trading platform that provides institutional-grade DeFi exposure through diversified, yield-generating vaults.

## 🚀 Overview

Lyra is a sophisticated Web3 application built on Solana that enables users to:
- **Trade & Swap** cryptocurrencies with real-time pricing
- **Earn Yield** through ETF vaults with automated rebalancing
- **Onramp Fiat** to crypto using multiple trusted providers
- **Manage Portfolios** with institutional-grade tools

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14.2.16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1.9 with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Blockchain**: Solana Web3.js + Anchor Framework
- **State Management**: React Hooks + SWR
- **Deployment**: Vercel (production-ready)

### Project Structure

```
lyra-frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Portfolio dashboard
│   ├── earn/             # ETF vault management
│   ├── onramp/           # Fiat-to-crypto onramp
│   ├── swap/             # Token swapping interface
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui component library
│   ├── wallet/          # Solana wallet integration
│   ├── swap/            # Trading components
│   ├── earn/            # Vault management components
│   └── onramp/          # Onramp provider components
├── lib/                 # Core business logic
│   ├── solana-service.ts    # Solana blockchain service
│   ├── solana-api.ts        # Mock API for development
│   ├── jupiter.ts           # Jupiter DEX integration
│   └── constants.ts         # Configuration constants
├── hooks/               # Custom React hooks
│   ├── use-solana-deposit.ts
│   ├── use-solana-withdraw.ts
│   └── use-mobile.ts
└── public/              # Static assets
```

## 🔧 Key Features

### 1. **Solana Integration**
- **Wallet Support**: Phantom, Solflare, and other major wallets
- **Real-time Data**: Live SOL market data and vault performance
- **Transaction Management**: Secure deposit/withdrawal flows
- **Program Integration**: Direct interaction with Solana smart contracts

### 2. **ETF Vault System**
- **Automated Rebalancing**: Smart contract-based portfolio management
- **Yield Generation**: Earn from trading fees and rebalancing strategies
- **Multi-Asset Support**: SOL, BTC, ETH index fund exposure
- **Performance Tracking**: Real-time P&L and historical data

### 3. **Trading Interface**
- **Jupiter Integration**: Best-price routing for token swaps
- **Real-time Pricing**: Live market data integration
- **Slippage Protection**: Advanced trading parameters
- **Token Selection**: Comprehensive token picker with search

### 4. **Fiat Onramp**
- **Multiple Providers**: Moonpay, Transak, Coinbase Pay
- **Global Support**: 150+ countries supported
- **Instant Processing**: Real-time crypto purchases
- **Competitive Rates**: Best available pricing

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Solana CLI (for blockchain development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lyra-frontend

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Environment Setup

The application uses environment variables for configuration:

```bash
# .env.local
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_VAULT_ADDRESS=4CGJSLVrMmC3rznuUhJzTDtK6NH4sXXzLCun47W6dcSF
```

## 🔗 Solana Integration

### Smart Contract Architecture

Lyra integrates with a custom Solana program that manages:
- **ETF Vault**: Multi-asset portfolio with automated rebalancing
- **Share Token**: ERC-20-like token representing vault ownership
- **Oracle Integration**: Price feeds for rebalancing decisions
- **Fee Management**: Trading fees and performance fees

### Key Program Addresses

```typescript
// Vault Program
VAULT_PROGRAM_ID: "4CGJSLVrMmC3rznuUhJzTDtK6NH4sXXzLCun47W6dcSF"

// Vault Account
VAULT_ADDRESS: "4CGJSLVrMmC3rznuUhJzTDtK6NH4sXXzLCun47W6dcSF"

// Asset Mints
SOL_MINT: "DBLEUSQtyVuNsyTR7qGt1iJ1D4Mx2woMTiEVejWFfxSQ"
BTC_MINT: "CqcPvtoEthDVBKv8bDtGYEoDLjNCDyA41AQPRb3L8pxA"
ETH_MINT: "66yFx2ySRRNxyhPRybdgzyWvFg3sVU6Erb7UhBgU2NS1"
```

### API Service Layer

The application uses a layered architecture for Solana interactions:

```typescript
// Service Layer
import { solanaService } from '@/lib/solana-service';

// Deposit SOL into vault
const result = await solanaService.depositSOL(publicKey, amount, signTransaction);

// Get vault information
const vaultInfo = await solanaService.getVaultInfo();

// Check user position
const position = await solanaService.getUserPosition(publicKey);
```

## 🎨 Design System

### UI Components

Built with **shadcn/ui** and **Radix UI** for accessibility and customization:

- **Consistent Theming**: Dark mode with custom Lyra branding
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant components
- **Custom Styling**: Tailwind CSS with design tokens

### Color Palette

```css
:root {
  --lyra-primary: #00d4aa;      /* Lyra green */
  --lyra-accent: #7c3aed;       /* Purple accent */
  --lyra-background: #0a0a0a;   /* Dark background */
  --lyra-foreground: #ffffff;   /* White text */
}
```

## 🚀 Deployment

### Production Ready

The application is configured for production deployment on Vercel:

- **Build Optimization**: Static generation for all pages
- **Security Headers**: XSS protection, content type validation
- **Image Optimization**: Next.js image optimization enabled
- **Performance**: Bundle splitting and code optimization

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for automatic deployments
```

### Environment Variables

Set these in your Vercel dashboard:

```bash
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_VAULT_ADDRESS=your-mainnet-vault-address
```

## 📊 Performance

### Bundle Analysis

- **Total Bundle Size**: ~87.5 kB (shared JS)
- **First Load**: Optimized for fast initial render
- **Code Splitting**: Route-based splitting implemented
- **Image Optimization**: WebP format with responsive sizing

### Performance Features

- **React Strict Mode**: Development optimizations
- **Static Generation**: Pre-rendered pages for SEO
- **SWR Caching**: Efficient data fetching and caching
- **Lazy Loading**: Component-level code splitting

## 🔒 Security

### Security Headers

```javascript
// Security headers configured in next.config.mjs
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin'
}
```

### Wallet Security

- **Non-custodial**: Users maintain control of their private keys
- **Transaction Signing**: All transactions require user approval
- **Balance Validation**: Pre-transaction balance checks
- **Error Handling**: Comprehensive error handling and user feedback

## 🧪 Testing

### Development Testing

The application includes a comprehensive mock API for development:

```typescript
// Mock Solana API for development
import { solanaApi } from '@/lib/solana-api';

// Simulates real Solana RPC calls
const result = await solanaApi.depositSOL(userAddress, amount, signTransaction);
```

### Production Testing

- **Type Safety**: Full TypeScript coverage
- **Linting**: ESLint configuration for code quality
- **Build Validation**: Automated build checks

## 📚 Documentation

### Additional Resources

- [Solana API Integration Guide](./docs/solana-api-integration.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Component Library](./components/ui/)

### API Reference

For detailed API documentation, see the inline JSDoc comments in:
- `lib/solana-service.ts` - Main service layer
- `lib/solana-api.ts` - Mock API implementation
- `hooks/use-solana-*.ts` - React hooks

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and Next.js
- **Prettier**: Code formatting (if configured)
- **Conventional Commits**: Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the Solana integration guide

---

**Built with ❤️ for the Solana ecosystem**
