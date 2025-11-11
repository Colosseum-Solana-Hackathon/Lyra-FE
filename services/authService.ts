"use client";

import { apiClient } from "@/utils/apiClient";
import { getApiBaseUrl } from "@/lib/api-config";

const API_URL = getApiBaseUrl();

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

class AuthService {
  // Get stored tokens from localStorage
  private getStoredTokens(): { accessToken: string; refreshToken: string } | null {
    if (typeof window === "undefined") return null;
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  }

  // Store tokens in localStorage
  private setTokens(tokens: AuthTokens): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
  }

  // Clear tokens from localStorage
  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  /**
   * Refresh the access token using refresh token
   * Call this when access token expires (typically after 1 hour)
   */
  async refreshToken(): Promise<AuthTokens | null> {
    const tokens = this.getStoredTokens();
    if (!tokens?.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      if (data.success) {
        this.setTokens(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Get current authenticated user
   * Automatically handles token refresh if token is expired
   * Uses apiClient which handles authentication and token refresh automatically
   */
  async getCurrentUser(): Promise<User | null> {
    const tokens = this.getStoredTokens();
    if (!tokens?.accessToken) {
      return null;
    }

    try {
      // apiClient automatically handles token refresh on 401 errors
      const data = await apiClient.request<{ success: boolean; user: User }>("/api/auth/me", {
        method: "GET",
      });

      return data.success ? data.user : null;
    } catch (error) {
      console.error("Get user error:", error);
      return null;
    }
  }

  /**
   * Logout user - invalidates refresh token
   * Uses apiClient which handles authentication automatically
   */
  async logout(): Promise<boolean> {
    const tokens = this.getStoredTokens();
    this.clearTokens();

    if (tokens?.accessToken) {
      try {
        // Use apiClient to ensure token is included and refreshed if needed
        await apiClient.request<{ success: boolean; message?: string }>("/api/auth/logout", {
          method: "POST",
        });

        return true;
      } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, we've cleared local tokens
        return true;
      }
    }

    return true;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.getStoredTokens()?.accessToken || null;
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT payload (simple check)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      // Consider expired if less than 5 minutes remaining
      return exp - now < 5 * 60 * 1000;
    } catch {
      return true;
    }
  }

  /**
   * Set tokens (useful when authenticating via Supabase or other providers)
   */
  setTokensFromAuth(tokens: AuthTokens): void {
    this.setTokens(tokens);
  }
}

export const authService = new AuthService();

