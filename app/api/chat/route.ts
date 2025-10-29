import { NextRequest } from 'next/server'

const normalize = (value: string | undefined | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const parseBoolean = (value: string | undefined | null): boolean => {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on'
}

export async function POST(request: NextRequest) {
  try {
    const baseUrl = normalize(process.env.DEFAULT_LLM_BASE_URL)
    const apiKey = normalize(process.env.DEFAULT_LLM_API_KEY)
    const enabled = parseBoolean(process.env.DEFAULT_LLM_ENABLED)

    if (!enabled || !baseUrl || !apiKey) {
      return new Response(
        JSON.stringify({ error: '默认 LLM 配置未启用或配置不完整' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const body = await request.json()

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ 
          error: `LLM API 请求失败: ${response.status} ${response.statusText}`,
          details: errorText 
        }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    if (body.stream) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('API 路由错误:', error)
    return new Response(
      JSON.stringify({ 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
