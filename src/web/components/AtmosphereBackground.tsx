'use client';

import { useMemo } from 'react';

export default function AtmosphereBackground() {
    const rand = (i: number, salt: number) => {
        const x = Math.sin((i + 1) * (salt + 1) * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    };

    const stars = useMemo(
        () =>
            Array.from({ length: 100 }).map((_, i) => ({
                key: `star-${i}`,
                sizeClass: rand(i, 11) < 0.1 ? 'w-0.5 h-0.5' : 'w-[1px] h-[1px]',
                left: `${rand(i, 12) * 100}%`,
                top: `${rand(i, 13) * 100}%`,
                opacity: rand(i, 14) * 0.7 + 0.3,
                duration: `${rand(i, 15) * 3 + 2}s`,
                delay: `${rand(i, 16) * 5}s`,
                boxShadow: rand(i, 17) < 0.2 ? '0 0 2px rgba(255, 255, 255, 0.8)' : 'none',
            })),
        []
    );
    const shootingStars = useMemo(
        () =>
            Array.from({ length: 3 }).map((_, i) => ({
                key: `shooting-star-${i}`,
                top: `${rand(i, 18) * 50}%`,
                left: `${rand(i, 19) * 50}%`,
                delay: `${rand(i, 20) * 15 + 5}s`,
            })),
        []
    );
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }).map((_, i) => ({
                key: `particle-${i}`,
                left: `${rand(i, 21) * 100}%`,
                top: `${rand(i, 22) * 100}%`,
                delay: `${rand(i, 23) * 8}s`,
                duration: `${10 + rand(i, 24) * 10}s`,
            })),
        []
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Vignette Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10 dark:to-black/80"></div>

            {/* Mist Layers - Shared by both modes but styled differently */}
            <div className="absolute inset-0">
                {/* Layer 1 - Slow moving */}
                <div className="absolute inset-0 opacity-30 animate-mist-flow-1">
                    <div className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-accent-main/10 dark:via-purple-900/10 to-transparent blur-3xl"></div>
                </div>

                {/* Layer 2 - Medium speed */}
                <div className="absolute inset-0 opacity-20 animate-mist-flow-2">
                    <div className="absolute top-1/4 right-0 w-[120%] h-3/4 bg-gradient-to-l from-transparent via-text-muted/20 dark:via-blue-900/10 to-transparent blur-3xl"></div>
                </div>

                {/* Layer 3 - Fast subtle */}
                <div className="absolute inset-0 opacity-15 animate-mist-flow-3">
                    <div className="absolute bottom-0 left-1/4 w-full h-1/2 bg-gradient-to-t from-transparent via-accent-light/15 dark:via-indigo-900/10 to-transparent blur-2xl"></div>
                </div>
            </div>

            {/* Dark Mode Exclusive: Cosmic Elements */}
            <div className="hidden dark:block absolute inset-0">
                {/* Deep Space Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-black/40 mix-blend-overlay"></div>

                {/* Nebula Clouds */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

                {/* Stars - Increased count and variety */}
                {stars.map((star) => (
                    <div
                        key={star.key}
                        className={`absolute ${star.sizeClass} bg-white rounded-full animate-twinkle`}
                        style={{
                            left: star.left,
                            top: star.top,
                            opacity: star.opacity,
                            animationDuration: star.duration,
                            animationDelay: star.delay,
                            boxShadow: star.boxShadow,
                        }}
                    ></div>
                ))}

                {/* Shooting Stars */}
                {shootingStars.map((item) => (
                    <div
                        key={item.key}
                        className="absolute w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent animate-shooting-star opacity-0"
                        style={{
                            top: item.top,
                            left: item.left,
                            animationDelay: item.delay,
                            animationDuration: '4s',
                            transform: 'rotate(-45deg)',
                        }}
                    ></div>
                ))}
            </div>

            {/* Floating Particles - Universal */}
            <div className="absolute inset-0">
                {particles.map((item) => (
                    <div
                        key={item.key}
                        className="absolute w-1 h-1 bg-accent-main/20 dark:bg-white/10 rounded-full animate-particle-float"
                        style={{
                            left: item.left,
                            top: item.top,
                            animationDelay: item.delay,
                            animationDuration: item.duration,
                        }}
                    ></div>
                ))}
            </div>

            {/* Subtle Paper Texture Overlay - Only for light mode */}
            <div
                className="absolute inset-0 opacity-5 mix-blend-multiply dark:hidden"
                style={{ backgroundImage: 'url("/rice-paper-2.png")' }}
            ></div>
        </div>
    );
}
