// lib/api.ts

export type Env = "development" | "staging" | "production";

function getRuntimeEnv(): Env {
  const explicit = (process.env.NEXT_PUBLIC_ENV || "").toLowerCase();
  if (explicit.startsWith("prod")) return "production";
  if (explicit.startsWith("stag")) return "staging";

  // Fallbacks based on common Next/Vercel envs
  const ve = (process.env.VERCEL_ENV || "").toLowerCase(); // "production" | "preview" | "development"
  if (ve === "production") return "production";
  if (ve === "preview") return "staging";

  return "development";
}

function stripTrailingSlash(u: string) {
  return u.replace(/\/+$/, "");
}

/**
 * Resolve the API base URL depending on env.
 * Priority:
 *  1) NEXT_PUBLIC_API_BASE_URL (always wins if set)
 *  2) Staging/Prod specific vars
 *  3) Dev default: http://localhost:8000
 */
export function getApiBaseUrl() {
  const forced = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (forced) return stripTrailingSlash(forced);

  const env = getRuntimeEnv();
  if (env === "staging" && process.env.NEXT_PUBLIC_STAGING_API_BASE_URL) {
    return stripTrailingSlash(process.env.NEXT_PUBLIC_STAGING_API_BASE_URL);
  }
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
