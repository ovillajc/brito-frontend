import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { OperatorSettlementEntity } from '../domain/entities/operator-settlement-entity'
import { reopenOperatorSettlementSchema, type ReopenOperatorSettlementInput } from '../domain/schemas/operator-settlement.schema'

export async function ReopenOperatorSettlement(
  repo: IExpenseAssignmentsRepository,
  input: ReopenOperatorSettlementInput,
  updatedByProfileId: string | null
): Promise<Either<Failure, OperatorSettlementEntity>> {
  if (!repo.reopenOperatorSettlement) {
    return { ok: false, error: { code: 'NOT_IMPLEMENTED', message: 'Repositorio no soporta reabrir ajuste de cuentas' } }
  }

  const parsed = reopenOperatorSettlementSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }
  }

  return repo.reopenOperatorSettlement(parsed.data, updatedByProfileId)
}
