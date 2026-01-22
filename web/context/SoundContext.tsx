'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

export type SoundType = 'shuffle' | 'draw' | 'flip' | 'click' | 'hover' | 'reveal' | 'bgm' | 'land';

interface SoundContextType {
    play: (type: SoundType) => void;
    stop: (type: SoundType) => void;
    toggleMute: () => void;
    isMuted: boolean;
    playBGM: () => void;
    stopBGM: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_PATHS: Record<SoundType, string> = {
    shuffle: '/sounds/shuffle.wav',
    draw: '/sounds/draw.wav',
    flip: '/sounds/flip.wav',
    click: '/sounds/click.wav',
    hover: '/sounds/hover.wav',
    reveal: '/sounds/reveal.wav',
    bgm: '/sounds/bgm.ogg',
    land: '/sounds/land.wav',
};

// Default volumes
const VOLUMES: Record<SoundType, number> = {
    shuffle: 0.6,
    draw: 0.4,
    flip: 0.5,
    click: 0.3,
    hover: 0.1,
    reveal: 0.6,
    bgm: 0.15,
    land: 0.4,
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
    const [isMuted, setIsMuted] = useState(false);
    const sounds = useRef<Record<string, Howl | null>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize state from local storage on mount
    useEffect(() => {
        const storedMute = localStorage.getItem('tarot_sound_muted');
        if (storedMute !== null) {
            const muted = storedMute === 'true';
            setIsMuted(muted);
            Howler.mute(muted);
        }
    }, []);

    // Initialize sounds once interaction happens (or lazily)
    // To comply with browser autoplay policies, we should probably instantiate on first user interaction,
    // but Howler handles some of this. We'll instantiate on mount but they won't play until requested.
    useEffect(() => {
        if (typeof window === 'undefined') return;

        (Object.keys(SOUND_PATHS) as SoundType[]).forEach((key) => {
            sounds.current[key] = new Howl({
                src: [SOUND_PATHS[key]],
                volume: VOLUMES[key],
                loop: key === 'bgm',
                preload: true,
                html5: key === 'bgm', // Use HTML5 Audio for long tracks (BGM)
            });
        });
        setIsInitialized(true);

        return () => {
            Howler.unload();
        };
    }, []);

    const toggleMute = useCallback(() => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        Howler.mute(newMuted);
        localStorage.setItem('tarot_sound_muted', String(newMuted));
    }, [isMuted]);

    const play = useCallback((type: SoundType) => {
        if (!sounds.current[type]) return;
        // Don't overlap multiple hover sounds too much
        if (type === 'hover' && sounds.current[type]?.playing()) return;

        // Randomize pitch slightly for repetitive sounds to make it feel organic
        if (['draw', 'flip', 'land', 'shuffle'].includes(type)) {
            const rate = 0.9 + Math.random() * 0.2; // 0.9 - 1.1
            sounds.current[type]?.rate(rate);
        } else {
            sounds.current[type]?.rate(1.0);
        }

        sounds.current[type]?.play();
    }, []);

    const stop = useCallback((type: SoundType) => {
        sounds.current[type]?.stop();
    }, []);

    const playBGM = useCallback(() => {
        const bgm = sounds.current['bgm'];
        if (bgm && !bgm.playing()) {
            bgm.fade(0, VOLUMES['bgm'], 2000); // Fade in
            bgm.play();
        }
    }, []);

    const stopBGM = useCallback(() => {
        const bgm = sounds.current['bgm'];
        if (bgm && bgm.playing()) {
            bgm.fade(VOLUMES['bgm'], 0, 2000);
            setTimeout(() => {
                bgm.stop();
            }, 2000);
        }
    }, []);

    return (
        <SoundContext.Provider value={{ play, stop, toggleMute, isMuted, playBGM, stopBGM }}>
            {children}
        </SoundContext.Provider>
    );
}

export function useSound() {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
