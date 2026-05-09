'use server'

import type { Either, Failure } from '@/src/core/domain/either'
import type { BiCatalogsEntity, FleetElementType, GlobalKpiEntity, OperativeHistoryItem } from '../../domain/entities/bi-entity'
import { SupabaseBiRepository } from '../../infrastructure/repositories/SupabaseBiRepository'
import { GetGlobalKpis } from '../../application/GetGlobalKpis'
import { GetBiCatalogs } from '../../application/GetBiCatalogs'
import { GetFleetHistory } from '../../application/GetFleetHistory'

const repo = new SupabaseBiRepository()

export async function fetchGlobalKpisAction(): Promise<Either<Failure, GlobalKpiEntity>> {
  return GetGlobalKpis(repo)
}

export async function fetchBiCatalogsAction(): Promise<Either<Failure, BiCatalogsEntity>> {
  return GetBiCatalogs(repo)
}

export async function fetchFleetHistoryAction(
  type: FleetElementType,
  id: string
): Promise<Either<Failure, OperativeHistoryItem[]>> {
  return GetFleetHistory(repo, type, id)
}

export async function fetchTruckHistoryAction(truckId: string) {
  return fetchFleetHistoryAction('truck', truckId)
}

export async function fetchTrailerHistoryAction(trailerId: string) {
  return fetchFleetHistoryAction('trailer', trailerId)
}

export async function fetchOperatorHistoryAction(employeeId: string) {
  return fetchFleetHistoryAction('operator', employeeId)
}

export async function fetchAssemblyHistoryAction(assemblyId: string) {
  return fetchFleetHistoryAction('assembly', assemblyId)
}
