'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SupabaseExpenseAssignmentsRepository } from '../../infrastructure/repositories/SupabaseExpenseAssignmentsRepository'
import { GetExpenseAdvances } from '../../application/GetExpenseAdvances'
import { GetTripExpenseAssignmentKpis } from '../../application/GetTripExpenseAssignmentKpis'
import { createExpenseAdvanceAction, createTripSettlementAction, linkExpenseAdvanceToTripAction } from '../actions/expense-assignments.actions'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'

const repo = new SupabaseExpenseAssignmentsRepository()

export function useExpenseAdvances() {
  return useQuery({
    queryKey: ['expenses', 'advances'],
    queryFn: async () => {
      const result = await GetExpenseAdvances(repo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useTripExpenseAssignmentKpis(limit = 200) {
  return useQuery({
    queryKey: ['expenses', 'trip-assignment-kpis', limit],
    queryFn: async () => {
      const result = await GetTripExpenseAssignmentKpis(repo, limit)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useCreateExpenseAdvance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateExpenseAdvanceInput) => {
      const result = await createExpenseAdvanceAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'advances'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
    },
  })
}

export function useLinkExpenseAdvanceToTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { advanceId: string; tripId: string }) => {
      const result = await linkExpenseAdvanceToTripAction(input.advanceId, input.tripId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'advances'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
    },
  })
}

export function useCreateTripSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTripSettlementInput) => {
      const result = await createTripSettlementAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
    },
  })
}

