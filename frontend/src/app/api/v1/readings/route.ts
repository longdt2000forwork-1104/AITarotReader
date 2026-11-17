export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return forwardAuthenticatedRequest(request, `/api/v1/readings/sessions${search}`, {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const bodyText = await request.text().catch(() => undefined);
  return forwardAuthenticatedRequest(request, "/api/v1/readings/sessions", {
    method: "POST",
    bodyText,
    contentType: request.headers.get("content-type"),
  });
}
