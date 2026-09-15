"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/common/Header";

interface PostDetail {
  _id: string;
  title: string;
  content: string;
  category: string;
  capacity: number;
  applicantsCount: number;
  applicants?: string[];
  author?: { _id?: string; nickname: string; email: string };
  createdAt: string;
  isSecret?: boolean;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const postId = resolvedParams?.id;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  useEffect(() => {
    if (!postId) return;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?._id) setCurrentUserId(data.user._id.toString());
      })
      .catch(() => setCurrentUserId(null));

    fetch(`/api/posts/${postId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setPost(data.post);
          if (!data.post.isSecret) setUnlocked(true);
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const authorId = post?.author?._id?.toString();
  const isAuthor = currentUserId && authorId && currentUserId === authorId;
  const isApplied =
    currentUserId &&
    post?.applicants?.some((id) => id.toString() === currentUserId);

  useEffect(() => {
    if (isAuthor) setUnlocked(true);
  }, [isAuthor]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/posts/${postId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: inputPassword }),
      });

      if (res.ok) {
        setUnlocked(true);
      } else {
        alert("비밀번호가 일치하지 않습니다.");
      }
    } catch {
      alert("검증 중 오류가 발생했습니다.");
    }
  };

  const handleApply = async () => {
    if (isAuthor) return alert("자신의 글에는 지원할 수 없습니다.");
    if (isApplied) return alert("이미 지원한 게시글입니다.");
    if (!currentUserId) return alert("로그인이 필요합니다.");

    setApplying(true);
    try {
      const res = await fetch(`/api/posts/${postId}/apply`, { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        alert("지원 신청이 완료되었습니다!");
        setPost((prev) =>
          prev
            ? {
                ...prev,
                applicantsCount: data.applicantsCount,
                applicants: [...(prev.applicants || []), currentUserId],
              }
            : null
        );
      } else {
        alert(data.message || "지원 실패");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setApplying(false);
    }
  };

  if (loading || !post) return <div className="p-10 text-center font-bold">불러오는 중...</div>;

  if (post.isSecret && !unlocked) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header />
        <main className="max-w-md mx-auto py-16 px-4">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">비밀글입니다.</h2>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              내용을 확인하고 지원하려면 작성 시 설정한 비밀번호를 입력해 주세요.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-center font-bold text-sm"
                placeholder="비밀번호 입력"
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md"
              >
                확인
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
              {post.category || "기타"}
            </span>
            {post.isSecret && (
              <span className="inline-block bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs">
                🔒 비밀글
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            작성자: {post.author?.nickname || "익명"}
          </p>

          <div className="border-t border-b border-gray-100 py-6 my-6 whitespace-pre-line min-h-[150px] font-medium text-gray-800">
            {post.content}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">
              모집 인원: {post.applicantsCount || 0} / {post.capacity || 0}명
            </span>

            <button
              disabled={Boolean(isAuthor || isApplied || applying)}
              onClick={handleApply}
              className={`px-6 py-3 font-bold rounded-xl transition-all shadow-sm ${
                isAuthor || isApplied
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isAuthor
                ? "본인 게시글입니다"
                : isApplied
                ? "이미 지원함"
                : applying
                ? "신청 중..."
                : "지원하기"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}