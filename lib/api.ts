// lib/api.ts

import { apiClient } from "@/utils/apiClient";
import { getApiBaseUrl } from "@/lib/api-config";

// Re-export for backward compatibility
export { getApiBaseUrl };

// Helper function for legacy request function
function stripTrailingSlash(u: string) {
  return u.replace(/\/+$/, "");
}

export type BasicJupiterTokensResponse = {
  data: BasicJupiterToken[];
  meta: {
    count: number;
    symbols: string[];
  };
};
export type BasicJupiterToken = {
  symbol: string;
  name: string;
  address: string;
  icon?: string;
  network: string;
  archived: boolean;
  badge?: string;
  decimals: number;
  priceUsd?: number;
};



function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

async function request<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, unknown> }
): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${stripTrailingSlash(base)}${path}${toQuery(init?.query)}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}${text ? ` — ${text}` : ""}`);
  }
  return res.json() as Promise<T>;
}

/* ---------------- Jupiter endpoints ---------------- */
export type JupiterTokensParams = {
  page?: number;
  limit?: number;
};

export type JupiterToken = {
  id: string;
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
  isVerified?: boolean;
  usdPrice?: number;
  address?: string;
  badge?: string;
  network?: string;
  archived?: boolean;
};

export type JupiterTokensResponse = {
  tokens: JupiterToken[];
  total: number;
  page: number;
  limit: number;
};

export function getJupiterTokens(params?: JupiterTokensParams) {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.limit) queryParams.set("limit", String(params.limit));
  const queryString = queryParams.toString();
  const endpoint = `/api/jupiter/tokens${queryString ? `?${queryString}` : ""}`;
  
  return apiClient.request<JupiterTokensResponse>(endpoint, {
    method: "GET",
  });
}

export type JupiterOrderParams = {
  inputMint: string;
  outputMint: string;
  amount: string | number; // atomic units of inputMint
  taker?: string;
  slippageBps?: string | number;
  referralAccount?: string;
  referralFee?: string | number;
};

export function getJupiterOrder(
  params: JupiterOrderParams,
  opts?: { signal?: AbortSignal }
) {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.inputMint) queryParams.set("inputMint", String(params.inputMint));
  if (params.outputMint) queryParams.set("outputMint", String(params.outputMint));
  if (params.amount) queryParams.set("amount", String(params.amount));
  if (params.taker) queryParams.set("taker", String(params.taker));
  if (params.slippageBps) queryParams.set("slippageBps", String(params.slippageBps));
  if (params.referralAccount) queryParams.set("referralAccount", String(params.referralAccount));
  if (params.referralFee) queryParams.set("referralFee", String(params.referralFee));
  const queryString = queryParams.toString();
  const endpoint = `/api/jupiter/order${queryString ? `?${queryString}` : ""}`;
  
  return apiClient.request<any>(endpoint, {
    method: "GET",
    signal: opts?.signal,
  });
}
export type BasicJupiterTokensParams = {
  symbols?: string; // comma-separated symbols, e.g. "SOL,USDT"
};


export function getBasicJupiterTokens(params?: BasicJupiterTokensParams) {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.symbols) queryParams.set("symbols", params.symbols);
  const queryString = queryParams.toString();
  const endpoint = `/api/jupiter/tokens/basic${queryString ? `?${queryString}` : ""}`;
  
  return apiClient.request<BasicJupiterTokensResponse>(endpoint, {
    method: "GET",
  });
}
export type JupiterExecuteBody = {
  signedTransaction: string; // base64
  requestId: string;
};

export function postJupiterExecute(
  body: JupiterExecuteBody,
  opts?: { signal?: AbortSignal }
) {
  return apiClient.request<any>("/api/jupiter/execute", {
    method: "POST",
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
}

export type JupiterTokensSearchParams = {
  q: string;
  page?: number;
  limit?: number;
};

export function getJupiterTokensSearch(params: JupiterTokensSearchParams) {
  // Build query string
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set("q", params.q);
  if (params.page) queryParams.set("page", String(params.page));
  if (params.limit) queryParams.set("limit", String(params.limit));
  const queryString = queryParams.toString();
  const endpoint = `/api/jupiter/tokens/search${queryString ? `?${queryString}` : ""}`;
  
  return apiClient.request<JupiterTokensResponse>(endpoint, {
    method: "GET",
  });
}

/* ---------------- Wallet tracking endpoints ---------------- */
export type WalletConnectionData = {
  walletAddress: string; // Public key as string
  walletProvider: string; // e.g., "Phantom", "Solflare", etc.
  connectedAt: string; // ISO timestamp
  network?: string; // "mainnet-beta", "devnet", etc.
  userAgent?: string; // Browser user agent
  sessionId?: string; // Optional: for tracking sessions
};

export type WalletConnectionResponse = {
  success: boolean;
  message?: string;
  walletId?: string; // Backend-generated ID if needed
};

export function postWalletConnection(data: WalletConnectionData) {
  return request<WalletConnectionResponse>("/api/wallet/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ---------------- Auth endpoints ---------------- */
// Note: For authenticated requests, use apiClient from @/utils/apiClient
// These types are exported for reference

export type AuthRefreshRequest = {
  refreshToken: string;
};

export type AuthRefreshResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
};

export type AuthUserResponse = {
  success: boolean;
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
};

export type AuthLogoutResponse = {
  success: boolean;
  message?: string;
};