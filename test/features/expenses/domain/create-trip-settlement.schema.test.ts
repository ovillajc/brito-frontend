import { describe, expect, it } from 'vitest'
import { createTripSettlementSchema } from '@/src/features/expenses/domain/schemas/create-trip-settlement.schema'

describe('createTripSettlementSchema', () => {
  it('acepta receiptUrl null', () => {
    const result = createTripSettlementSchema.safeParse({
      tripId: '00000000-0000-0000-0000-000000000111',
      operatorId: null,
      receiptUrl: null,
      notes: null,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza receiptUrl inválida', () => {
    const result = createTripSettlementSchema.safeParse({
      tripId: '00000000-0000-0000-0000-000000000111',
      operatorId: null,
      receiptUrl: 'no-es-url',
      notes: null,
    })
    expect(result.success).toBe(false)
  })
})

