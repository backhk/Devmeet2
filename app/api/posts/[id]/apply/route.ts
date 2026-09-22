import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { Application } from "@/models/Application";

export async function POST(
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

    // 클라이언트에서 전달받은 message (없으면 빈 문자열)
    const { message } = await req.json().catch(() => ({ message: "" }));

    await connectToDatabase();
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 1. 작성자 본인 지원 불가
    if (post.author && post.author.toString() === userId) {
      return NextResponse.json(
        { message: "본인이 작성한 모임에는 지원할 수 없습니다." },
        { status: 400 }
      );
    }

    // 2. 이미 지원했는지 검증 (중복 지원 방지)
    const applicants = post.applicants || [];
    const isAlreadyApplied = applicants.some(
      (id: any) => id.toString() === userId
    );

    if (isAlreadyApplied) {
      return NextResponse.json(
        { message: "이미 지원한 게시글입니다." },
        { status: 400 }
      );
    }

    // 💡 3. 모집 마감 상태 검증 (추가된 부분)
    if (post.status === "closed") {
      return NextResponse.json(
        { message: "이미 마감된 모집글에는 지원할 수 없습니다." },
        { status: 400 }
      );
    }

    // 4. 정원 초과 검증
    if ((post.applicantsCount || 0) >= (post.capacity || 1)) {
      return NextResponse.json(
        { message: "모집 인원이 이미 완료되었습니다." },
        { status: 400 }
      );
    }

    // 5. Application 문서 생성 (지원서 DB 저장)
    await Application.create({
      post: postId,
      applicant: userId,
      message: message || "",
      status: "PENDING",
    });

    // 6. Post 모델 지원자 배열 추가 및 카운트 증가
    post.applicants.push(userId);
    post.applicantsCount = post.applicants.length;
    await post.save();

    return NextResponse.json(
      {
        message: "지원 신청이 완료되었습니다.",
        applicantsCount: post.applicantsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("APPLY API Error:", error);
    return NextResponse.json({ message: "지원 처리 실패" }, { status: 500 });
  }
}