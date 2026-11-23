"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { UserDto } from "@/types/api";
import { authApi, AuthApiResult, RegisterPayload } from "@/services/authApi";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: UserDto | null;
  status: AuthStatus;
  refreshUser: () => Promise<UserDto | null>;
  login: (email: string, password: string) => Promise<AuthApiResult<any>>;
  register: (payload: RegisterPayload) => Promise<AuthApiResult<any>>;
  loginWithGoogle: (
    idToken: string,
    platform: "web" | "app",
    locale: "vi" | "en"
  ) => Promise<AuthApiResult<any>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearLocalDailyCaches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("ai_tarot_daily_draw");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("ai_tarot_daily_draw_") ||
          key.startsWith("ai_tarot_daily_reward_claimed_"))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refreshUser = useCallback(async (): Promise<UserDto | null> => {
    const res = await authApi.me();
    if (res.ok && res.data) {
      setUser(res.data);
      setStatus("authenticated");
      return res.data;
    }
    setUser(null);
    setStatus("unauthenticated");
    return null;
  }, []);

  useEffect(() => {
    refreshUser();

    const handleUnauthorized = () => {
      setUser(null);
      setStatus("unauthenticated");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:unauthorized", handleUnauthorized);
      return () => {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      };
    }
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      setStatus("authenticated");
    }
    return res;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    return authApi.register(payload);
  }, []);

  const loginWithGoogle = useCallback(
    async (idToken: string, platform: "web" | "app", locale: "vi" | "en") => {
      const res = await authApi.loginWithGoogle(idToken, platform, locale);
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        setStatus("authenticated");
      }
      return res;
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    clearLocalDailyCaches();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        refreshUser,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
