import React, { memo } from 'react';
import Image from 'next/image';
import { getCardImage } from '@/utils/cardImages';

interface WikiCardProps {
    card: {
        id: number | string;
        name: string;
        englishName: string;
        uprightKeywords: string[];
    };
    onClick: () => void;
}

const WikiCard = memo(function WikiCard({ card, onClick }: WikiCardProps) {
    return (
        <div
            className="group cursor-pointer h-[260px] md:h-[320px] transition-transform hover:-translate-y-2"
            onClick={onClick}
        >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md border border-border bg-card-bg flex flex-col hover:shadow-xl transition-shadow">
                {/* Top Art Area */}
                <div className="flex-1 relative bg-bg-main flex items-center justify-center overflow-hidden">
                    <Image
                        src={getCardImage(card.id)}
                        alt={card.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        quality={85}
                        loading="lazy"
                    />

                    {/* Card Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-card-bg/90 backdrop-blur-sm border-t border-border text-center">
                        <h3 className="text-sm md:text-base font-bold text-text-main mb-0.5">
                            {card.name}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-text-muted uppercase tracking-widest">
                            {card.englishName}
                        </p>
                    </div>
                </div>

                {/* Bottom Keywords Preview */}
                <div className="h-auto p-2 md:p-3 bg-bg-main/50 border-t border-border text-center">
                    <p className="text-[9px] md:text-[10px] text-text-sub line-clamp-2 leading-relaxed">
                        {card.uprightKeywords.slice(0, 3).join(' · ')}
                    </p>
                    <span className="text-[9px] text-accent-main block mt-1.5 md:mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        点击查看解析
                    </span>
                </div>
            </div>
        </div>
    );
});

export default WikiCard;
