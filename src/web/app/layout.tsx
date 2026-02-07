import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import BackgroundPoetry from '@/components/BackgroundPoetry';
import DisclaimerModal from '@/components/DisclaimerModal';
import { Providers } from './providers';

export const viewport: Viewport = {
    themeColor: '#9a2b2b',
};

export const metadata: Metadata = {
    title: {
        template: '易朝 | %s',
        default: '易朝 · 东方命理与塔罗启示',
    },
    description: '融合传统八字与西方塔罗的智能命理助手',
    manifest: '/site.webmanifest',
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
        <html lang="zh-CN" suppressHydrationWarning>
            <body className="antialiased bg-bg-main text-text-main selection:bg-accent-main/20 transition-colors duration-500">
                <Providers>
                    <DisclaimerModal />
                    <BackgroundPoetry />
                    <NavBar />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
