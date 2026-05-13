import { describe, expect, it } from 'vitest'
import { TripsMapper } from '@/src/features/trips/infrastructure/mappers/TripsMapper'

describe('TripsMapper', () => {
  it('incluye trip_number_client, observations y client_specific_data en payload', () => {
    const payload = TripsMapper.toUpsertPayload(
      {
        clientId: '00000000-0000-0000-0000-000000000111',
        origin: 'Origen',
        destination: 'Destino',
        departureDate: new Date('2026-05-09T10:00:00.000Z'),
        unitAssemblyId: '00000000-0000-0000-0000-000000000222',
        status: 'scheduled',
        tripNumberClient: 123,
        observations: 'Obs',
        clientSpecificData: { holcim: { remision: 'R1' } },
      },
      null
    )

    expect(payload.trip_number_client).toBe(123)
    expect(payload.observations).toBe('Obs')
    expect(payload.client_specific_data).toEqual({ holcim: { remision: 'R1' } })
  })
})

