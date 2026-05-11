/**
 * @fileoverview Repositorio Supabase para catálogos de gastos:
 * expense_categories, expense_subcategories, measurement_units, cargo_types.
 */

import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseCatalogsRepository } from '../../domain/repositories/i-expenses-repository'
import type {
  CargoTypeEntity,
  ExpenseCategoryEntity,
  ExpenseSubcategoryEntity,
  MeasurementUnitEntity,
} from '../../domain/entities/expense-entity'
import {
  ExpenseMapper,
  type CargoTypeRow,
  type ExpenseCategoryRow,
  type ExpenseSubcategoryRow,
  type MeasurementUnitRow,
} from '../mappers/ExpenseMapper'

export class SupabaseExpenseCatalogsRepository implements IExpenseCatalogsRepository {
  async listCategories(): Promise<Either<Failure, ExpenseCategoryEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('expense_categories')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseMapper.categoryToDomain(r as ExpenseCategoryRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar categorías' } }
    }
  }

  async listSubcategories(categoryId: string): Promise<Either<Failure, ExpenseSubcategoryEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('expense_subcategories')
        .select('id, category_id, name, is_active')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseMapper.subcategoryToDomain(r as ExpenseSubcategoryRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar detalles' } }
    }
  }

  async listMeasurementUnits(): Promise<Either<Failure, MeasurementUnitEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('measurement_units')
        .select('id, name, abbreviation, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseMapper.measurementUnitToDomain(r as MeasurementUnitRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar unidades de medida' } }
    }
  }

  async listCargoTypes(): Promise<Either<Failure, CargoTypeEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('cargo_types')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => ExpenseMapper.cargoTypeToDomain(r as CargoTypeRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar tipos de carga' } }
    }
  }
}
