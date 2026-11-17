export const dynamic = "force-dynamic";

import { forwardAuthenticatedRequest } from "@/lib/backendProxy";

async function handleProxy(
  request: Request,
  context: { params: { path: string[] } }
) {
  const segments = context.params.path || [];
  const joined = segments.join("/");
  const backendPath = joined.startsWith("api/v1/")
    ? `/${joined}`
    : `/api/v1/${joined}`;

  const url = new URL(request.url);
  const fullPath = `${backendPath}${url.search}`;

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD" && method !== "DELETE";
  const bodyText = hasBody ? await request.text().catch(() => undefined) : undefined;

  return forwardAuthenticatedRequest(request, fullPath, {
    method,
    bodyText,
    contentType: request.headers.get("content-type"),
  });
}

export async function GET(request: Request, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function POST(request: Request, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function PUT(request: Request, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function PATCH(request: Request, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function DELETE(request: Request, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}
