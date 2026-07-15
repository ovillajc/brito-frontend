'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SupabaseExpenseAssignmentsRepository } from '../../infrastructure/repositories/SupabaseExpenseAssignmentsRepository'
import { GetExpenseAdvances } from '../../application/GetExpenseAdvances'
import { GetTripExpenseAssignmentKpis } from '../../application/GetTripExpenseAssignmentKpis'
import { GetOperatorSettlementKpis } from '../../application/GetOperatorSettlementKpis'
import {
  createExpenseAdvanceAction,
  createTripSettlementAction,
  deleteTripSettlementAction,
  unlinkExpenseFromTripAction,
  linkExpenseAdvanceToTripAction,
  updateExpenseAdvanceAction,
  deleteExpenseAdvanceAction,
  createOperatorSettlementAction,
  closeOperatorSettlementAction,
  reopenOperatorSettlementAction,
  linkExpenseToSettlementAction,
  unlinkExpenseFromSettlementAction,
} from '../actions/expense-assignments.actions'
import type { CreateExpenseAdvanceInput } from '../../domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '../../domain/schemas/create-trip-settlement.schema'
import type {
  CreateOperatorSettlementInput,
  CloseOperatorSettlementInput,
  LinkExpenseToSettlementInput,
  ReopenOperatorSettlementInput,
} from '../../domain/schemas/operator-settlement.schema'
import { deleteOperatorSettlementAction } from '../actions/expense-assignments.actions'

const repo = new SupabaseExpenseAssignmentsRepository()

// ── Adelantos ──────────────────────────────────────────────────────────────

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
      qc.invalidateQueries({ queryKey: ['expenses', 'operator-settlement-kpis'] })
    },
  })
}

export function useUpdateExpenseAdvance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; data: CreateExpenseAdvanceInput }) => {
      const result = await updateExpenseAdvanceAction(input.id, input.data)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'advances'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'operator-settlement-kpis'] })
    },
  })
}

export function useDeleteExpenseAdvance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteExpenseAdvanceAction(id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'advances'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
      qc.invalidateQueries({ queryKey: ['expenses', 'operator-settlement-kpis'] })
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
      qc.invalidateQueries({ queryKey: ['expenses', 'operator-settlement-kpis'] })
    },
  })
}

// ── KPIs por viaje (legacy) ────────────────────────────────────────────────

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

export function useDeleteTripSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (tripId: string) => {
      const result = await deleteTripSettlementAction(tripId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
    },
  })
}

export function useUnlinkExpenseFromTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const result = await unlinkExpenseFromTripAction(expenseId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
      await qc.invalidateQueries({ queryKey: ['expenses', 'trip-assignment-kpis'] })
    },
  })
}

// ── Ajuste de Cuentas por Operador (nuevo flujo) ───────────────────────────

export function useOperatorSettlementKpis(limit = 100, onlyOpen?: boolean) {
  return useQuery({
    queryKey: ['expenses', 'operator-settlement-kpis', limit, onlyOpen],
    queryFn: async () => {
      const result = await GetOperatorSettlementKpis(repo, limit, onlyOpen)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useCreateOperatorSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateOperatorSettlementInput) => {
      const result = await createOperatorSettlementAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useCloseOperatorSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CloseOperatorSettlementInput) => {
      const result = await closeOperatorSettlementAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useReopenOperatorSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ReopenOperatorSettlementInput) => {
      const result = await reopenOperatorSettlementAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useDeleteOperatorSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteOperatorSettlementAction(id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useLinkExpenseToSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: LinkExpenseToSettlementInput) => {
      const result = await linkExpenseToSettlementAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useUnlinkExpenseFromSettlement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (expenseId: string) => {
      const result = await unlinkExpenseFromSettlementAction(expenseId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
