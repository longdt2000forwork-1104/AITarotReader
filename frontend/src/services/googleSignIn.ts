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

export function getGoogleWebClientId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
}

export async function signInWithNativeGoogle(): Promise<string> {
  const webClientId = getGoogleWebClientId();
  if (!webClientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured");
  }

  if (!nativeInitialized) {
    await SocialLogin.initialize({
      google: {
        webClientId,
      },
    });
    nativeInitialized = true;
  }

  const res = await SocialLogin.login({
    provider: "google",
    options: {
      scopes: ["email", "profile"],
    },
  });

  const result: any = res?.result;
  const idToken: string | undefined =
    result?.idToken || result?.authentication?.idToken;

  if (!idToken) {
    throw new Error("Google native sign-in did not return an ID token");
  }
  return idToken;
}
