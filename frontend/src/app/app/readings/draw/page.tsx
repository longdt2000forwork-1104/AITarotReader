"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectDrawReadingToHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/home");
  }, [router]);

  return null;
}
