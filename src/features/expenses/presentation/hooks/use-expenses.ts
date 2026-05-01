'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GetExpenses } from '../../application/GetExpenses'
import { CreateExpense } from '../../application/CreateExpense'
import { MockExpensesRepository } from '../../infrastructure/repositories/MockExpensesRepository'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'

const expensesRepo = new MockExpensesRepository()

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: async () => {
      const result = await GetExpenses(expensesRepo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 30,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const result = await CreateExpense(expensesRepo, input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses', 'all'] })
    },
  })
}

