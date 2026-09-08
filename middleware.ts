import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.split(" ")[1];

  // 보호된 API 경로 목록 검증
  const { pathname } = req.nextUrl;
  
  if (
    pathname.startsWith("/api/posts") &&
    (req.method === "POST" || req.method === "PATCH" || req.method === "DELETE")
  ) {
    if (!token) {
      return NextResponse.json({ message: "인증 토큰이 누락되었습니다." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "유효하지 않거나 만료된 토큰입니다." }, { status: 401 });
    }

    // 인증 성공 시 사용자 정보를 헤더에 담아서 다음 라우터로 전달
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-email", payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/posts/:path*"],
};