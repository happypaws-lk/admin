import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const key = path.join("/");

  const storageBaseUrl =
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "http://localhost:9000/happypaws-public";

  const cleanBase = storageBaseUrl.replace(/\/$/, "");
  const targetUrl = `${cleanBase}/${key}`;

  try {
    const upstream = await fetch(targetUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return new NextResponse("File not found", { status: upstream.status });
    }

    const contentType =
      upstream.headers.get("Content-Type") || "application/octet-stream";
    const arrayBuffer = await upstream.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch storage file", { status: 502 });
  }
}
