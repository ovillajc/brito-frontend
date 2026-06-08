import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { LinkExpenseToSettlementInput } from '../domain/schemas/operator-settlement.schema'

export async function LinkExpenseToSettlement(
  repo: IExpenseAssignmentsRepository,
  input: LinkExpenseToSettlementInput
): Promise<Either<Failure, void>> {
  try {
    return await repo.linkExpenseToSettlement(input)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al vincular gasto al ajuste' } }
  }
}

export async function UnlinkExpenseFromSettlement(
  repo: IExpenseAssignmentsRepository,
  expenseId: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.unlinkExpenseFromSettlement(expenseId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al desvincular gasto del ajuste' } }
  }
}
