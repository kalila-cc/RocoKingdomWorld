import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost"),
  title: "珍稀孵蛋规划台｜洛克王国：世界",
  description: "离线登记异色、炫彩与异色炫彩精灵，自动生成高效率孵蛋摆窝方案。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "珍稀孵蛋规划台",
    description: "让异色与炫彩，在下一窝共存。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
