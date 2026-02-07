'use client';

export default function AtmosphereBackground() {
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
                {[...Array(100)].map((_, i) => {
                    const size = Math.random() < 0.1 ? 'w-0.5 h-0.5' : 'w-[1px] h-[1px]';
                    const opacity = Math.random() * 0.7 + 0.3;
                    return (
                        <div
                            key={`star-${i}`}
                            className={`absolute ${size} bg-white rounded-full animate-twinkle`}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: opacity,
                                animationDuration: `${Math.random() * 3 + 2}s`,
                                animationDelay: `${Math.random() * 5}s`,
                                boxShadow: Math.random() < 0.2 ? '0 0 2px rgba(255, 255, 255, 0.8)' : 'none',
                            }}
                        ></div>
                    );
                })}

                {/* Shooting Stars */}
                {[...Array(3)].map((_, i) => (
                    <div
                        key={`shooting-star-${i}`}
                        className="absolute w-[100px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent animate-shooting-star opacity-0"
                        style={{
                            top: `${Math.random() * 50}%`,
                            left: `${Math.random() * 50}%`,
                            animationDelay: `${Math.random() * 15 + 5}s`,
                            animationDuration: '4s',
                            transform: 'rotate(-45deg)',
                        }}
                    ></div>
                ))}
            </div>

            {/* Floating Particles - Universal */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-accent-main/20 dark:bg-white/10 rounded-full animate-particle-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${10 + Math.random() * 10}s`,
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
