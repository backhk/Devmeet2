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

    const post = await Post.findById(application.post);
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

    const prevStatus = application.status;
    const applicantIdStr = application.applicant.toString();

    // 동일한 상태로 재요청할 경우 기존 상태 유지
    if (prevStatus === status) {
      return NextResponse.json({
        message: "이미 변경된 상태입니다.",
        status: application.status,
        applicantsCount: post.applicantsCount || 0,
      });
    }

    // 1. 승인(ACCEPTED)으로 변경하는 경우
    if (status === "ACCEPTED") {
      // 정원 초과 여부 검증 (기존 승인자가 아니었던 경우에만)
      if (
        prevStatus !== "ACCEPTED" &&
        (post.applicantsCount || 0) >= (post.capacity || 1)
      ) {
        return NextResponse.json(
          { message: "모집 정원이 이미 가득 찼습니다." },
          { status: 400 }
        );
      }

      // applicants 배열에 추가 (중복 방지)
      const exists = (post.applicants || []).some(
        (id: any) => id.toString() === applicantIdStr
      );
      if (!exists) {
        post.applicants.push(application.applicant);
      }
    }

    // 2. 거절(REJECTED)로 변경하는 경우 (이전에 ACCEPTED였다면 목록 및 인원에서 차감)
    if (status === "REJECTED") {
      post.applicants = (post.applicants || []).filter(
        (id: any) => id.toString() !== applicantIdStr
      );
    }

    // 인원수 재계산 후 저장
    post.applicantsCount = post.applicants.length;
    await post.save();

    application.status = status;
    await application.save();

    return NextResponse.json(
      {
        message:
          status === "ACCEPTED"
            ? "지원을 승인하였습니다."
            : "지원을 거절하였습니다.",
        status: application.status,
        applicantsCount: post.applicantsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "지원 상태 변경 실패" },
      { status: 500 }
    );
  }
}