import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { RegisterSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, nickname } = result.data;
    await dbConnect();

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickname,
    });

    return NextResponse.json(
      {
        message: "회원가입 성공",
        user: { id: newUser._id, email: newUser.email, nickname: newUser.nickname },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // VS Code 터미널에 상세 에러 출력
    console.error("===== REGISTER ERROR DETAILED LOG =====");
    console.error(error);
    console.error("=======================================");

    return NextResponse.json(
      { message: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}