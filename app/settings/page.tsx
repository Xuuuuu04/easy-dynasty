'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDefaultLlmConfig, getDefaultLlmModel, isDefaultLlmUsable } from '@/utils/llmConfig'

export default function SettingsPage() {
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(() => getDefaultLlmModel())
  const [isLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const defaultConfig = getDefaultLlmConfig()
  const defaultLlmUsable = isDefaultLlmUsable()
  const trimmedBaseUrl = baseUrl.trim()
  const trimmedApiKey = apiKey.trim()
  const hasCustomConfig = Boolean(trimmedBaseUrl && trimmedApiKey)
  const defaultConfigured = Boolean(defaultConfig.baseUrl && defaultConfig.apiKey)
  const showDefaultActiveNotice = defaultLlmUsable && !hasCustomConfig
  const showDefaultDisabledNotice = defaultConfigured && !defaultConfig.enabled && !hasCustomConfig

  useEffect(() => {
    // 从 localStorage 加载现有设置
    const savedBaseUrl = localStorage.getItem('tarot_api_base_url')
    const savedApiKey = localStorage.getItem('tarot_api_key')
    const savedModel = localStorage.getItem('tarot_api_model')
    
    if (savedBaseUrl) setBaseUrl(savedBaseUrl)
    if (savedApiKey) setApiKey(savedApiKey)
    if (savedModel) setModel(savedModel)
  }, [])

  const handleSave = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) {
      setMessage('请填写完整的 API 配置信息')
      return
    }

    setSaveLoading(true)
    setMessage('')

    try {
      // 保存到 localStorage
      localStorage.setItem('tarot_api_base_url', baseUrl.trim())
      localStorage.setItem('tarot_api_key', apiKey.trim())
      localStorage.setItem('tarot_api_model', model.trim())
      
      setMessage('设置已保存成功！')
      
      // 2秒后跳转到主页
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch {
      setMessage('保存设置时出现错误，请重试')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!baseUrl.trim() || !apiKey.trim()) {
      setMessage('请先填写完整的 API 配置信息')
      return
    }

    setSaveLoading(true)
    setMessage('正在测试连接...')

    try {
      const response = await fetch(`${baseUrl.trim()}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage('✅ API 连接测试成功！')
      } else {
        setMessage('❌ API 连接测试失败，请检查配置')
      }
    } catch {
      setMessage('❌ 连接测试失败，请检查网络和配置')
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050311] text-slate-100">
      <div className="stars-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.28),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),transparent_60%)]" />
      <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-purple-500/25 blur-[140px] animate-mystical-gradient" />
      <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[180px] animate-mystical-gradient" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 text-center space-y-4">
              <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.38em] text-purple-200/80 backdrop-blur">
                Settings
              </span>
              <h1 className="text-3xl md:text-4xl font-semibold font-[var(--font-display)] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-violet-200 to-pink-200 drop-shadow-[0_10px_40px_rgba(124,58,237,0.45)]">
                API 设置
              </h1>
              <p className="mx-auto max-w-2xl text-sm text-slate-200/80 md:text-base">
                配置您的 OpenAI 兼容 API，让塔罗与星辰的智慧顺畅抵达。
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-[0_35px_120px_rgba(76,29,149,0.45)] backdrop-blur-xl">
              <div className="space-y-8">
                {showDefaultDisabledNotice && (
                  <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 shadow-[0_18px_45px_rgba(245,158,11,0.28)]">
                    <div className="mb-1 text-sm font-semibold text-amber-200">
                      ⚠️ 默认 LLM 已禁用
                    </div>
                    <p className="text-xs leading-relaxed text-amber-100/80">
                      管理员暂时禁用了默认的 LLM 配置，请在下方填写您自己的端点信息才能继续使用占卜功能。
                    </p>
                  </div>
                )}

                {showDefaultActiveNotice && (
                  <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 shadow-[0_18px_45px_rgba(16,185,129,0.25)]">
                    <div className="mb-1 text-sm font-semibold text-emerald-200">
                      🌟 默认 LLM 已启用
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-100/80">
                      当前环境提供了预设的 LLM 配置，您可以直接开始占卜，或在下方填写信息以覆盖默认设置。
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="baseUrl" className="mb-3 block text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">
                    API Base URL
                  </label>
                  <input
                    type="url"
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-slate-100 shadow-[0_15px_45px_rgba(24,24,45,0.35)] backdrop-blur focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/60 placeholder:text-slate-400"
                  />
                  <p className="mt-2 text-xs text-slate-300/70">
                    例如：https://api.openai.com/v1 或其他兼容端点
                  </p>
                </div>

                <div>
                  <label htmlFor="apiKey" className="mb-3 block text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-slate-100 shadow-[0_15px_45px_rgba(24,24,45,0.35)] backdrop-blur focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/60 placeholder:text-slate-400"
                  />
                  <p className="mt-2 text-xs text-slate-300/70">
                    您的 API 密钥，以 sk- 开头
                  </p>
                </div>

                <div>
                  <label htmlFor="model" className="mb-3 block text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">
                    模型名称
                  </label>
                  <input
                    type="text"
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-3 text-sm text-slate-100 shadow-[0_15px_45px_rgba(24,24,45,0.35)] backdrop-blur focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/60 placeholder:text-slate-400"
                  />
                  <p className="mt-2 text-xs text-slate-300/70">
                    要使用的模型名称，如 gpt-4o-mini, gpt-4, claude-3-sonnet 等
                  </p>
                </div>

                {message && (
                  <div
                    className={`rounded-2xl border p-4 text-sm shadow-[0_18px_45px_rgba(79,70,229,0.25)] ${
                      message.includes('成功') || message.includes('✅')
                        ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                        : message.includes('❌') || message.includes('错误') || message.includes('失败')
                        ? 'border-red-400/40 bg-red-500/10 text-red-200'
                        : 'border-sky-400/40 bg-sky-500/10 text-sky-200'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <div className="flex flex-col gap-4 md:flex-row">
                  <button
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(56,189,248,0.35)] transition-all hover:scale-[1.03] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? '测试中...' : '测试连接'}
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_55px_rgba(232,121,249,0.35)] transition-all hover:scale-[1.03] disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? '保存中...' : '保存设置'}
                  </button>
                </div>

                <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 shadow-[0_18px_45px_rgba(245,158,11,0.28)]">
                  <h3 className="mb-2 text-sm font-semibold text-amber-200">
                    🔒 安全提示
                  </h3>
                  <p className="text-xs leading-relaxed text-amber-100/80">
                    您的 API 密钥仅保存在本地浏览器中，不会上传到任何服务器。请勿在公共电脑上使用，并定期更换您的 API 密钥以确保安全。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
