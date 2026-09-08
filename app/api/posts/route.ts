import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import { CreatePostSchema } from "@/lib/validation/schemas";

// GET /api/posts - 전체 모집글 목록 조회
export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find()
      .populate("author", "nickname email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// POST /api/posts - 모집글 작성
export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const result = CreatePostSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();
    const newPost = await Post.create({
      ...result.data,
      author: userId, // 서버에서 추출한 userId 저장
    });

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}