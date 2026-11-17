"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useRequireAuth(authPath: "/auth" | "/app/auth" = "/auth") {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") {
      const query = searchParams?.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname || "/";
      router.replace(`${authPath}?next=${encodeURIComponent(nextUrl)}`);
    }
  }, [status, authPath, pathname, searchParams, router]);

  return {
    user,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
