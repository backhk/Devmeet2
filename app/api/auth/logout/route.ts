// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "로그아웃 되었습니다." },
      { status: 200 }
    );

    // 쿠키 삭제 (maxAge: 0 지정)
    response.cookies.set("userId", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("LOGOUT API Error:", error);
    return NextResponse.json(
      { message: "로그아웃 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}