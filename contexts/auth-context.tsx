"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// User profile type from our profiles table
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  professional_background: string | null;
  organization: string | null;
  workplace: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  skills: string[];
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem("auth_token");
        }
      } else {
        setUser(null);
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Login failed");
    }

    // Store token in localStorage
    localStorage.setItem("auth_token", data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default loading state for SSR
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => {
        throw new Error("useAuth must be used within an AuthProvider");
      },
      logout: async () => {
        throw new Error("useAuth must be used within an AuthProvider");
      },
      refreshUser: async () => {
        throw new Error("useAuth must be used within an AuthProvider");
      },
    };
  }
  return context;
}
