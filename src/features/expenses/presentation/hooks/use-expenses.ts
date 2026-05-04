'use client'

/**
 * @fileoverview Hooks de presentación para gastos operativos.
 * Usa Server Actions para mutaciones y TanStack Query para data fetching.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SupabaseExpensesRepository } from '../../infrastructure/repositories/SupabaseExpensesRepository'
import { GetExpenses } from '../../application/GetExpenses'
import { createExpenseAction, deleteExpenseAction } from '../actions/expenses.actions'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'
import type { ExpensesListFilters } from '../../domain/repositories/i-expenses-repository'

const expensesRepo = new SupabaseExpensesRepository()

/**
 * Hook para obtener la lista de gastos con filtros opcionales.
 * @param filters - Filtros de listado (tripId, categoryId, rango de fechas, límite)
 */
export function useExpenses(filters?: ExpensesListFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const result = await GetExpenses(expensesRepo, filters)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 30,
  })
}

/** Hook para registrar un nuevo gasto operativo vía Server Action */
export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const result = await createExpenseAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

/** Hook para eliminar un gasto operativo */
export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const result = await deleteExpenseAction(expenseId)
      if (!result.ok) throw new Error(result.error.message)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
