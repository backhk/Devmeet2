import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { status } = await req.json(); // "open" 또는 "closed"

    if (!["open", "closed"].includes(status)) {
      return NextResponse.json(
        { message: "유효하지 않은 모집 상태 값입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다." },
        { status: 403 }
      );
    }

    post.status = status;
    await post.save();

    return NextResponse.json(
      { message: "모집 상태가 변경되었습니다.", status: post.status },
      { status: 200 }
    );
  } catch (error) {
    console.error("STATUS API Error:", error);
    return NextResponse.json(
      { message: "상태 변경 실패", error: String(error) },
      { status: 500 }
    );
  }
}