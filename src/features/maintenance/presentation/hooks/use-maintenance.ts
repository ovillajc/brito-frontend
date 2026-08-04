'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SupabaseMaintenanceRepository } from '../../infrastructure/repositories/SupabaseMaintenanceRepository'
import { GetWorkshopStays } from '../../application/GetWorkshopStays'
import { GetMaintenanceCatalogs } from '../../application/GetMaintenanceCatalogs'
import { GetStayWorkOrders } from '../../application/GetStayWorkOrders'
import { GetWorkOrderParts } from '../../application/GetWorkOrderParts'
import {
  createWorkshopStayAction,
  closeWorkshopStayAction,
  createWorkOrderAction,
  createWorkOrderPartAction,
  updateWorkshopStayAction,
  updateWorkOrderAction,
  updateWorkOrderPartAction,
  deleteWorkshopStayAction,
  deleteWorkOrderAction,
  deleteWorkOrderPartAction
} from '../actions/maintenance.actions'
import type { MaintenanceListFilters } from '../../domain/repositories/i-maintenance-repository'
import type { CreateWorkshopStayInput } from '../../domain/schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../../domain/schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../../domain/schemas/create-part.schema'

const repo = new SupabaseMaintenanceRepository()

import { GetAllWorkOrders } from '../../application/GetAllWorkOrders'
import { GetAllWorkOrderParts } from '../../application/GetAllWorkOrderParts'
import { GetMeasurementUnits } from '../../application/GetMeasurementUnits'
import { GetInventoryItems } from '../../application/GetInventoryItems'

export function useWorkshopStays(filters?: MaintenanceListFilters) {
  return useQuery({
    queryKey: ['maintenance', 'stays', filters],
    queryFn: async () => {
      const result = await GetWorkshopStays(repo, filters)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useAllWorkOrders(filters?: MaintenanceListFilters) {
  return useQuery({
    queryKey: ['maintenance', 'all-work-orders', filters],
    queryFn: async () => {
      const result = await GetAllWorkOrders(repo, filters)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useAllWorkOrderParts(filters?: MaintenanceListFilters) {
  return useQuery({
    queryKey: ['maintenance', 'all-parts', filters],
    queryFn: async () => {
      const result = await GetAllWorkOrderParts(repo, filters)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useMaintenanceCatalogs() {
  return useQuery({
    queryKey: ['maintenance', 'catalogs'],
    queryFn: async () => {
      const result = await GetMaintenanceCatalogs(repo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useMeasurementUnits() {
  return useQuery({
    queryKey: ['maintenance', 'measurement-units'],
    queryFn: async () => {
      const result = await GetMeasurementUnits(repo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useInventoryItems() {
  return useQuery({
    queryKey: ['maintenance', 'inventory-items'],
    queryFn: async () => {
      const result = await GetInventoryItems(repo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useStayWorkOrders(stayId: string | null) {
  return useQuery({
    queryKey: ['maintenance', 'work-orders', stayId],
    enabled: !!stayId,
    queryFn: async () => {
      if (!stayId) return []
      const result = await GetStayWorkOrders(repo, stayId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useWorkOrderParts(workOrderId: string | null) {
  return useQuery({
    queryKey: ['maintenance', 'parts', workOrderId],
    enabled: !!workOrderId,
    queryFn: async () => {
      if (!workOrderId) return []
      const result = await GetWorkOrderParts(repo, workOrderId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

export function useCreateWorkshopStay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateWorkshopStayInput) => {
      const result = await createWorkshopStayAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useCloseWorkshopStay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stayId: string) => {
      const result = await closeWorkshopStayAction(stayId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useCreateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateWorkOrderInput) => {
      const result = await createWorkOrderAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'work-orders', input.stayId] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useCreateWorkOrderPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateWorkOrderPartInput) => {
      const result = await createWorkOrderPartAction(input)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_data, input) => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'parts', input.workOrderId] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'all-parts'] })
    },
  })
}

export function useUpdateWorkshopStay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateWorkshopStayInput> }) => {
      const result = await updateWorkshopStayAction(id, data)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useUpdateWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateWorkOrderInput> }) => {
      const result = await updateWorkOrderAction(id, data)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'all-work-orders'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'work-orders'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useUpdateWorkOrderPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<CreateWorkOrderPartInput> }) => {
      const result = await updateWorkOrderPartAction(id, data)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'all-parts'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'parts'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useDeleteWorkshopStay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWorkshopStayAction(id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useDeleteWorkOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWorkOrderAction(id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'all-work-orders'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'work-orders'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}

export function useDeleteWorkOrderPart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWorkOrderPartAction(id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance', 'all-parts'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'parts'] })
      qc.invalidateQueries({ queryKey: ['maintenance', 'stays'] })
    },
  })
}
