import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "珍稀孵蛋规划台｜洛克王国：世界",
  description: "离线登记异色、炫彩与异色炫彩精灵，自动生成高效的孵蛋摆窝方案。",
  icons: {
    icon: [{ url: "/favicon-egg.png", type: "image/png", sizes: "64x64" }],
    shortcut: "/favicon-egg.png",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "珍稀孵蛋规划台",
    description: "为异色与炫彩，规划下一窝。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
