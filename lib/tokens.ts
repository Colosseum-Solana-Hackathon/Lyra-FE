export type Token = {
  symbol: string
  name: string
  network: string
  icon: string
  address?: string 
  chainId: number 
  decimals: number
  isNative?: boolean 
  badge?: string
  archived?: boolean
}

export const TOKENS: Token[] = [
  {
    symbol: "STELLA",
    name: "Stella",
    network: "Moonbeam",
    icon: "/stella-token-icon.jpg",
    address: "", // unknown here
    chainId: 1284,
    decimals: 18,
    archived: true,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    network: "Ethereum",
    icon: "/usdc-token-icon.jpg",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: 1,
    decimals: 6,
    badge: "erc20",
  },
  {
    symbol: "stDOT",
    name: "stDOT",
    network: "Moonbeam",
    icon: "/stdot-token-icon.jpg",
    chainId: 1284,
    decimals: 10,
    address: "", // fill when available
    archived: true,
  },
  {
    symbol: "GLMR",
    name: "Moonbeam",
    network: "Moonbeam",
    icon: "/glmr-token-icon.jpg",
    chainId: 1284,
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "ACA",
    name: "Acala",
    network: "Polkadot",
    icon: "/acala-token-icon.jpg",
    chainId: 1284,
    decimals: 12,
    address: "",
    archived: true,
  },
  {
    symbol: "aSEED",
    name: "Acala Dollar",
    network: "Polkadot",
    icon: "/aseed-token-icon.jpg",
    chainId: 1284,
    decimals: 12,
    address: "",
    archived: true,
  },
  {
    symbol: "ASTR",
    name: "Astar Network",
    network: "Astar",
    icon: "/astr-token-icon.jpg",
    chainId: 592,
    decimals: 18,
    address: "",
    archived: true,
  },
]

export function findTokenBySymbol(symbol: string) {
  return TOKENS.find((t) => t.symbol === symbol)
}
