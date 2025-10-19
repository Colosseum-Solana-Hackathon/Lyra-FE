# Solana API Integration Guide

This document explains how to integrate the mock Solana API service with your Lyra ETF frontend application.

## Overview

The mock API service (`lib/solana-api.ts`) simulates all the RPC calls you would make to interact with a Solana smart contract. It provides:

- **Type-safe interfaces** for all operations
- **Mock transaction simulation** with realistic delays
- **Event logging** for deposits, withdrawals, and rebalances
- **Balance tracking** for users and vault
- **Error handling** with detailed error messages

## Architecture

```
Frontend Components
        ↓
SolanaService (lib/solana-service.ts)
        ↓
SolanaApiService (lib/solana-api.ts)
        ↓
Mock Data Store (in-memory simulation)
```

## Key Components

### 1. SolanaApiService (`lib/solana-api.ts`)

The core mock API service that simulates RPC calls:

```typescript
import { solanaApi } from '@/lib/solana-api';

// Get vault information
const vaultInfo = await solanaApi.getVaultInfo();

// Deposit SOL
const result = await solanaApi.depositSOL(userAddress, amount, signTransaction);

// Get user position
const position = await solanaApi.getUserPosition(userAddress);
```

### 2. SolanaService (`lib/solana-service.ts`)

A wrapper service that provides a clean interface for frontend components:

```typescript
import { solanaService } from '@/lib/solana-service';

// Deposit SOL
const result = await solanaService.depositSOL(publicKey, amount, signTransaction);

// Get vault info
const vaultInfo = await solanaService.getVaultInfo();
```

### 3. React Hook (`hooks/use-solana-deposit.ts`)

A React hook that manages Solana transactions:

```typescript
import { useSolanaDeposit } from '@/hooks/use-solana-deposit';

const { deposit, isLoading, error, checkBalance } = useSolanaDeposit();
```

## API Reference

### Vault Operations

#### `getVaultInfo(): Promise<VaultInfo>`
Returns current vault information including total value, shares, and APY.

```typescript
const vaultInfo = await solanaApi.getVaultInfo();
console.log(vaultInfo.totalValue); // Total SOL in vault
console.log(vaultInfo.sharePrice); // Current share price
console.log(vaultInfo.apy); // Annual percentage yield
```

#### `getUserPosition(userAddress: string): Promise<UserPosition>`
Returns user's position in the vault.

```typescript
const position = await solanaApi.getUserPosition(userAddress);
console.log(position.shares); // User's share balance
console.log(position.solValue); // Current SOL value of shares
console.log(position.unrealizedPnl); // Unrealized profit/loss
```

### Transaction Operations

#### `depositSOL(userAddress, amount, signTransaction): Promise<DepositResult>`
Deposits SOL into the vault and mints shares.

```typescript
const result = await solanaApi.depositSOL(
  userAddress,
  1.5, // 1.5 SOL
  signTransaction
);

if (result.success) {
  console.log(`Received ${result.sharesReceived} shares`);
  console.log(`Transaction: ${result.transactionSignature}`);
}
```

#### `withdrawSOL(userAddress, shares, signTransaction): Promise<WithdrawResult>`
Withdraws SOL by burning shares.

```typescript
const result = await solanaApi.withdrawSOL(
  userAddress,
  1000, // 1000 shares
  signTransaction
);

if (result.success) {
  console.log(`Received ${result.solReceived} SOL`);
}
```

### Utility Functions

#### `checkUserBalance(userAddress, requiredAmount): Promise<boolean>`
Checks if user has sufficient SOL balance.

```typescript
const hasBalance = await solanaApi.checkUserBalance(userAddress, 1.0);
if (!hasBalance) {
  console.log("Insufficient balance");
}
```

#### `getTransactionStatus(signature): Promise<TransactionStatus>`
Checks transaction confirmation status.

```typescript
const status = await solanaApi.getTransactionStatus(signature);
console.log(`Confirmed: ${status.confirmed}, Success: ${status.success}`);
```

#### `getRecentEvents(limit): Promise<VaultEvent[]>`
Gets recent vault events.

```typescript
const events = await solanaApi.getRecentEvents(10);
events.forEach(event => {
  console.log(`${event.type}: ${event.amount} SOL`);
});
```

## Type Definitions

### VaultInfo
```typescript
interface VaultInfo {
  totalValue: number;        // Total SOL value in vault
  totalShares: number;       // Total shares minted
  sharePrice: number;        // Current share price in lamports
  apy: number;              // Annual percentage yield
  totalDeposits: number;     // Total deposits made
  totalWithdrawals: number;  // Total withdrawals made
  lastRebalance: Date;       // Last rebalance timestamp
  performance: number;        // Performance percentage
}
```

