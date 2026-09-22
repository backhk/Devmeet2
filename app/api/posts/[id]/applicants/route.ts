import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Application } from "@/models/Application";
import { Post } from "@/models/Post";

// 1. 지원자 목록 조회 (GET)
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
    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 작성자 본인인지 확인
    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 해당 게시글에 들어온 지원 목록 + 지원자 정보(nickname, email) Populate
    const applications = await Application.find({ post: postId })
      .populate("applicant", "nickname email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("GET APPLICANTS ERROR:", error);
    return NextResponse.json(
      { message: "지원자 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 2. 지원 승인 / 거절 처리 (PATCH)
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
        { message: "올바르지 않은 상태 값입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json(
        { message: "지원 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const post = await Post.findById(application.post || postId);
    if (!post) {
      return NextResponse.json(
        { message: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (post.author.toString() !== userId) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 승인/거절이 이미 완료된 경우 재변경 차단
    if (application.status !== "PENDING") {
      return NextResponse.json(
        { message: "이미 처리된 지원건은 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    // 승인(ACCEPTED) 시 인원수 체크 및 applicants 목록 추가
    if (status === "ACCEPTED") {
      const currentCount = post.applicantsCount || 0;
      const capacity = post.capacity || 1;

      if (currentCount >= capacity) {
        return NextResponse.json(
          { message: "모집 정원이 이미 가득 찼습니다." },
          { status: 400 }
        );
      }

      if (!post.applicants) {
        post.applicants = [];
      }

      const applicantIdStr = application.applicant.toString();
      const isAlreadyAdded = post.applicants.some(
        (id: any) => id.toString() === applicantIdStr
      );

      if (!isAlreadyAdded) {
        post.applicants.push(application.applicant);
      }

      post.applicantsCount = post.applicants.length;
      await post.save();
    }

    application.status = status;
    await application.save();

    return NextResponse.json(
      {
        message:
          status === "ACCEPTED"
            ? "지원을 승인하였습니다."
            : "지원을 거절하였습니다.",
        status: application.status,
        applicantsCount: post.applicantsCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH STATUS ERROR:", error);
    return NextResponse.json(
      { message: "지원 상태 변경 실패" },
      { status: 500 }
    );
  }
}