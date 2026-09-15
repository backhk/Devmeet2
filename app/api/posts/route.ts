import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다.", posts: [] },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const posts = await Post.find()
      .populate({
        path: "author",
        model: User,
        select: "nickname email",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "게시글 목록 조회 실패", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, content, category, capacity, isSecret, password } = body;

    if (!title || !content || !category || !capacity) {
      return NextResponse.json(
        { message: "필수 입력 항목을 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    if (isSecret && !password) {
      return NextResponse.json(
        { message: "비밀글 등록 시 비밀번호를 입력해야 합니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newPost = await Post.create({
      title,
      content,
      category,
      capacity: Number(capacity),
      author: userId,
      applicantsCount: 0,
      isSecret: Boolean(isSecret),
      password: isSecret ? String(password) : "",
    });

    return NextResponse.json(
      { message: "게시글이 성공적으로 등록되었습니다.", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts Error:", error);
    return NextResponse.json(
      { message: "게시글 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}