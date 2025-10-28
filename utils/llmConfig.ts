export interface DefaultLlmConfig {
  baseUrl: string | null
  apiKey: string | null
  model: string | null
  enabled: boolean
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

const config: DefaultLlmConfig = {
  baseUrl: normalize(process.env.NEXT_PUBLIC_DEFAULT_LLM_BASE_URL),
  apiKey: normalize(process.env.NEXT_PUBLIC_DEFAULT_LLM_API_KEY),
  model: normalize(process.env.NEXT_PUBLIC_DEFAULT_LLM_MODEL),
  enabled: parseBoolean(process.env.NEXT_PUBLIC_DEFAULT_LLM_ENABLED),
}

export const getDefaultLlmConfig = (): DefaultLlmConfig => ({
  ...config,
})

export const isDefaultLlmUsable = (): boolean =>
  config.enabled && !!config.baseUrl && !!config.apiKey

export const getDefaultLlmModel = (): string => config.model ?? 'gpt-4o-mini'
