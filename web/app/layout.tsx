import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { ToastProvider } from "@/components/Toast";
import BackgroundPoetry from "@/components/BackgroundPoetry";

export const metadata: Metadata = {
  title: {
    template: '易朝 | %s',
    default: '易朝 · 东方命理与塔罗启示',
  },
  description: "融合传统八字与西方塔罗的智能命理助手",
  icons: {
    icon: '/favicon.svg?v=2',
    shortcut: '/favicon.svg?v=2',
    apple: '/favicon.svg?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased bg-[#f5f5f0] text-stone-800 selection:bg-[#9a2b2b]/20"
      >
        <ToastProvider>
          <BackgroundPoetry />
          <NavBar />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
