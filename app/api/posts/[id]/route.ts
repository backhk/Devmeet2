import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";

// GET /api/posts/:id - 모집글 상세 조회
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const post = await Post.findById(id).populate("author", "nickname email");

    if (!post) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: post }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// PATCH /api/posts/:id - 모집글 수정 및 상태 변경
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    // 작성자 본인 확인 (Authorization)
    if (post.author.toString() !== userId) {
      return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
    }

    const body = await req.json();
    const updatedPost = await Post.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ success: true, data: updatedPost }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

// DELETE /api/posts/:id - 모집글 삭제
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await dbConnect();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "게시글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "삭제 완료되었습니다." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}