### UserPosition
```typescript
interface UserPosition {
  shares: number;           // User's share balance
  solValue: number;         // Current SOL value of shares
  usdValue: number;         // Current USD value of shares
  avgEntryPrice: number;    // Average entry price per share
  unrealizedPnl: number;    // Unrealized profit/loss
  realizedPnl: number;      // Realized profit/loss
  totalDeposits: number;    // Total SOL deposited
  totalWithdrawals: number; // Total SOL withdrawn
}
```

### DepositResult
```typescript
interface DepositResult {
  success: boolean;
  transactionSignature?: string;
  error?: string;
  sharesReceived?: number;
  gasUsed?: number;
}
```

## Integration Examples

### 1. Basic Deposit Flow

```typescript
import { useSolanaDeposit } from '@/hooks/use-solana-deposit';

function DepositComponent() {
  const { deposit, isLoading, error } = useSolanaDeposit();
  
  const handleDeposit = async (amount: number) => {
    const result = await deposit(amount);
    if (result.success) {
      console.log(`Deposit successful: ${result.sharesReceived} shares`);
    } else {
      console.error(`Deposit failed: ${result.error}`);
    }
  };
  
  return (
    <button 
      onClick={() => handleDeposit(1.0)}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Deposit 1 SOL'}
    </button>
  );
}
```

### 2. Vault Information Display

```typescript
import { useEffect, useState } from 'react';
import { solanaService } from '@/lib/solana-service';
import { VaultInfo } from '@/lib/solana-api';

function VaultInfoComponent() {
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  
  useEffect(() => {
    const fetchVaultInfo = async () => {
      try {
        const info = await solanaService.getVaultInfo();
        setVaultInfo(info);
      } catch (error) {
        console.error('Failed to fetch vault info:', error);
      }
    };
    
    fetchVaultInfo();
  }, []);
  
  if (!vaultInfo) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>ETF Vault</h2>
      <p>Total Value: {vaultInfo.totalValue.toLocaleString()} SOL</p>
      <p>Share Price: {vaultInfo.sharePrice / 1_000_000} SOL</p>
      <p>APY: {vaultInfo.apy}%</p>
    </div>
  );
}
```

### 3. User Position Tracking

```typescript
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { solanaService } from '@/lib/solana-service';
import { UserPosition } from '@/lib/solana-api';

function UserPositionComponent() {
  const { publicKey } = useWallet();
  const [position, setPosition] = useState<UserPosition | null>(null);
  
  useEffect(() => {
    if (!publicKey) return;
    
    const fetchPosition = async () => {
      try {
        const pos = await solanaService.getUserPosition(publicKey);
        setPosition(pos);
      } catch (error) {
        console.error('Failed to fetch position:', error);
      }
    };
    
    fetchPosition();
  }, [publicKey]);
  
  if (!position) return <div>Loading position...</div>;
  
  return (
    <div>
      <h3>Your Position</h3>
      <p>Shares: {position.shares.toLocaleString()}</p>
      <p>SOL Value: {position.solValue.toFixed(4)} SOL</p>
      <p>USD Value: ${position.usdValue.toFixed(2)}</p>
      <p>P&L: {position.unrealizedPnl >= 0 ? '+' : ''}{position.unrealizedPnl.toFixed(4)} SOL</p>
    </div>
  );
}
```

## Production Migration

When you're ready to deploy to production:

1. **Replace Mock API**: Replace `solanaApi` calls with actual RPC calls
2. **Update Program IDs**: Use your deployed program addresses
3. **Add Real Transaction Logic**: Implement actual Solana transaction creation
4. **Add Error Handling**: Handle real Solana network errors
5. **Add Monitoring**: Add logging and monitoring for production

### Example Production Migration

```typescript
// Before (Mock)
const result = await solanaApi.depositSOL(userAddress, amount, signTransaction);

// After (Production)
const result = await solanaService.depositSOL(publicKey, amount, signTransaction);
```

## Error Handling

The API provides comprehensive error handling:

```typescript
try {
  const result = await solanaService.depositSOL(publicKey, amount, signTransaction);
  
  if (!result.success) {
    console.error('Deposit failed:', result.error);
    // Handle specific error cases
    if (result.error?.includes('Insufficient')) {
      // Show balance error
    } else if (result.error?.includes('Network')) {
      // Show network error
    }
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Testing

The mock API is designed for easy testing:

```typescript
// Test deposit
const result = await solanaApi.depositSOL('test-user', 1.0, mockSignTransaction);
expect(result.success).toBe(true);
expect(result.sharesReceived).toBeGreaterThan(0);

// Test error cases
const errorResult = await solanaApi.depositSOL('test-user', -1.0, mockSignTransaction);
expect(errorResult.success).toBe(false);
expect(errorResult.error).toContain('Invalid amount');
```

## Conclusion

This mock API service provides a complete simulation of Solana smart contract interactions, allowing you to:

- **Develop and test** your frontend without a deployed contract
- **Understand** the data flow and error handling
- **Plan** the production integration
- **Build** a robust user experience

When you're ready to deploy, simply replace the mock implementations with actual RPC calls to your deployed Solana program.
