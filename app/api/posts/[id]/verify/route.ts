import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const { password } = await req.json();

    await connectToDatabase();
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (post.password !== password) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}