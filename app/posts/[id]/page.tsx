"use client";

import { useEffect, useState, use } from "react";
import Header from "@/components/common/Header";

interface PostDetail {
  _id: string;
  title: string;
  content: string;
  capacity: number;
  techStack: string[];
  meetingType: string;
  contactLink?: string;
  status: string;
  author: {
    _id: string;
    nickname: string;
  };
  createdAt: string;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (res.ok) {
          setPost(data.data);
        }
      } catch (err) {
        console.error("게시글 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage("");

    try {
      const res = await fetch(`/api/posts/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "신청에 실패했습니다.");
      }

      setStatusMessage("참여 신청이 완료되었습니다!");
      setMessage("");
    } catch (err: any) {
      setStatusMessage(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20 text-gray-500">게시글을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-blue-600">{post.meetingType}</span>
              <span className="text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <p className="text-sm text-gray-500">작성자: {post.author?.nickname || "익명"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
            <div>
              <span className="text-gray-500">모집 인원: </span>
              <span className="font-medium text-gray-900">{post.capacity}명</span>
            </div>
            <div>
              <span className="text-gray-500">모집 상태: </span>
              <span className="font-medium text-gray-900">
                {post.status === "RECRUITING" ? "모집 중" : "모집 완료"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">사용 기술 스택</h3>
            <div className="flex flex-wrap gap-2">
              {post.techStack?.map((tech, idx) => (
                <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">상세 설명</h3>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed border p-4 rounded-md min-h-[120px]">
              {post.content}
            </p>
          </div>

          {post.contactLink && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">연락처 / 오픈채팅</h3>
              <a
                href={post.contactLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {post.contactLink}
              </a>
            </div>
          )}

          {post.status === "RECRUITING" && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">스터디 / 프로젝트 참여 신청</h3>
              {statusMessage && (
                <div className="p-3 mb-3 text-sm rounded bg-gray-100 text-gray-800">
                  {statusMessage}
                </div>
              )}
              <form onSubmit={handleApply} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="간단한 자기소개 및 신청 사유를 남겨주세요."
                  className="w-full p-3 border rounded-md text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                >
                  참여 신청하기
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}