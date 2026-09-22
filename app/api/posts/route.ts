import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { User } from "@/models/User";

// 1. 게시글 목록 조회 및 검색 (GET)
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다.", posts: [] },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || ""; // 검색어 (제목 또는 내용)
    const category = searchParams.get("category") || ""; // 카테고리 필터

    await connectToDatabase();

    // 동적 검색 조건 생성
    const filter: any = {};

    // 카테고리 필터링 (전체가 아닐 경우)
    if (category && category !== "전체") {
      filter.category = category;
    }

    // 검색어 필터링 (제목 또는 내용 대상 - 대소문자 무시)
    if (query.trim() !== "") {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }

    const posts = await Post.find(filter)
      .populate({
        path: "author",
        model: User,
        select: "nickname email",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "게시글 목록 조회 실패", error: String(error) },
      { status: 500 }
    );
  }
}

// 2. 게시글 등록 (POST)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, content, category, capacity, isSecret, password } = body;

    if (!title || !content || !category || !capacity) {
      return NextResponse.json(
        { message: "필수 입력 항목을 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    if (isSecret && !password) {
      return NextResponse.json(
        { message: "비밀글 등록 시 비밀번호를 입력해야 합니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newPost = await Post.create({
      title,
      content,
      category,
      capacity: Number(capacity),
      author: userId,
      applicantsCount: 0,
      status: "open",
      isSecret: Boolean(isSecret),
      password: isSecret ? String(password) : "",
    });

    return NextResponse.json(
      { message: "게시글이 성공적으로 등록되었습니다.", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts Error:", error);
    return NextResponse.json(
      { message: "게시글 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}