import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Application } from "@/models/Application";
import { Post } from "@/models/Post";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { status } = await req.json(); // "ACCEPTED" 또는 "REJECTED"

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "유효하지 않은 상태 값입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const application = await Application.findById(applicationId).populate("post");
    if (!application) {
      return NextResponse.json(
        { message: "지원 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 해당 게시글 작성자 본인만 승인/거절 처리 가능
    const post = application.post as any;
    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    application.status = status;
    await application.save();

    return NextResponse.json(
      { message: `지원 상태가 ${status === "ACCEPTED" ? "승인" : "거절"} 처리되었습니다.`, application },
      { status: 200 }
    );
  } catch (error) {
    console.error("APPLICATION STATUS API Error:", error);
    return NextResponse.json(
      { message: "상태 변경 실패", error: String(error) },
      { status: 500 }
    );
  }
}