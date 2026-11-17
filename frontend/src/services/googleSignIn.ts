import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";

let nativeInitialized = false;

export function isNativeCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function isNativeSocialLoginAvailable(): boolean {
  if (!isNativeCapacitor()) return false;
  try {
    return Capacitor.isPluginAvailable("SocialLogin");
  } catch {
    return false;
  }
}

export function getGoogleWebClientId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
}

export async function signInWithNativeGoogle(locale: "vi" | "en" = "vi"): Promise<string> {
  const isVi = locale === "vi";
  if (!isNativeSocialLoginAvailable()) {
    throw new Error(
      isVi
        ? "Bản APK Android hiện tại chưa tích hợp plugin đăng nhập Google native. Vui lòng build/cài bản APK mới nhất hoặc đăng nhập bằng Email/Mật khẩu."
        : "This Android APK build does not include the native Google Sign-In plugin yet. Please install the latest APK build or sign in with Email/Password."
    );
  }

  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
  }

  if (!nativeInitialized) {
    await SocialLogin.initialize({
      google: {
        webClientId,
        skipAuthOnlyAuthorizationAfterSignIn: true,
      },
    });
    nativeInitialized = true;
  }

  const res = await SocialLogin.login({
    provider: "google",
    options: {},
  });

  const result: any = res?.result;
  const idToken: string | undefined =
    result?.idToken || result?.authentication?.idToken;

  if (!idToken) {
    throw new Error("Google native sign-in did not return an ID token");
  }
  return idToken;
}
