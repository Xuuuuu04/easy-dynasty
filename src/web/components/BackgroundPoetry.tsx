'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const poetryCollection = [
    '天行健 君子以自强不息',
    '地势坤 君子以厚德载物',
    '如是心 如是见',
    '万物皆有灵',
    '知命而无忧',
    '大道至简',
    '上善若水',
    '观天之道 执天之行',
    '命由我作 福自己求',
    '祸福无门 惟人自召',
    '顺势而为',
    '静水流深',
    '道法自然',
];

export default function BackgroundPoetry() {
    const pathname = usePathname();
    const elements = useMemo<Array<{ text: string; style: React.CSSProperties }>>(() => {
        const seed = (pathname || '/').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const pseudo = (idx: number, salt: number) => {
            const x = Math.sin(seed * (idx + 1) * (salt + 3) * 12.9898) * 43758.5453;
            return x - Math.floor(x);
        };

        return Array.from({ length: 6 }).map((_, i) => {
            const text = poetryCollection[Math.floor(pseudo(i, 1) * poetryCollection.length)];
            const style: React.CSSProperties = {
                position: 'fixed',
                left: `${pseudo(i, 2) * 90}%`,
                top: `${pseudo(i, 3) * 80 + 10}%`,
                writingMode: 'vertical-rl',
                opacity: 0.03 + pseudo(i, 4) * 0.05,
                fontSize: `${Math.floor(pseudo(i, 5) * 40 + 20)}px`,
                fontFamily: '"Noto Serif SC", serif',
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                color: pseudo(i, 6) > 0.7 ? 'var(--accent-main)' : 'var(--text-main)',
                filter: 'blur(0.5px)',
                transform: `rotate(${pseudo(i, 7) * 10 - 5}deg)`,
            };
            return { text, style };
        });
    }, [pathname]);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {elements.map((el, i) => (
                <div key={i} style={el.style} className="animate-fade-in transition-colors duration-500">
                    {el.text}
                </div>
            ))}
            {/* Texture Overlay - Only for light mode */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none dark:hidden"
                style={{
                    backgroundImage: 'url("/rice-paper-2.png")',
                    backgroundBlendMode: 'multiply',
                }}
            ></div>
        </div>
    );
}
