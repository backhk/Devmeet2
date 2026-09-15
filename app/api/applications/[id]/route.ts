// app/api/applications/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Application } from "@/models/Application";

// 특정 지원 신청 정보 조회
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const application = await Application.findById(params.id)
      .populate("post", "title")
      .populate("applicant", "nickname email");

    if (!application) {
      return NextResponse.json({ message: "신청 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json({ message: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }
}

// 지원 신청 수락/거절 상태 변경 (PENDING / ACCEPTED / REJECTED)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    await connectToDatabase();

    const application = await Application.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    return NextResponse.json({ message: "상태가 변경되었습니다.", application });
  } catch (error) {
    return NextResponse.json({ message: "상태 변경 실패" }, { status: 500 });
  }
}