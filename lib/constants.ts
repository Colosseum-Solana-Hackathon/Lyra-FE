// Solana Program and Vault Addresses
export const VAULT_ADDRESS = "FsoSA6MxmuQ6yz9ZJ9EqmizYLZq8KoVWnoudpv1Yww8u";

// Your deployed program address
export const VAULT_PROGRAM_ID = "FsoSA6MxmuQ6yz9ZJ9EqmizYLZq8KoVWnoudpv1Yww8u";

// Vault Admin (the account that created the vault)
export const VAULT_ADMIN = "59j61YR6iUtYxHaqL8bJutN9XLDwwJXrnYhVGC2uDsxu";

// Vault Name (the name used when creating the vault)
export const VAULT_NAME = "SOL-BTC-ETH-Index";

// Mock Oracle for devnet testing (derived PDA: ["mock_oracle", admin_pubkey])
export const MOCK_ORACLE = "88Y7xK8ZzfQuYKjSM3Nqt6rvAkJLAoZAejU6z8piEUPo";

// Asset Mints for the ETF Vault (wrapped tokens on Solana)
export const BTC_MINT = "CqcPvtoEthDVBKv8bDtGYEoDLjNCDyA41AQPRb3L8pxA"; // Wrapped BTC
export const ETH_MINT = "66yFx2ySRRNxyhPRybdgzyWvFg3sVU6Erb7UhBgU2NS1"; // Wrapped ETH  
export const SOL_MINT = "DBLEUSQtyVuNsyTR7qGt1iJ1D4Mx2woMTiEVejWFfxSQ"; // Wrapped SOL


// Switchboard Oracle Feeds (Mainnet) - Only used if NOT using mock oracle
export const BTC_USD_FEED = "DAXAq94Y5nX2dDp15SdeBzYRqTn8viFf9Dxq4ws7rHec";
export const ETH_USD_FEED = "DAXAq94Y5nX2dDp15SdeBzYRqTn8viFf9Dxq4ws7rHec"; 
export const SOL_USD_FEED = "DAXAq94Y5nX2dDp15SdeBzYRqTn8viFf9Dxq4ws7rHec";
// Marinade Finance addresses (if using Marinade strategy)
export const MARINADE_STATE = "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC";
export const MSOL_MINT = "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So";
export const MARINADE_PROGRAM_ID = "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD";
export const MARINADE_STRATEGY_PROGRAM = "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"; // Replace

// Network configuration
export const NETWORK = "devnet"; // or "mainnet-beta"
export const RPC_URL = "https://api.devnet.solana.com"; // or mainnet RPC

