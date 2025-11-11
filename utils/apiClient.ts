"use client";

import { authService } from "@/services/authService";
import { getApiBaseUrl } from "@/lib/api-config";

const API_URL = getApiBaseUrl();

class ApiClient {
  /**
   * Get headers with authentication token
   * Automatically refreshes token if expired
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    let token = authService.getAccessToken();

    // Check if token is expired or about to expire
    if (!token || authService.isTokenExpired()) {
      const newTokens = await authService.refreshToken();
      token = newTokens?.accessToken || null;
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Make authenticated API request
   * Automatically handles token refresh on 401 errors
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle 401 - try refresh once
    if (response.status === 401 && authService.getAccessToken()) {
      const newTokens = await authService.refreshToken();

      if (newTokens) {
        // Retry original request with new token
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newTokens.accessToken}`,
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        return retryResponse.json();
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make unauthenticated API request (for public endpoints)
   */
  async requestPublic<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

