"use client";

import { useEffect, useState } from "react";
import Header from "@/components/common/Header";
import Link from "next/link";

interface MyPost {
  _id: string;
  title: string;
  category: string;
  status?: "open" | "closed";
  applicantsCount: number;
  capacity: number;
  createdAt: string;
}

interface MyApplication {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message?: string;
  post: {
    _id: string;
    title: string;
    category: string;
    status: string;
    contactLink?: string;
  };
}

interface ApplicantDetail {
  _id: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  applicant: {
    _id: string;
    nickname: string;
    email: string;
  };
}

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ nickname: string; email: string } | null>(null);
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [myApps, setMyApps] = useState<MyApplication[]>([]);

  // 지원자 관리 모달 상태
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [applicantsList, setApplicantsList] = useState<ApplicantDetail[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // 1. 데이터 Fetching (캐시 방지 적용)
  useEffect(() => {
    fetch("/api/users/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setMyPosts(data.myPosts || []);
          setMyApps(data.myApplications || []);
        }
      })
      .catch((err) => console.error("마이페이지 데이터 불러오기 실패:", err))
      .finally(() => setLoading(false));
  }, []);

  // 2. 모집 상태 변경 (모집중 / 마감)
  const handleToggleStatus = async (postId: string, currentStatus?: string) => {
    // status가 없으면 기본값 "open"으로 다룸
    const actualStatus = currentStatus || "open";
    const nextStatus = actualStatus === "open" ? "closed" : "open";

    try {
      const res = await fetch(`/api/posts/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      // 💡 디버깅용 콘솔 로그 추가
      const data = await res.json();
      console.log("STATUS UPDATE RESPONSE:", res.status, data);

      if (res.ok) {
        setMyPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, status: nextStatus } : p))
        );
      } else {
        alert(`상태 변경에 실패했습니다: ${data.message || ""}`);
      }
    } catch (error) {
      console.error("STATUS TOGGLE ERROR:", error);
      alert("오류가 발생했습니다.");
    }
  };

  // 3. 지원자 관리 모달 열기
  const handleOpenApplicantsModal = async (postId: string) => {
    setSelectedPostId(postId);
    setModalLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/applicants`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setApplicantsList(data.applications || []);
      } else {
        alert("지원자 목록을 가져오지 못했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setModalLoading(false);
    }
  };

  // 4. 지원자 승인 / 거절 처리
  const handleUpdateApplicantStatus = async (appId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!selectedPostId) return;

    try {
      const res = await fetch(`/api/posts/${selectedPostId}/applicants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status }),
      });

      if (res.ok) {
        // 지원자 목록 상태 변경
        setApplicantsList((prev) =>
          prev.map((item) => (item._id === appId ? { ...item, status } : item))
        );

        // 승인 시 내 게시글 지원인원(+1) 상태 업데이트
        if (status === "ACCEPTED") {
          setMyPosts((prev) =>
            prev.map((p) =>
              p._id === selectedPostId
                ? { ...p, applicantsCount: (p.applicantsCount || 0) + 1 }
                : p
            )
          );
        }
      } else {
        alert("처리에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-bold">마이페이지 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
        {/* 내 프로필 카드 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {user?.nickname || "사용자"} 님
          </h1>
          <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
        </div>

        {/* 내가 작성한 모집글 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-black text-gray-900 mb-4">내가 작성한 모집글</h2>
          {myPosts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">작성한 모집글이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => {
                const isPostOpen = !post.status || post.status === "open";
                return (
                  <div
                    key={post._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`/posts/${post._id}`}
                        className="font-bold text-gray-900 hover:underline"
                      >
                        {post.title}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        지원인원: {post.applicantsCount || 0} / {post.capacity || 1}명
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApplicantsModal(post._id)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
                      >
                        지원자 관리
                      </button>
                      <button
                        onClick={() => handleToggleStatus(post._id, post.status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          isPostOpen
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                      >
                        {isPostOpen ? "모집중 (마감하기)" : "마감됨 (재개하기)"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 내 지원 현황 섹션 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-black text-gray-900 mb-4">내 지원 현황</h2>
          {myApps.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">지원한 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {myApps.map((app) => (
                <div
                  key={app._id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {app.post?.category || "기타"}
                      </span>
                      <Link
                        href={`/posts/${app.post?._id}`}
                        className="font-bold text-gray-900 hover:underline"
                      >
                        {app.post?.title || "삭제된 게시글"}
                      </Link>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        app.status === "ACCEPTED"
                          ? "bg-blue-100 text-blue-700"
                          : app.status === "REJECTED"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {app.status === "ACCEPTED"
                        ? "승인됨"
                        : app.status === "REJECTED"
                        ? "거절됨"
                        : "대기 중"}
                    </span>
                  </div>

                  {app.message && (
                    <p className="text-xs text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                      내 지원 메시지: {app.message}
                    </p>
                  )}

                  {app.status === "ACCEPTED" && app.post?.contactLink && (
                    <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs font-semibold flex items-center justify-between">
                      <span>💬 모임 참여 링크/연락처:</span>
                      <a
                        href={app.post.contactLink}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-700 font-bold"
                      >
                        {app.post.contactLink}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 지원자 관리 모달 */}
      {selectedPostId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-gray-900">지원자 목록</h3>
              <button
                onClick={() => setSelectedPostId(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                닫기 ✕
              </button>
            </div>

            {modalLoading ? (
              <p className="text-center text-sm py-6 text-gray-500">불러오는 중...</p>
            ) : applicantsList.length === 0 ? (
              <p className="text-center text-sm py-6 text-gray-400">아직 지원자가 없습니다.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {applicantsList.map((app) => (
                  <div
                    key={app._id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-sm text-gray-900">
                          {app.applicant?.nickname || "알 수 없음"}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({app.applicant?.email})
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          app.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-700"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {app.status === "ACCEPTED"
                          ? "승인"
                          : app.status === "REJECTED"
                          ? "거절"
                          : "대기"}
                      </span>
                    </div>

                    {app.message && (
                      <p className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-100">
                        "{app.message}"
                      </p>
                    )}

                    <div className="flex gap-2 pt-1 justify-end">
                      <button
                        onClick={() => handleUpdateApplicantStatus(app._id, "ACCEPTED")}
                        disabled={app.status === "ACCEPTED"}
                        className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleUpdateApplicantStatus(app._id, "REJECTED")}
                        disabled={app.status === "REJECTED"}
                        className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}