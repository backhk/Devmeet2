"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    // 쿠키 삭제 및 로그아웃 처리
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.refresh();
  };

  return (
    <header className="border-b bg-white px-6 py-4 flex justify-between items-center shadow-sm">
      <Link href="/" className="text-xl font-bold text-blue-600">
        DevMeet
      </Link>
      <nav className="flex gap-4 items-center">
        <Link href="/posts/new" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          모집글 작성
        </Link>
        <Link href="/auth" className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">
          로그인 / 회원가입
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          로그아웃
        </button>
      </nav>
    </header>
  );
}