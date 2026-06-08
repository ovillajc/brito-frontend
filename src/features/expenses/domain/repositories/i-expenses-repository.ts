/**
 * @fileoverview Contratos de repositorios para el módulo de Gastos.
 * Incluye repositorio de datos maestros (catálogos) y de gastos.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type {
  CargoTypeEntity,
  ExpenseCategoryEntity,
  ExpenseSubcategoryEntity,
  MeasurementUnitEntity,
} from '../entities/expense-entity'
import type { ExpenseEntity } from '../entities/expense-entity'
import type { CreateExpenseInput } from '../schemas/create-expense.schema'

// ---------------------------------------------------------------------------
// Repositorio de catálogos
// ---------------------------------------------------------------------------

export interface IExpenseCatalogsRepository {
  /** Devuelve todas las categorías activas */
  listCategories(): Promise<Either<Failure, ExpenseCategoryEntity[]>>
  /** Devuelve sub-categorías de una categoría */
  listSubcategories(categoryId: string): Promise<Either<Failure, ExpenseSubcategoryEntity[]>>
  /** Devuelve todas las unidades de medida activas */
  listMeasurementUnits(): Promise<Either<Failure, MeasurementUnitEntity[]>>
  /** Devuelve todos los tipos de carga activos */
  listCargoTypes(): Promise<Either<Failure, CargoTypeEntity[]>>
}

// ---------------------------------------------------------------------------
// Filtros de listado de gastos
// ---------------------------------------------------------------------------

export interface ExpensesListFilters {
  tripId?: string
  categoryId?: string
  from?: Date
  to?: Date
  limit?: number
  expenseType?: 'operativo' | 'general' | 'all'
  settlementId?: string
  operatorId?: string
  onlyUnlinked?: boolean
}

// ---------------------------------------------------------------------------
// Repositorio de gastos
// ---------------------------------------------------------------------------

export interface IExpensesRepository {
  list(filters?: ExpensesListFilters): Promise<Either<Failure, ExpenseEntity[]>>
  create(input: CreateExpenseInput, createdByProfileId: string | null): Promise<Either<Failure, ExpenseEntity>>
  update(expenseId: string, input: CreateExpenseInput): Promise<Either<Failure, ExpenseEntity>>
  delete(expenseId: string): Promise<Either<Failure, void>>
}
