import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { OperatorSettlementKpiEntity } from '../domain/entities/operator-settlement-entity'

export async function GetOperatorSettlementKpis(
  repo: IExpenseAssignmentsRepository,
  limit: number,
  onlyOpen?: boolean
): Promise<Either<Failure, OperatorSettlementKpiEntity[]>> {
  try {
    return await repo.listOperatorSettlementKpis(limit, onlyOpen)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener ajustes de cuentas' } }
  }
}
