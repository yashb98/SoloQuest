import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Skip auth in development
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Only protect /api/* routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = process.env.SOLOQUEST_API_TOKEN;
  if (!token) {
    // No token configured = open access (backwards compatible)
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
