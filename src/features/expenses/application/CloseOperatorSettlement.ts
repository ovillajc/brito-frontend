import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { OperatorSettlementEntity } from '../domain/entities/operator-settlement-entity'
import type { CloseOperatorSettlementInput } from '../domain/schemas/operator-settlement.schema'

export async function CloseOperatorSettlement(
  repo: IExpenseAssignmentsRepository,
  input: CloseOperatorSettlementInput,
  settledBy: string | null
): Promise<Either<Failure, OperatorSettlementEntity>> {
  try {
    return await repo.closeOperatorSettlement(input, settledBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cerrar ajuste de cuentas' } }
  }
}
