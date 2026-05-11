import { describe, expect, it, vi } from 'vitest'
import { UpdateExpense } from '@/src/features/expenses/application/UpdateExpense'
import type { IExpensesRepository } from '@/src/features/expenses/domain/repositories/i-expenses-repository'

describe('UpdateExpense', () => {
  const expenseId = '00000000-0000-0000-0000-000000000010'

  const validInput = {
    tripId: null,
    truckId: null,
    trailerId: null,
    categoryId: '00000000-0000-0000-0000-000000000001',
    subcategoryId: '00000000-0000-0000-0000-000000000002',
    description: 'Diésel',
    unitPrice: 10,
    quantity: 2,
    unitId: '00000000-0000-0000-0000-000000000003',
    amount: 20,
    frequency: null,
    cargoTypeId: null,
    comments: null,
    expenseDate: '2026-05-09',
    receiptUrl: null,
  } as const

  it('actualiza cuando el input es válido', async () => {
    const repo: IExpensesRepository = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    vi.mocked(repo.update).mockResolvedValue({
      ok: true,
      data: {
        id: expenseId,
        tripId: null,
        truckId: null,
        trailerId: null,
        categoryId: validInput.categoryId,
        categoryName: null,
        subcategoryId: validInput.subcategoryId,
        subcategoryName: null,
        description: validInput.description,
        unitPrice: validInput.unitPrice,
        quantity: validInput.quantity,
        unitId: validInput.unitId,
        unitName: null,
        amount: validInput.amount,
        frequency: null,
        cargoTypeId: null,
        cargoTypeName: null,
        comments: null,
        expenseDate: new Date(validInput.expenseDate),
        receiptUrl: null,
        createdBy: null,
        createdAt: new Date(),
      },
    })

    const result = await UpdateExpense(repo, expenseId, { ...validInput })

    expect(result.ok).toBe(true)
    expect(repo.update).toHaveBeenCalledWith(expenseId, expect.objectContaining({ amount: 20 }))
  })

  it('retorna VALIDATION_ERROR cuando el input no cumple el schema', async () => {
    const repo: IExpensesRepository = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const result = await UpdateExpense(repo, expenseId, { ...validInput, unitId: null })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(repo.update).not.toHaveBeenCalled()
  })

  it('retorna UNEXPECTED cuando el repo lanza una excepción', async () => {
    const repo: IExpensesRepository = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    vi.mocked(repo.update).mockImplementation(async () => {
      throw new Error('boom')
    })

    const result = await UpdateExpense(repo, expenseId, { ...validInput })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('UNEXPECTED')
    }
  })
})

