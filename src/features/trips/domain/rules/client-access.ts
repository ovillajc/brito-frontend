export const WALMART_CLIENT_KEYWORDS = ['walmart'] as const

export const LOGISTICS_CLIENT_KEYWORDS = ['holcim', 'solinmar', 'altopetrum'] as const

export function normalizeClientName(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function isWalmartClientName(clientName: string | null | undefined): boolean {
  const normalized = normalizeClientName(clientName)
  return WALMART_CLIENT_KEYWORDS.some((k) => normalized.includes(k))
}

export function isLogisticsAllowedClientName(clientName: string | null | undefined): boolean {
  const normalized = normalizeClientName(clientName)
  return LOGISTICS_CLIENT_KEYWORDS.some((k) => normalized.includes(k))
}
