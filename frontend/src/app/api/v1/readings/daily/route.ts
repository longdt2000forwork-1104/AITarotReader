export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

export async function GET(request: Request) {
  const { search } = new URL(request.url);
  return forwardAuthenticatedRequest(request, `/api/v1/readings/daily${search}`, {
    method: "GET",
  });
}

export async function POST(request: Request) {
  const { search } = new URL(request.url);
  return forwardAuthenticatedRequest(request, `/api/v1/readings/daily${search}`, {
    method: "POST",
    bodyText: await request.text().catch(() => undefined),
    contentType: request.headers.get("content-type"),
  });
}
