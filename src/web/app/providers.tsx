'use client';

import { ThemeProvider } from 'next-themes';
import { ToastProvider } from '@/components/Toast';
import { DeckProvider } from '@/context/DeckContext';
import { SoundProvider } from '@/context/SoundContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ToastProvider>
                <DeckProvider>
                    <SoundProvider>
                        {children}
                    </SoundProvider>
                </DeckProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
