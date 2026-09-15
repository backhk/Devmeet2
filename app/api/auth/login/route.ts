// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "이메일과 비밀번호를 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email, password });
    if (!user) {
      return NextResponse.json(
        { message: "이메일 또는 비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    const userIdStr = user._id.toString();

    // 응답 객체 생성 및 쿠키 설정
    const response = NextResponse.json(
      {
        message: "로그인 성공",
        user: { id: userIdStr, email: user.email, nickname: user.nickname },
      },
      { status: 200 }
    );

    // 쿠키 설정
    response.cookies.set("userId", userIdStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일 유지
    });

    return response;
  } catch (error) {
    console.error("로그인 API 에러:", error);
    return NextResponse.json(
      { message: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}