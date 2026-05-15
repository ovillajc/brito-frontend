import { describe, expect, it } from 'vitest'
import { createExpenseAdvanceSchema } from '@/src/features/expenses/domain/schemas/create-expense-advance.schema'
import { ADVANCE_METHOD } from '@/src/features/expenses/domain/entities/expense-assignment-entity'

describe('createExpenseAdvanceSchema', () => {
  it('rechaza monto <= 0', () => {
    const result = createExpenseAdvanceSchema.safeParse({
      tripId: null,
      unitAssemblyId: null,
      operatorId: '00000000-0000-0000-0000-000000000111',
      truckId: null,
      trailerId: null,
      amount: 0,
      method: ADVANCE_METHOD.Cash,
      assignedAt: '2026-05-09',
      notes: null,
    })
    expect(result.success).toBe(false)
  })
})

