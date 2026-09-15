// components/common/Header.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  _id: string;
  nickname: string;
  email: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 현재 로그인된 유저 정보 확인
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        alert("로그아웃 되었습니다.");
        // 페이지 전체 새로고침으로 로그인 전 상태 반영
        window.location.href = "/";
      }
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
          DevMeet
        </Link>

        {/* 오른쪽 유저/인증 버튼 영역 */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-16 h-8 bg-gray-100 animate-pulse rounded-lg"></div>
          ) : user ? (
            /* 로그인 상태인 경우 */
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">
                <span className="text-blue-600">{user.nickname}</span> 님
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              >
                로그아웃
              </button>
            </div>
          ) : (
            /* 비로그인 상태인 경우 */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}