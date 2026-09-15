// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/common/Header";
import PostCard from "@/components/posts/PostCard";

interface Post {
  _id: string;
  title: string;
  category: string;
  capacity: number;
  applicantsCount: number;
  author?: { nickname: string };
  createdAt: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchPosts = async () => {
      try {
        const authRes = await fetch("/api/auth/me", { cache: "no-store" });
        const authData = await authRes.json();

        if (authRes.ok && authData.user?._id) {
          setIsLoggedIn(true);
          const postsRes = await fetch("/api/posts", { cache: "no-store" });
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData.posts || []);
          }
        } else {
          setIsLoggedIn(false);
          setPosts([]);
        }
      } catch {
        setIsLoggedIn(false);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <section className="bg-white border-b border-gray-200 py-12 px-4 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
            DevMeet에 오신 것을 환영합니다!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            함께 성장할 개발자 스터디 및 프로젝트 모임을 찾거나 직접 모집해보세요.
          </p>
          <div className="flex justify-center">
            <Link
              href="/posts/new"
              className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 transition-all text-base"
            >
              모집글 작성하기
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">최근 모집 중인 모임</h2>
          {isLoggedIn && (
            <span className="text-sm font-semibold text-gray-500">
              총 {posts.length}개의 모집글
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold">확인 중입니다...</div>
        ) : !isLoggedIn ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-lg font-bold text-gray-700 mb-4">
              로그인이나 회원가입 시 보입니다.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all"
              >
                로그인하기
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-200 transition-all"
              >
                회원가입
              </Link>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-500 font-semibold">
            아직 등록된 모집글이 없습니다. 첫 번째 모집글을 작성해 보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                title={post.title}
                category={post.category}
                capacity={post.capacity}
                applicantsCount={post.applicantsCount || 0}
                authorName={post.author?.nickname || "익명"}
                createdAt={post.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}