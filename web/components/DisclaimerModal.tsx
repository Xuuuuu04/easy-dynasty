'use client';

import { useState, useEffect } from 'react';
import { CloseIcon } from '@/components/Icons';

export default function DisclaimerModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has agreed before
        const hasAgreed = localStorage.getItem('disclaimer_agreed');
        if (!hasAgreed) {
            setIsOpen(true);
        }
    }, []);

    const handleAgree = () => {
        localStorage.setItem('disclaimer_agreed', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#fdfdfc] w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#9a2b2b] text-white px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold tracking-widest font-serif">免责声明</h2>
                    <div className="w-6"></div> {/* Spacer for centering if needed, or just standard layout */}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4 max-h-[60vh] overflow-y-auto text-stone-600 leading-relaxed text-sm md:text-base">
                    <p>
                        欢迎访问<strong>易朝 (EasyDynasty)</strong>。在使用本系统之前，请您仔细阅读以下条款：
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>仅供娱乐</strong>：本系统提供的所有命理、塔罗及运势分析内容仅供娱乐和参考，不具备任何科学依据，不应作为您做出重大决策（如投资、医疗、法律等）的依据。
                        </li>
                        <li>
                            <strong>非专业建议</strong>：AI 生成的解读结果可能存在误差或幻觉，不代表专业人士的意见。
                        </li>
                        <li>
                            <strong>隐私安全</strong>：我们尊重您的隐私，但在使用过程中请勿输入敏感的个人私密信息（如详细住址、身份证号、银行卡号等）。
                        </li>
                        <li>
                            <strong>免责条款</strong>：开发者不对因使用本系统产生的任何直接或间接后果承担法律责任。
                        </li>
                    </ul>
                    <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
                        继续使用即代表您已阅读并同意上述条款。
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-stone-50 p-6 flex justify-center border-t border-stone-200">
                    <button
                        onClick={handleAgree}
                        className="bg-[#9a2b2b] hover:bg-[#8a2525] text-white px-8 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 tracking-wide"
                    >
                        我已知晓并同意
                    </button>
                </div>
            </div>
        </div>
    );
}
