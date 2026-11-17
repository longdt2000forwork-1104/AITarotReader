export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  attachAuthCookies,
  clearAuthCookies,
  forwardAuthenticatedRequest,
  getBackendBaseUrl,
  isHttpsRequest,
  tryRefreshTokens,
} from "@/lib/backendProxy";

const ALLOWED_POST_ACTIONS = new Set([
  "register",
  "login",
  "google",
  "refresh",
  "logout",
  "verify-email",
  "resend-verification",
  "forgot-password",
  "reset-password",
]);

function sanitizeAuthPayload(json: any) {
  if (!json || typeof json !== "object") return json;
  if (json.data && typeof json.data === "object") {
    const { accessToken: _at, refreshToken: _rt, ...safeData } = json.data;
    return {
      ...json,
      data: safeData,
    };
  }
  return json;
}

export async function GET(
  request: Request,
  context: { params: { action: string } }
) {
  const action = context.params.action;
  if (action !== "me") {
    return NextResponse.json({ code: "ERR_NOT_FOUND", message: "Not found" }, { status: 404 });
  }
  return forwardAuthenticatedRequest(request, "/api/v1/auth/me", { method: "GET" });
}

export async function POST(
  request: Request,
  context: { params: { action: string } }
) {
  const action = context.params.action;
  if (!ALLOWED_POST_ACTIONS.has(action)) {
    return NextResponse.json({ code: "ERR_NOT_FOUND", message: "Unsupported auth action" }, { status: 404 });
  }

  const backendUrl = getBackendBaseUrl();
  const secure = isHttpsRequest(request);
  const cookieStore = cookies();
  const userAgent = request.headers.get("user-agent");
  const forwardedFor = request.headers.get("x-forwarded-for");

  const rawBody = await request.text().catch(() => "");
  let bodyObj: Record<string, any> = {};
  if (rawBody) {
    try {
      bodyObj = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ code: "ERR_BAD_REQUEST", message: "Invalid JSON payload" }, { status: 400 });
    }
  }

  if (action === "logout") {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (refreshToken) {
      await fetch(`${backendUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      }).catch(() => null);
    }
    const res = NextResponse.json({ success: true, message: "Logged out", data: null });
    clearAuthCookies(res, secure);
    return res;
  }

  if (action === "refresh") {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value || bodyObj.refreshToken;
    if (!refreshToken) {
      const res = NextResponse.json(
        { success: false, code: "ERR_REFRESH_TOKEN_INVALID", message: "No refresh token" },
        { status: 401 }
      );
      clearAuthCookies(res, secure);
      return res;
    }

    const outcome = await tryRefreshTokens(refreshToken, userAgent);
    if (!outcome.ok || !outcome.accessToken) {
      const res = NextResponse.json(
        { success: false, code: "ERR_REFRESH_TOKEN_INVALID", message: "Refresh failed" },
        { status: 401 }
      );
      clearAuthCookies(res, secure);
      return res;
    }

    const res = NextResponse.json({ success: true, message: "Token refreshed", data: { refreshed: true } });
    attachAuthCookies(res, outcome.accessToken, outcome.refreshToken, secure);
    return res;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (userAgent) headers["User-Agent"] = userAgent;
  if (forwardedFor) headers["X-Forwarded-For"] = forwardedFor;

  let backendRes: Response;
  try {
    backendRes = await fetch(`${backendUrl}/api/v1/auth/${action}`, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyObj),
      cache: "no-store",
    });
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

  const json = await backendRes.json().catch(() => null);
  const sanitized = sanitizeAuthPayload(json);
  const nextRes = NextResponse.json(sanitized ?? { success: backendRes.ok }, {
    status: backendRes.status,
  });

  if (
    backendRes.ok &&
    (action === "login" || action === "google") &&
    json?.data?.accessToken
  ) {
    attachAuthCookies(nextRes, json.data.accessToken, json.data.refreshToken, secure);
  }

  return nextRes;
}
