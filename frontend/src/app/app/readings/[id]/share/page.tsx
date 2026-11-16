"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function RemovedMobileShareStudioPage() {
  const params = useParams();
  const router = useRouter();
  const readingId = (params?.id as string) || "";

  useEffect(() => {
    if (readingId && readingId !== "demo-session") {
      router.replace(`/app/readings/${readingId}`);
    } else {
      router.replace("/app/home");
    }
  }, [router, readingId]);

  return null;
}
