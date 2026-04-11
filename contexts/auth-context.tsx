"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Extended profile type from our profiles table
interface UserProfile {
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
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    interests?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    try {
      console.log("[v0] Fetching profile for user:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[v0] Error fetching profile:", error.message, error.details, error.hint);
        return null;
      }
      console.log("[v0] Profile fetched successfully:", data?.email);
      return data as UserProfile;
    } catch (err) {
      console.error("[v0] Exception fetching profile:", err);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      console.log("[v0] Refreshing user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("[v0] Auth error:", authError.message);
      }
      
      setUser(user);
      console.log("[v0] User state:", user ? user.email : "no user");

      if (user) {
        const profileData = await fetchProfile(user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("[v0] Failed to refresh user:", error);
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    interests?: string[];
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        data: {
          name: data.name,
          interests: data.interests || [],
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    // Refresh profile after update
    const updatedProfile = await fetchProfile(user.id);
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default loading state for SSR or when outside provider
    return {
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      login: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      register: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      logout: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      refreshUser: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
      updateProfile: async () => { throw new Error("useAuth must be used within an AuthProvider"); },
    };
  }
  return context;
}
