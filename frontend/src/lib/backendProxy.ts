import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "tarot_at";
export const REFRESH_COOKIE = "tarot_rt";

const ACCESS_MAX_AGE = 60 * 15; // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getBackendBaseUrl(): string {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080";
  return raw.replace(/\/+$/, "");
}

export function isHttpsRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
  }
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
}

export function attachAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string | null | undefined,
  secure: boolean
) {
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  if (refreshToken) {
    response.cookies.set(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export function clearAuthCookies(response: NextResponse, secure: boolean) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE, "", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export interface RefreshOutcome {
  ok: boolean;
  accessToken?: string;
  refreshToken?: string;
}

export async function tryRefreshTokens(
  refreshToken: string,
  userAgent?: string | null
): Promise<RefreshOutcome> {
  const backendUrl = getBackendBaseUrl();
  try {
    const res = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userAgent ? { "User-Agent": userAgent } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false };
    }
    const json = await res.json().catch(() => null);
    const access = json?.data?.accessToken;
    const nextRefresh = json?.data?.refreshToken;
    if (!access) {
      return { ok: false };
    }
    return { ok: true, accessToken: access, refreshToken: nextRefresh };
  } catch {
    return { ok: false };
  }
}

export interface ForwardOptions {
  method?: string;
  bodyText?: string;
  contentType?: string | null;
}

export async function forwardAuthenticatedRequest(
  request: Request,
  backendPathWithQuery: string,
  options: ForwardOptions = {}
): Promise<NextResponse> {
  const backendUrl = getBackendBaseUrl();
  const targetUrl = `${backendUrl}${backendPathWithQuery.startsWith("/") ? "" : "/"}${backendPathWithQuery}`;
  const secure = isHttpsRequest(request);
  const cookieStore = cookies();

  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value || "";
  let refreshToken = cookieStore.get(REFRESH_COOKIE)?.value || "";
  const explicitAuth = request.headers.get("authorization");
  const userAgent = request.headers.get("user-agent");

  let refreshedTokens: RefreshOutcome | null = null;
  let shouldClearCookies = false;

  if (!accessToken && !explicitAuth && refreshToken) {
    const outcome = await tryRefreshTokens(refreshToken, userAgent);
    if (outcome.ok && outcome.accessToken) {
      accessToken = outcome.accessToken;
      refreshToken = outcome.refreshToken || refreshToken;
      refreshedTokens = outcome;
    } else {
      shouldClearCookies = true;
    }
  }

  const doFetch = async (bearerToken: string | null) => {
    const headers = new Headers();
    if (options.contentType) {
      headers.set("Content-Type", options.contentType);
    } else if (options.bodyText) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");
    if (userAgent) {
      headers.set("User-Agent", userAgent);
    }
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
      headers.set("X-Forwarded-For", forwardedFor);
    }
    if (bearerToken) {
      headers.set("Authorization", bearerToken.startsWith("Bearer ") ? bearerToken : `Bearer ${bearerToken}`);
    }

    return fetch(targetUrl, {
      method: options.method || request.method,
      headers,
      body: options.bodyText,
      cache: "no-store",
    });
  };

  let res: Response;
  try {
    res = await doFetch(explicitAuth || accessToken || null);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        code: "ERR_BACKEND_UNREACHABLE",
        message: err?.message || "Backend service is unavailable",
      },
      { status: 502 }
    );
  }

  if (res.status === 401 && !explicitAuth && refreshToken && !refreshedTokens) {
    const outcome = await tryRefreshTokens(refreshToken, userAgent);
    if (outcome.ok && outcome.accessToken) {
      refreshedTokens = outcome;
      res = await doFetch(outcome.accessToken);
    } else {
      shouldClearCookies = true;
    }
  }

  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  const nextRes = parsed !== null
    ? NextResponse.json(parsed, { status: res.status })
    : new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": res.headers.get("content-type") || "text/plain; charset=utf-8",
        },
      });

  if (refreshedTokens?.ok && refreshedTokens.accessToken) {
    attachAuthCookies(nextRes, refreshedTokens.accessToken, refreshedTokens.refreshToken, secure);
  } else if (shouldClearCookies) {
    clearAuthCookies(nextRes, secure);
  }

  return nextRes;
}
