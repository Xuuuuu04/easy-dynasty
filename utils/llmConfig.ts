export interface DefaultLlmConfig {
  available: boolean
  model: string | null
}

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

const isServer = typeof window === 'undefined'

const config: DefaultLlmConfig = {
  available: isServer 
    ? parseBoolean(process.env.DEFAULT_LLM_ENABLED) && 
      !!normalize(process.env.DEFAULT_LLM_BASE_URL) && 
      !!normalize(process.env.DEFAULT_LLM_API_KEY)
    : parseBoolean(process.env.NEXT_PUBLIC_DEFAULT_LLM_AVAILABLE),
  model: isServer 
    ? normalize(process.env.DEFAULT_LLM_MODEL)
    : normalize(process.env.NEXT_PUBLIC_DEFAULT_LLM_MODEL),
}

export const getDefaultLlmConfig = (): DefaultLlmConfig => ({
  ...config,
})

export const isDefaultLlmUsable = (): boolean => config.available

export const getDefaultLlmModel = (): string => config.model ?? 'gpt-4o-mini'
