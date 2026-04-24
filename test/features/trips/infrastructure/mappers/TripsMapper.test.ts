import { describe, it, expect } from 'vitest'
import { TripsMapper, type TripListRow } from '@/src/features/trips/infrastructure/mappers/TripsMapper'

describe('TripsMapper', () => {
  it('mapea TripListRow a TripWithRelations', () => {
    const row: TripListRow = {
      id: 'trip-1',
      folio: 'VJE-0001',
      trip_number: 42,
      client_id: 'client-1',
      company_profile_id: null,
      unit_assembly_id: 'unit-1',
      departure_date: '2026-04-23T10:00:00.000Z',
      arrival_date_actual: null,
      status: 'in_progress',
      origin: 'Monterrey',
      destination: 'Apodaca',
      monitored_by: 'profile-1',
      fuel_load_date: null,
      trip_number_client: 3,
      last_scan: null,
      observations: null,
      client_specific_data: null,
      created_at: '2026-04-23T09:00:00.000Z',
      updated_at: '2026-04-23T09:00:00.000Z',
      clients: { trade_name: 'Walmart', company_name: null },
      unit_assemblies: { economic_number: 'ECO-105', trailer2_id: 'trl-2', employees: { full_name: 'Operador 1' } },
      walmart_trip_data: { coordinator_name: 'Coord', route: 'R-01', carta_porte_walmart: 'CPW-1', num_stores: 2 },
    }

    const mapped = TripsMapper.toTripWithRelations(row)
    expect(mapped.trip.id).toBe('trip-1')
    expect(mapped.trip.tripNumber).toBe(42)
    expect(mapped.trip.status).toBe('in_progress')
    expect(mapped.clientName).toBe('Walmart')
    expect(mapped.unitEconomicNumber).toBe('ECO-105')
    expect(mapped.operatorName).toBe('Operador 1')
    expect(mapped.isFullAssembly).toBe(true)
    expect(mapped.walmartData?.route).toBe('R-01')
  })
})
