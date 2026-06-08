import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { OperatorSettlementEntity } from '../domain/entities/operator-settlement-entity'
import type { CreateOperatorSettlementInput } from '../domain/schemas/operator-settlement.schema'

export async function CreateOperatorSettlement(
  repo: IExpenseAssignmentsRepository,
  input: CreateOperatorSettlementInput,
  settledBy: string | null
): Promise<Either<Failure, OperatorSettlementEntity>> {
  try {
    return await repo.createOperatorSettlement(input, settledBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear ajuste de cuentas' } }
  }
}
