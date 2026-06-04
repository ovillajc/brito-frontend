/**
 * @fileoverview Repositorio Supabase para Gastos Operativos en servidor.
 * Debe usarse desde Server Actions/Server Components para preservar la sesión
 * (cookies) y respetar RLS con rol authenticated.
 */

import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpensesRepository, ExpensesListFilters } from '../../domain/repositories/i-expenses-repository'
import type { ExpenseEntity } from '../../domain/entities/expense-entity'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'
import { ExpenseMapper, type ExpenseRow } from '../mappers/ExpenseMapper'

const SELECT_WITH_JOINS = [
  '*',
  'expense_categories(name)',
  'expense_subcategories(name)',
  'measurement_units(name)',
  'cargo_types(name)',
  'trips(trip_number)',
].join(', ')

export class SupabaseExpensesServerRepository implements IExpensesRepository {
  async list(filters: ExpensesListFilters = {}): Promise<Either<Failure, ExpenseEntity[]>> {
    try {
      const supabase = await createClient()
      let query = supabase
        .from('expenses')
        .select(SELECT_WITH_JOINS)
        .order('expense_date', { ascending: false })

      if (filters.tripId) query = query.eq('trip_id', filters.tripId)
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
      if (filters.from) query = query.gte('expense_date', filters.from.toISOString())
      if (filters.to) query = query.lte('expense_date', filters.to.toISOString())
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return { ok: true, data: (data ?? []).map((r) => ExpenseMapper.toDomain(r as unknown as ExpenseRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener gastos' } }
    }
  }

  async create(input: CreateExpenseInput, createdByProfileId: string | null): Promise<Either<Failure, ExpenseEntity>> {
    try {
      const supabase = await createClient()
      const payload = ExpenseMapper.toInsertPayload(input, createdByProfileId)

      const { data, error } = await supabase
        .from('expenses')
        .insert(payload)
        .select(SELECT_WITH_JOINS)
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return { ok: true, data: ExpenseMapper.toDomain(data as unknown as ExpenseRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al registrar gasto' } }
    }
  }

  async update(expenseId: string, input: CreateExpenseInput): Promise<Either<Failure, ExpenseEntity>> {
    try {
      const supabase = await createClient()
      const payload = ExpenseMapper.toUpdatePayload(input)

      const { data, error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', expenseId)
        .select(SELECT_WITH_JOINS)
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return { ok: true, data: ExpenseMapper.toDomain(data as unknown as ExpenseRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar gasto' } }
    }
  }

  async delete(expenseId: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar gasto' } }
    }
  }
}

