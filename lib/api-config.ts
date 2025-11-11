// lib/api-config.ts
// Shared API configuration utilities to avoid circular dependencies

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

