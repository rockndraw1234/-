import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "유머 글쓰기 훈련",
  description: "과장법과 은유법으로 유머러스한 문장을 쓰고 AI 피드백을 받아보세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
