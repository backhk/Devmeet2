// app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js 15+ 대응: params가 Promise일 경우 await 처리
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { message: "유효하지 않은 게시글 ID입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const post = await Post.findById(id).populate("author", "nickname email");

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("API GET /api/posts/[id] Error:", error);
    return NextResponse.json(
      { message: "게시글 조회 실패" },
      { status: 500 }
    );
  }
}