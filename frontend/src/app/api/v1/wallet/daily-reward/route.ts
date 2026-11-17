export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

export async function POST(request: Request) {
  return forwardAuthenticatedRequest(request, "/api/v1/wallet/daily-reward", {
    method: "POST",
    bodyText: await request.text().catch(() => undefined),
    contentType: request.headers.get("content-type"),
  });
}
