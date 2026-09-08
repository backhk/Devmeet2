import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import Application from "@/models/Application";
import { CreateApplicationSchema } from "@/lib/validation/schemas";

// POST /api/posts/:id/apply - 참여 신청 (중복 신청 방지)
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "인증이 필요합니다." }, { status: 401 });
    }

    const body = await req.json();
    const result = CreateApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    await dbConnect();

    // 1. 게시글 존재 여부 및 모집 상태 확인
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ message: "존재하지 않는 모집글입니다." }, { status: 404 });
    }

    if (post.status === "COMPLETED") {
      return NextResponse.json({ message: "이미 모집이 완료된 글입니다." }, { status: 400 });
    }

    // 2. 작성자 본인의 셀프 신청 차단
    if (post.author.toString() === userId) {
      return NextResponse.json({ message: "본인이 작성한 글에는 신청할 수 없습니다." }, { status: 400 });
    }

    // 3. 중복 신청 검증
    const existingApplication = await Application.findOne({
      postId: params.id,
      applicant: userId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: "이미 참여 신청한 모집글입니다." },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. 신청 저장
    const newApplication = await Application.create({
      postId: params.id,
      applicant: userId,
      message: result.data.message,
    });

    return NextResponse.json(
      { success: true, message: "참여 신청이 완료되었습니다.", data: newApplication },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}