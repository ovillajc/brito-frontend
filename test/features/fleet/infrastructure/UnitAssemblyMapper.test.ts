import { describe, expect, it } from 'vitest'
import { UnitAssemblyMapper } from '@/src/features/fleet/infrastructure/mappers/UnitAssemblyMapper'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'

describe('UnitAssemblyMapper', () => {
  it('mapea status y lo persiste en create/update', () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000111',
      name: 'Unidad 01',
      economic_number: 'UN-001',
      description: null,
      employee_id: '00000000-0000-0000-0000-000000000222',
      truck_id: '00000000-0000-0000-0000-000000000333',
      trailer_id: null,
      trailer2_id: null,
      client_id: null,
      company_profile_id: null,
      is_active: true,
      status: 'in_trip',
      created_at: '2026-05-01T00:00:00.000Z',
      updated_at: '2026-05-01T00:00:00.000Z',
    } as const

    const domain = UnitAssemblyMapper.toDomain(row as unknown as Record<string, unknown>)
    expect(domain.status).toBe('in_trip')

    const createPayload = UnitAssemblyMapper.toPersistCreate({ status: 'returning' } as Partial<UnitAssemblyEntity>)
    expect(createPayload.status).toBe('returning')

    const updatePayload = UnitAssemblyMapper.toPersistUpdate({ status: 'at_base' } as Partial<UnitAssemblyEntity>)
    expect(updatePayload.status).toBe('at_base')
  })
})
