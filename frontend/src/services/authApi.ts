import { AuthResponse, UserDto } from "@/types/api";

export interface AuthApiResult<T = unknown> {
  ok: boolean;
  status: number;
  code?: string;
  message: string;
  data: T | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  birthDate?: string;
  focusAreas?: string[];
  allowAiContext?: boolean;
  locale: "vi" | "en";
  platform: "web" | "app";
}

async function callAuthEndpoint<T>(
  path: string,
  options: RequestInit = {}
): Promise<AuthApiResult<T>> {
  try {
    const res = await fetch(`/api/auth/${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    });

    const json = await res.json().catch(() => null);
    return {
      ok: res.ok && (json?.success !== false),
      status: res.status,
      code: json?.errorCode || json?.code,
      message: json?.message || (res.ok ? "OK" : res.statusText || "Request failed"),
      data: (json?.data ?? null) as T | null,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      code: "ERR_NETWORK",
      message: err?.message || "Network error",
      data: null,
    };
  }
}

export const authApi = {
  me(): Promise<AuthApiResult<UserDto>> {
    return callAuthEndpoint<UserDto>("me", { method: "GET" });
  },

  register(payload: RegisterPayload): Promise<AuthApiResult<AuthResponse>> {
    return callAuthEndpoint<AuthResponse>("register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login(email: string, password: string): Promise<AuthApiResult<AuthResponse>> {
    return callAuthEndpoint<AuthResponse>("login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  loginWithGoogle(
    idToken: string,
    platform: "web" | "app",
    locale: "vi" | "en"
  ): Promise<AuthApiResult<AuthResponse>> {
    return callAuthEndpoint<AuthResponse>("google", {
      method: "POST",
      body: JSON.stringify({ idToken, platform, locale }),
    });
  },

  refresh(): Promise<AuthApiResult<{ refreshed: boolean }>> {
    return callAuthEndpoint<{ refreshed: boolean }>("refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  logout(): Promise<AuthApiResult<null>> {
    return callAuthEndpoint<null>("logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  verifyEmail(token: string): Promise<AuthApiResult<null>> {
    return callAuthEndpoint<null>("verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  resendVerification(
    email: string,
    platform: "web" | "app",
    locale: "vi" | "en"
  ): Promise<AuthApiResult<null>> {
    return callAuthEndpoint<null>("resend-verification", {
      method: "POST",
      body: JSON.stringify({ email, platform, locale }),
    });
  },

  forgotPassword(
    email: string,
    platform: "web" | "app",
    locale: "vi" | "en"
  ): Promise<AuthApiResult<null>> {
    return callAuthEndpoint<null>("forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, platform, locale }),
    });
  },

  resetPassword(token: string, newPassword: string): Promise<AuthApiResult<null>> {
    return callAuthEndpoint<null>("reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
};
