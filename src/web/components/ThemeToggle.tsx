'use client';

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@/components/Icons';
import { useIsClient } from '@/hooks/useIsClient';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const mounted = useIsClient();

    if (!mounted) {
        return (
            <div className="w-7 h-7 p-1.5" /> // Placeholder to prevent layout shift
        );
    }

    const isLight = theme === 'light';

    return (
        <button
            onClick={() => setTheme(isLight ? 'dark' : 'light')}
            className="p-1.5 rounded-sm text-stone-600 dark:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 hover:text-[var(--accent-main)] transition-all"
            title={isLight ? "切换至神秘模式" : "切换至浅色模式"}
            aria-label="Toggle Theme"
        >
            {isLight ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
        </button>
    );
}
