export const dynamic = "force-dynamic"; // 라우트 캐싱을 방지하고 항상 최신 DB 데이터를 조회합니다.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { Application } from "@/models/Application";
import { User } from "@/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. 사용자 기본 정보 조회
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return NextResponse.json(
        { message: "유저 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 내가 작성한 게시글 목록
    const myPosts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. 내가 지원한 신청 내역 (게시글 정보 연동)
    const myApplications = await Application.find({ applicant: userId })
      .populate({
        path: "post",
        model: Post,
        select: "title category status contactLink capacity applicantsCount",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        user,
        myPosts,
        myApplications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("USERS/ME API Error:", error);
    return NextResponse.json(
      { message: "내 정보 조회 실패", error: String(error) },
      { status: 500 }
    );
  }
}