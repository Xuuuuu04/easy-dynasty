'use client';

interface LegalAgreementProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LegalAgreement({ isOpen, onClose }: LegalAgreementProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col font-serif">
                <div className="p-6 border-b border-stone-200 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-ink tracking-widest">用户服务协议与隐私政策</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-800">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 text-sm text-stone-600 leading-relaxed space-y-6 custom-scrollbar">
                    <section>
                        <h4 className="font-bold text-stone-800 mb-2">一、 特别提示</h4>
                        <p>欢迎您使用 EasyDynasty（以下简称“本软件”）。在使用本软件之前，请您务必审慎阅读、充分理解本协议各条款内容。如您不同意本协议的任何条款，请您立即停止注册或使用本软件。</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-stone-800 mb-2">二、 免责声明（重要）</h4>
                        <p className="font-bold text-[#9a2b2b]">1. 娱乐性质声明：本软件提供的塔罗牌占卜、八字命理分析等服务仅基于民俗文化与人工智能算法生成，仅供娱乐、心理测试及文化研究参考，不具备任何科学依据。</p>
                        <p>2. 非专业建议：本软件的分析结果不应被视为心理咨询、医疗诊断、法律建议或财务投资建议。用户在做出任何重大人生决策（包括但不限于医疗、法律、投资、婚姻等）时，应咨询相关领域的专业人士。</p>
                        <p>3. 结果导向：本软件不对占卜结果的准确性、可靠性或时效性做任何明示或暗示的保证。用户因信赖本软件结果而产生的任何行为及其后果，由用户自行承担，本软件开发者及运营方不承担任何法律责任。</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-stone-800 mb-2">三、 数据与隐私保护</h4>
                        <p>1. 必要信息收集：为了提供精准的命理分析，我们需要收集您的出生日期、时间、性别及出生地点。这些信息仅用于生成分析报告。</p>
                        <p>2. 数据安全：我们承诺采取行业标准的安全措施保护您的个人信息。除法律法规规定或用户授权外，我们不会向第三方出售或泄露您的个人隐私数据。</p>
                        <p>3. 历史记录：您的占卜历史将保存在本地或加密的服务器数据库中，您有权随时请求删除这些数据。</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-stone-800 mb-2">四、 用户行为规范</h4>
                        <p>用户不得利用本软件制作、复制、发布、传播含有封建迷信（指诱导违法犯罪的迷信活动）、淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的内容。</p>
                    </section>

                    <section>
                        <h4 className="font-bold text-stone-800 mb-2">五、 协议修改</h4>
                        <p>我们保留在必要时修改本协议条款的权利。修改后的协议一旦公布即有效替代原协议。</p>
                    </section>
                </div>

                <div className="p-6 border-t border-stone-200 bg-stone-50 text-right">
                    <button 
                        onClick={onClose}
                        className="bg-[#9a2b2b] text-white px-8 py-2 rounded-sm text-sm font-bold tracking-widest hover:bg-[#852222] transition-colors"
                    >
                        我已阅读并同意
                    </button>
                </div>
            </div>
        </div>
    );
}
