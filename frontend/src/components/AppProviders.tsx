"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { getGoogleWebClientId } from "@/services/googleSignIn";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const clientId = getGoogleWebClientId();

  const inner = (
    <LanguageProvider>
      <AuthProvider>{children}</AuthProvider>
    </LanguageProvider>
  );

  if (!clientId) {
    return inner;
  }

  return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
}
