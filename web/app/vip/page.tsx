'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

interface UserInfo {
  tier: 'free' | 'vip' | 'svip';
  subscription_end?: string;
}

export default function VIPPage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setUser(data))
    .catch(err => console.error(err))
  }, [router])

  const handleSubscribe = async (tier: 'vip' | 'svip') => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/payment/create?tier=${tier}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) throw new Error('创建订单失败')
      
      const data = await res.json()
      if (data.pay_url) {
        window.location.href = data.pay_url
      }
    } catch (err) {
      showToast('发起支付失败，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const tiers = [
    {
      id: 'free',
      name: '普通用户',
      price: '0',
      features: [
        '每天 1 次塔罗分析',
        '每天 5 次八字摆盘',
        '禁止进一步提问',
        '基础功能体验'
      ],
      buttonText: '当前等级',
      highlight: false
    },
    {
      id: 'vip',
      name: '普通 VIP',
      price: '29.9',
      features: [
        '每天 20 次塔罗分析',
        '每天 100 次八字摆盘',
        '开启大运流年流月分析',
        '支持普通 AI 聊天分析'
      ],
      buttonText: '立即订阅',
      highlight: true
    },
    {
      id: 'svip',
      name: '高级 SVIP',
      price: '59.9',
      features: [
        '每天 80 次塔罗分析',
        '每天 300 次八字摆盘',
        '支持塔罗深入沟通',
        'AI + 命理知识库精确解读',
        '全量分析项目展示'
      ],
      buttonText: '立即订阅',
      highlight: true
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5f5f0] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold text-ink mb-4">会员套餐</h1>
          <p className="text-stone-500">升级您的会员等级，获取更深邃的命理洞察</p>
          {user?.subscription_end && (
              <p className="mt-4 text-sm text-[#9a2b2b] font-bold">
                  当前订阅有效期至: {new Date(user.subscription_end).toLocaleDateString()}
              </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((t) => (
            <div 
              key={t.id} 
              className={`ink-card p-8 flex flex-col items-center text-center relative ${
                t.highlight ? 'border-[#9a2b2b] border-2 shadow-lg' : 'border-stone-200'
              }`}
            >
              {t.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#9a2b2b] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  推荐
                </div>
              )}
              <h2 className="text-2xl font-bold text-ink mb-2">{t.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-ink">¥{t.price}</span>
                <span className="text-stone-400 ml-1">/ 月</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {t.features.map((f, i) => (
                  <li key={i} className="text-stone-600 text-sm flex items-center justify-center gap-2">
                    <span className="text-[#9a2b2b]">✦</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => t.id !== 'free' && handleSubscribe(t.id as any)}
                disabled={loading || user?.tier === t.id || (t.id === 'free')}
                className={`w-full py-3 rounded-sm font-bold tracking-widest transition-all ${
                  user?.tier === t.id 
                    ? 'bg-stone-200 text-stone-500 cursor-default'
                    : t.id === 'free'
                    ? 'bg-stone-100 text-stone-400 cursor-default'
                    : 'btn-seal'
                }`}
              >
                {user?.tier === t.id ? '当前等级' : t.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 ink-card p-8 bg-stone-50 border-stone-200">
          <h3 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
            <span className="text-[#9a2b2b]">i</span> 订阅说明
          </h3>
          <ul className="text-stone-500 text-sm space-y-2 list-disc pl-5">
            <li>所有套餐有效期为 31 天，自支付成功之日起计算。</li>
            <li>每日使用次数将在次日凌晨 0:00 自动重置。</li>
            <li>SVIP 用户的 AI 深度解读将启用 RAG 技术，结合《渊海子平》、《滴天髓》等命理经典进行分析。</li>
            <li>支付仅支持微信支付，由 ZPay 提供技术支持。</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
