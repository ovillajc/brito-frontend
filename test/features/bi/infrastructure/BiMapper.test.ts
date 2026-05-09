import { describe, expect, it } from 'vitest'
import { BiMapper } from '@/src/features/bi/infrastructure/mappers/BiMapper'

describe('BiMapper', () => {
  it('mapea TripHistoryRow a OperativeHistoryItem', () => {
    const item = BiMapper.toOperativeHistoryItem({
      id: 'trip-1',
      folio: 'VJE-000001',
      departure_date: '2026-05-01',
      arrival_date_actual: '2026-05-02',
      origin: 'Villahermosa',
      destination: 'Coatzacoalcos',
      status: 'completed',
      clients: { trade_name: 'Walmart', company_name: null },
      unit_assemblies: {
        trucks: { economic_number: 'TR-001' },
        trailers: { economic_number: 'RM-001' },
        employees: { full_name: 'Operador 1' },
      },
      expenses: [{ amount: 100 }, { amount: 50 }, { amount: null }],
    })

    expect(item.tripId).toBe('trip-1')
    expect(item.folio).toBe('VJE-000001')
    expect(item.totalExpenses).toBe(150)
    expect(item.clientName).toBe('Walmart')
    expect(item.operatorName).toBe('Operador 1')
  })
})

