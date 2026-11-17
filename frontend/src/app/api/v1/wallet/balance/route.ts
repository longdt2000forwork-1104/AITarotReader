export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

export async function GET(request: Request) {
  return forwardAuthenticatedRequest(request, "/api/v1/wallet/balance", {
    method: "GET",
  });
}
