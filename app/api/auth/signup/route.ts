// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, nickname, password } = await req.json();

    if (!email || !nickname || !password) {
      return NextResponse.json({ message: " 모든 필드를 입력해주세요." }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }

    const newUser = await User.create({
      email,
      nickname,
      password, // 실무에서는 bcrypt 등을 통한 암호화 권장
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", userId: newUser._id },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "서버 에러가 발생했습니다." }, { status: 500 });
  }
}