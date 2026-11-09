"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectFromManualPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app/readings/new");
  }, [router]);

  return null;
}
