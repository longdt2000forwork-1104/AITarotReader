export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

export async function GET(request: Request) {
  return forwardAuthenticatedRequest(request, "/api/v1/profile/mystic", {
    method: "GET",
  });
}

export async function PUT(request: Request) {
  const bodyText = await request.text().catch(() => undefined);
  return forwardAuthenticatedRequest(request, "/api/v1/profile/mystic", {
    method: "PUT",
    bodyText,
    contentType: request.headers.get("content-type"),
  });
}
