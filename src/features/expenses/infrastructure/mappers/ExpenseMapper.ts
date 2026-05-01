import type { ExpenseCategory, ExpenseEntity, ExpenseScope } from '../../domain/entities/expense-entity'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'

export interface ExpenseRecord {
  id: string
  company_id: string
  scope: ExpenseScope
  category: ExpenseCategory
  description: string
  amount: number
  currency: 'MXN'
  occurred_at: string
  vendor_name: string | null
  reference: string | null
  trip_id: string | null
  created_at: string
}

function toDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return new Date()
  return date
}

export class ExpenseMapper {
  static toDomain(raw: ExpenseRecord): ExpenseEntity {
    return {
      id: raw.id,
      companyId: raw.company_id,
      scope: raw.scope,
      category: raw.category,
      description: raw.description,
      amount: raw.amount,
      currency: raw.currency,
      occurredAt: toDate(raw.occurred_at),
      vendorName: raw.vendor_name,
      reference: raw.reference,
      tripId: raw.trip_id,
      createdAt: toDate(raw.created_at),
    }
  }

  static fromCreateInput(input: CreateExpenseInput, id: string, nowIso: string): ExpenseRecord {
    return {
      id,
      company_id: input.companyId,
      scope: input.scope,
      category: input.category,
      description: input.description,
      amount: input.amount,
      currency: 'MXN',
      occurred_at: input.occurredAt,
      vendor_name: input.vendorName,
      reference: input.reference,
      trip_id: input.tripId,
      created_at: nowIso,
    }
  }
}

