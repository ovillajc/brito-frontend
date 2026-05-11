import { describe, expect, it } from 'vitest'
import { createExpenseSchema } from '@/src/features/expenses/domain/schemas/create-expense.schema'

describe('createExpenseSchema', () => {
  const base = {
    tripId: null,
    truckId: null,
    trailerId: null,
    categoryId: '00000000-0000-0000-0000-000000000001',
    subcategoryId: '00000000-0000-0000-0000-000000000002',
    description: 'Caseta autopista',
    frequency: null,
    cargoTypeId: null,
    comments: null,
    expenseDate: '2026-05-09',
    receiptUrl: null,
  } as const

  it('acepta cuando unitPrice × quantity coincide con amount', () => {
    const result = createExpenseSchema.safeParse({
      ...base,
      unitPrice: 10,
      quantity: 2,
      unitId: '00000000-0000-0000-0000-000000000003',
      amount: 20,
    })
    expect(result.success).toBe(true)
  })

  it('rechaza cuando falta unitId', () => {
    const result = createExpenseSchema.safeParse({
      ...base,
      unitPrice: 10,
      quantity: 2,
      unitId: null,
      amount: 20,
    })
    expect(result.success).toBe(false)
  })

  it('rechaza cuando amount no coincide con unitPrice × quantity', () => {
    const result = createExpenseSchema.safeParse({
      ...base,
      unitPrice: 10,
      quantity: 2,
      unitId: '00000000-0000-0000-0000-000000000003',
      amount: 25,
    })
    expect(result.success).toBe(false)
  })
})

