import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Application from "@/models/Application";
import Post from "@/models/Post";
import User from "@/models/User"; // User 모델 등록 필수
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as any;
    const userId = (decoded.id || decoded.userId || decoded._id)?.toString();

    const body = await req.json();
    const postId = body.postId || body.post;

    if (!postId) {
      return NextResponse.json({ message: "게시글 정보(postId)가 유효하지 않습니다." }, { status: 400 });
    }

    await dbConnect();

    // 게시글 작성자 확인
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ message: "존재하지 않는 게시글입니다." }, { status: 404 });
    }

    const authorId = post.author?.toString();

    // 🛑 본인이 쓴 글인지 검증
    if (authorId === userId) {
      return NextResponse.json({ message: "본인이 작성한 모집글에는 신청할 수 없습니다." }, { status: 400 });
    }

    // 이미 신청했는지 확인 (중복 신청 방지)
    const existingApp = await Application.findOne({
      post: postId,
      applicant: userId,
    });

    if (existingApp) {
      return NextResponse.json({ message: "이미 참여 신청한 스터디입니다." }, { status: 400 });
    }

    // 새 신청 생성
    const newApp = await Application.create({
      post: postId,
      applicant: userId,
      status: "pending",
    });

    return NextResponse.json({ message: "스터디 참여 신청이 완료되었습니다.", application: newApp }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/applications ERROR:", error);
    return NextResponse.json({ message: "신청 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId") || searchParams.get("post");

    await dbConnect();

    // 관계 모델 스키마 등록 체크
    if (!User) console.log("User model ready");
    if (!Post) console.log("Post model ready");

    const query = postId ? { post: postId } : {};
    const applications = await Application.find(query)
      .populate("applicant", "nickname email")
      .populate("post", "title")
      .lean();

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("GET /api/applications ERROR:", error);
    return NextResponse.json({ applications: [] }, { status: 500 });
  }
}