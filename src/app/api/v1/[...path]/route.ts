import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, API_BASE_URL } from "@/lib/constants";

type Ctx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  const { path } = await ctx.params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${API_BASE_URL}/api/v1/${pathStr}${search}`;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const contentType = req.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const text = await req.text();
    if (text) body = text;
  }

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  }).catch(() => null);

  if (!upstream) {
    return NextResponse.json({ title: "Service unavailable" }, { status: 503 });
  }

  const responseText = await upstream.text();
  const responseContentType =
    upstream.headers.get("Content-Type") ?? "application/json";

  return new NextResponse(responseText || null, {
    status: upstream.status,
    headers: { "Content-Type": responseContentType },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
