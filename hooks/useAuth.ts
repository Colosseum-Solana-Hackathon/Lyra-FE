"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refresh: checkAuth,
  };
}

