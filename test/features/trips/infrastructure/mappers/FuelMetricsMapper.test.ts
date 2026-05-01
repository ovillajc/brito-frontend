import { describe, expect, it } from 'vitest'
import { FuelMetricsMapper, type FuelLoadHistoryRow, type FuelMetricsListTripRow } from '@/src/features/trips/infrastructure/mappers/FuelMetricsMapper'

describe('FuelMetricsMapper', () => {
  it('maps trip list row to TripFuelRowEntity with calculated fields', () => {
    const row: FuelMetricsListTripRow = {
      id: 'trip-uuid',
      folio: 'VJE-0001',
      trip_number: 42,
      origin: 'Monterrey',
      destination: 'Apodaca',
      departure_date: '2026-04-20',
      initial_km: null,
      final_km: null,
      preinvoice_km: null,
      status: 'completed',
      monitored_by: 'Monitorista 1',
      observations: null,
      clients: { trade_name: 'Walmart', company_name: null },
      unit_assemblies: {
        economic_number: 'ECO-100',
        trailer2_id: null,
        trucks: { plates: 'MX-1234', theoretical_yield: 5 },
        employees: { full_name: 'Juan Pérez' },
      },
      trip_fuel_metrics: [{
        km_initial: 1000,
        km_final: 1500,
        fuel_load_id: 'fuel-uuid',
        hours_r1: 2,
        liters_real_r1: 10,
        hours_r2: 0,
        liters_real_r2: 0,
        total_km_preinvoice: 520,
      }],
      fuel_loads: [{
        id: 'fuel-uuid',
        ticket_folio: 'TK-01',
        liters_loaded: 100,
        price_per_liter: 20,
        total_cost: 2000,
        created_at: '2026-04-20T10:00:00.000Z',
      }],
    }

    const mapped = FuelMetricsMapper.tripToTripFuelRowEntity(row)

    expect(mapped.id).toBe('trip-uuid')
    expect(mapped.folio).toBe('VJE-000042')
    expect(mapped.tripNumber).toBe(42)
    expect(mapped.clientName).toBe('Walmart')
    expect(mapped.unitEconomicNumber).toBe('ECO-100')
    expect(mapped.operatorName).toBe('Juan Pérez')
    expect(mapped.kmTraveled).toBe(500)

    expect(mapped.realYieldEngine).toBe(5)
    expect(mapped.litersTheoreticalEngine).toBe(100)
    expect(mapped.savingsExcessEngine).toBe(0)

    expect(mapped.totalDieselCostTrip).toBe(2200)
    expect(mapped.preinvoiceVariance).toBe(20)
  })

  it('handles missing related data', () => {
    const row: FuelMetricsListTripRow = {
      id: 'trip-uuid',
      folio: null,
      trip_number: null,
      origin: null,
      destination: null,
      departure_date: null,
      initial_km: null,
      final_km: null,
      preinvoice_km: null,
      status: null,
      monitored_by: null,
      observations: null,
      clients: null,
      unit_assemblies: null,
      trip_fuel_metrics: null,
      fuel_loads: null,
    }

    const mapped = FuelMetricsMapper.tripToTripFuelRowEntity(row)
    expect(mapped.folio).toBe('VJE-S/N')
    expect(mapped.origin).toBe('—')
    expect(mapped.destination).toBe('—')
    expect(mapped.kmTraveled).toBeNull()
    expect(mapped.realYieldEngine).toBeNull()
  })

  it('maps fuel_loads history row to FuelLoadHistoryRowEntity with visual folio', () => {
    const row: FuelLoadHistoryRow = {
      id: 'fuel-1',
      trip_id: 'trip-1',
      load_date: '2026-04-23T10:00:00.000Z',
      ticket_folio: 'TK-9',
      liters_loaded: 120.5,
      price_per_liter: 23.75,
      total_cost: 2861.875,
      source_type: 'EXTERNAL',
      is_full_tank_fill: false,
      trips: {
        trip_number: 7,
        folio: null,
        clients: { trade_name: 'Walmart', company_name: null },
        unit_assemblies: { economic_number: 'ECO-105', employees: { full_name: 'Operador 1' } },
      },
    }

    const mapped = FuelMetricsMapper.fuelLoadHistoryToEntity(row)
    expect(mapped.id).toBe('fuel-1')
    expect(mapped.folio).toBe('VJE-000007')
    expect(mapped.tripNumber).toBe(7)
    expect(mapped.clientName).toBe('Walmart')
    expect(mapped.unitEconomicNumber).toBe('ECO-105')
    expect(mapped.operatorName).toBe('Operador 1')
    expect(mapped.ticketFolio).toBe('TK-9')
    expect(mapped.sourceType).toBe('EXTERNAL')
  })
})
