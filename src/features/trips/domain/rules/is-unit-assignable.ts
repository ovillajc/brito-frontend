export const BLOCKED_UNIT_STATUSES = {
  Assigned: 'assigned',
  InTrip: 'in_trip',
  InRoute: 'in_route',
  Returning: 'returning',
  AtClient: 'at_client',
} as const

type BlockedUnitStatus = typeof BLOCKED_UNIT_STATUSES[keyof typeof BLOCKED_UNIT_STATUSES]

const BLOCKED_SET: ReadonlySet<BlockedUnitStatus> = new Set(Object.values(BLOCKED_UNIT_STATUSES))

export function isUnitAssignableForNewTrip(status: string | null | undefined): boolean {
  if (!status) return true
  return !BLOCKED_SET.has(status as BlockedUnitStatus)
}
