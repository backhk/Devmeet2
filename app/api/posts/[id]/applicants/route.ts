import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { Application } from "@/models/Application";
import { User } from "@/models/User";
import { Notification } from "@/models/Notification";

// 지원자 목록 조회
export async function GET(
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

    await connectToDatabase();
    const post = await Post.findById(postId);

    if (!post || post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "조회 권한이 없습니다." },
        { status: 403 }
      );
    }

    const applications = await Application.find({ post: postId })
      .populate({ path: "applicant", model: User, select: "nickname email" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "지원자 목록 조회 실패", error: String(error) },
      { status: 500 }
    );
  }
}

// 지원 상태 변경 (승인: ACCEPTED / 거절: REJECTED)
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

    const { applicationId, status } = await req.json(); // status: "ACCEPTED" | "REJECTED"

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { message: "올바르지 않은 상태값입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const post = await Post.findById(postId);

    if (!post || post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const app = await Application.findById(applicationId);
    if (!app) {
      return NextResponse.json(
        { message: "지원 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    app.status = status;
    await app.save();

    // 지원자에게 전송할 알림 생성 (Notification 모델이 있을 경우)
    const statusText = status === "ACCEPTED" ? "승인" : "거절";
    try {
      await Notification.create({
        recipient: app.applicant,
        message: `'${post.title}' 모임 지원이 ${statusText}되었습니다.`,
        link: `/posts/${postId}`,
      });
    } catch (err) {
      console.error("알림 생성 실패:", err);
    }

    return NextResponse.json(
      { message: `지원 상태가 ${statusText} 처리되었습니다.`, status: app.status },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "상태 변경 중 오류 발생", error: String(error) },
      { status: 500 }
    );
  }
}