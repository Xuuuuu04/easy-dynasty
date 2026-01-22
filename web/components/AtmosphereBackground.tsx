'use client';

export default function AtmosphereBackground() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Vignette Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/10"></div>

            {/* Mist Layers */}
            <div className="absolute inset-0">
                {/* Layer 1 - Slow moving */}
                <div className="absolute inset-0 opacity-30 animate-mist-flow-1">
                    <div className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-[#9a2b2b]/10 to-transparent blur-3xl"></div>
                </div>

                {/* Layer 2 - Medium speed */}
                <div className="absolute inset-0 opacity-20 animate-mist-flow-2">
                    <div className="absolute top-1/4 right-0 w-[120%] h-3/4 bg-gradient-to-l from-transparent via-stone-400/20 to-transparent blur-3xl"></div>
                </div>

                {/* Layer 3 - Fast subtle */}
                <div className="absolute inset-0 opacity-15 animate-mist-flow-3">
                    <div className="absolute bottom-0 left-1/4 w-full h-1/2 bg-gradient-to-t from-transparent via-[#b4a078]/15 to-transparent blur-2xl"></div>
                </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-[#9a2b2b]/20 rounded-full animate-particle-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${8 + Math.random() * 4}s`,
                        }}
                    ></div>
                ))}
            </div>

            {/* Subtle Paper Texture Overlay */}
            <div
                className="absolute inset-0 opacity-5 mix-blend-multiply"
                style={{ backgroundImage: 'url("/rice-paper-2.png")' }}
            ></div>
        </div>
    );
}
