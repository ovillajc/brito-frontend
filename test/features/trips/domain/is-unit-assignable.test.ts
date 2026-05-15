import { describe, expect, it } from 'vitest'
import { BLOCKED_UNIT_STATUSES, isUnitAssignableForNewTrip } from '@/src/features/trips/domain/rules/is-unit-assignable'

describe('isUnitAssignableForNewTrip', () => {
  it('permite cuando status es null/undefined/vacío', () => {
    expect(isUnitAssignableForNewTrip(null)).toBe(true)
    expect(isUnitAssignableForNewTrip(undefined)).toBe(true)
    expect(isUnitAssignableForNewTrip('')).toBe(true)
  })

  it('bloquea estados no asignables', () => {
    expect(isUnitAssignableForNewTrip(BLOCKED_UNIT_STATUSES.Assigned)).toBe(false)
    expect(isUnitAssignableForNewTrip(BLOCKED_UNIT_STATUSES.InTrip)).toBe(false)
    expect(isUnitAssignableForNewTrip(BLOCKED_UNIT_STATUSES.InRoute)).toBe(false)
    expect(isUnitAssignableForNewTrip(BLOCKED_UNIT_STATUSES.Returning)).toBe(false)
    expect(isUnitAssignableForNewTrip(BLOCKED_UNIT_STATUSES.AtClient)).toBe(false)
  })

  it('permite estados desconocidos', () => {
    expect(isUnitAssignableForNewTrip('at_base')).toBe(true)
    expect(isUnitAssignableForNewTrip('in_workshop')).toBe(true)
  })
})
