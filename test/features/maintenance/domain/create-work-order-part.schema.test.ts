import { describe, expect, it } from 'vitest'
import { createWorkOrderPartSchema } from '@/src/features/maintenance/domain/schemas/create-part.schema'

describe('createWorkOrderPartSchema', () => {
  it('rechaza cantidad <= 0', () => {
    const result = createWorkOrderPartSchema.safeParse({
      workOrderId: '00000000-0000-0000-0000-000000000111',
      providerId: null,
      inventoryItemId: null,
      description: 'Filtro',
      brand: null,
      unitId: null,
      quantity: 0,
      unitPrice: 10,
      discount: 0,
      taxRate: 0.16,
    })
    expect(result.success).toBe(false)
  })

  it('coerce y acepta valores válidos', () => {
    const result = createWorkOrderPartSchema.safeParse({
      workOrderId: '00000000-0000-0000-0000-000000000111',
      providerId: null,
      inventoryItemId: null,
      description: 'Filtro',
      brand: '',
      unitId: null,
      quantity: '2',
      unitPrice: '10.5',
      discount: '0',
      taxRate: '0.16',
    })
    expect(result.success).toBe(true)
  })
})

