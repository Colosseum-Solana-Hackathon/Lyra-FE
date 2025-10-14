// lib/api.ts

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


export type Env = "development" | "production";

function getRuntimeEnv(): Env {
  const explicit = (process.env.NEXT_PUBLIC_ENV || "").toLowerCase();
  if (explicit.startsWith("prod")) return "production";

  // Fallbacks based on common Next/Vercel envs
  const ve = (process.env.VERCEL_ENV || "").toLowerCase();
  if (ve === "production") return "production";

  return "development";
}

function stripTrailingSlash(u: string) {
  return u.replace(/\/+$/, "");
}

/**
 * Resolve the API base URL depending on env.
 * Priority:
 *  1) NEXT_PUBLIC_API_BASE_URL (always wins if set)
 *  2) Production API URL (if production env)
 *  3) Dev default: http://localhost:8000
 */
export function getApiBaseUrl() {
  const forced = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (forced) return stripTrailingSlash(forced);

  const env = getRuntimeEnv();
  if (env === "production" && process.env.NEXT_PUBLIC_PROD_API_BASE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_PROD_API_BASE_URL);
  }
  return "http://localhost:8000"; // dev default
}

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
  return request<JupiterTokensResponse>("/api/jupiter/tokens", {
    method: "GET",
    query: params,
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
  return request<any>("/api/jupiter/order", { query: params, signal: opts?.signal });
}
export type BasicJupiterTokensParams = {
  symbols?: string; // comma-separated symbols, e.g. "SOL,USDT"
};


export function getBasicJupiterTokens(params?: BasicJupiterTokensParams) {
  return request<BasicJupiterTokensResponse>("/api/jupiter/tokens/basic", {
    method: "GET",
    query: params,
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
  return request<any>("/api/jupiter/execute", {
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
  return request<JupiterTokensResponse>("/api/jupiter/tokens/search", {
    method: "GET",
    query: params,
  });
}
