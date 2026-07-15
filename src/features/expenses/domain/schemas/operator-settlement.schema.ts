import { z } from 'zod'

export const createOperatorSettlementSchema = z.object({
  operatorId: z.string().uuid('Se requiere un operador válido'),
  notes: z.string().trim().nullable().optional(),
  receiptUrl: z.string().url().nullable().optional(),
  /** Saldo previo: positivo = operador debe a empresa, negativo = empresa debe al operador */
  previousBalance: z.coerce.number().default(0),
})

export type CreateOperatorSettlementInput = z.infer<typeof createOperatorSettlementSchema>

export const closeOperatorSettlementSchema = z.object({
  settlementId: z.string().uuid('Se requiere un ajuste válido'),
  notes: z.string().trim().nullable().optional(),
  receiptUrl: z.string().url().nullable().optional(),
})

export type CloseOperatorSettlementInput = z.infer<typeof closeOperatorSettlementSchema>

export const reopenOperatorSettlementSchema = z.object({
  settlementId: z.string().uuid('Se requiere un ajuste válido'),
})

export type ReopenOperatorSettlementInput = z.infer<typeof reopenOperatorSettlementSchema>

export const linkExpenseToSettlementSchema = z.object({
  expenseId: z.string().uuid('Se requiere un gasto válido'),
  settlementId: z.string().uuid('Se requiere un ajuste válido'),
})

export type LinkExpenseToSettlementInput = z.infer<typeof linkExpenseToSettlementSchema>
