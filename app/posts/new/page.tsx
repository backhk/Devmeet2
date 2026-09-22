"use client";

import { useState } from "react";
import Header from "@/components/common/Header";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("스터디");
  const [capacity, setCapacity] = useState(4);
  const [content, setContent] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSecret && !password) {
      alert("비밀글 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          capacity,
          content,
          isSecret,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("모집글이 성공적으로 작성되었습니다!");
        window.location.href = "/";
      } else {
        alert(data.message || "작성에 실패했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
          <h1 className="text-2xl font-black mb-6 text-gray-900">새 모집글 작성</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-medium bg-white"
                >
                  <option value="스터디">스터디</option>
                  <option value="프로젝트">프로젝트</option>
                  <option value="모각코">따로따로</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">모집 인원</label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSecret}
                  onChange={(e) => setIsSecret(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-gray-900">🔒 비밀글로 설정하기</span>
              </label>

              {isSecret && (
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={isSecret}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                    placeholder="비밀번호 4자리 이상 입력"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">상세 내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 text-sm font-medium"
                placeholder="모임에 대한 자세한 내용을 적어주세요."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md disabled:bg-gray-400"
            >
              {submitting ? "등록 중..." : "등록하기"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}