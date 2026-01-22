'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    const [elements, setElements] = useState<Array<{ text: string; style: React.CSSProperties }>>(
        []
    );

    useEffect(() => {
        // Generate deterministic decorative elements based on pathname to avoid hydration mismatch
        // but for client-side visual flair, random is okay if we suppress hydration warning or render only on client
        // Let's render consistent set per page load

        const count = 6; // Number of decorative elements
        const newElements = [];

        for (let i = 0; i < count; i++) {
            const text = poetryCollection[Math.floor(Math.random() * poetryCollection.length)];
            const style: React.CSSProperties = {
                position: 'fixed',
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 80 + 10}%`,
                writingMode: 'vertical-rl',
                opacity: 0.03 + Math.random() * 0.05, // Very subtle opacity
                fontSize: `${Math.floor(Math.random() * 40 + 20)}px`,
                fontFamily: '"Noto Serif SC", serif',
                pointerEvents: 'none',
                zIndex: 0,
                userSelect: 'none',
                whiteSpace: 'nowrap',
                color: Math.random() > 0.7 ? '#9a2b2b' : '#1c1917', // Occasional red ink
                filter: 'blur(0.5px)',
                transform: `rotate(${Math.random() * 10 - 5}deg)`,
            };
            newElements.push({ text, style });
        }
        setElements(newElements);
    }, [pathname]); // Refresh when page changes

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {elements.map((el, i) => (
                <div key={i} style={el.style} className="animate-fade-in">
                    {el.text}
                </div>
            ))}
            {/* Texture Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'url("/rice-paper-2.png")',
                    backgroundBlendMode: 'multiply',
                }}
            ></div>
        </div>
    );
}
