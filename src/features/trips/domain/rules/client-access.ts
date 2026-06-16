export const WALMART_CLIENT_KEYWORDS = ['walmart'] as const

export function normalizeClientName(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function isWalmartClientName(clientName: string | null | undefined): boolean {
  const normalized = normalizeClientName(clientName)
  return WALMART_CLIENT_KEYWORDS.some((k) => normalized.includes(k))
}

export function canManageTripsForClient(input: {
  clientName: string | null | undefined
  canManageAll: boolean
  canManageWalmart: boolean
  canManageLogistics: boolean
}): boolean {
  if (input.canManageAll) return true
  if (isWalmartClientName(input.clientName)) return input.canManageWalmart
  if (input.canManageLogistics) return true
  return false
}
