// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DevMeet - 개발자 스터디/프로젝트 모집",
  description: "개발자를 위한 스터디 및 모임 모집 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}