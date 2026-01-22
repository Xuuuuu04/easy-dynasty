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
  manifest: '/site.webmanifest',
  themeColor: '#9a2b2b',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    title: '易朝',
    statusBarStyle: 'default',
    capable: true,
  },
  openGraph: {
    title: '易朝 · EasyDynasty',
    description: '融合传统八字与西方塔罗的智能命理助手',
    type: 'website',
    locale: 'zh_CN',
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
