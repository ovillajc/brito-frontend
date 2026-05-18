/**
 * @fileoverview Mappers para convertir filas de Supabase a entidades de dominio.
 */

import type {
  CargoTypeEntity,
  ExpenseCategoryEntity,
  ExpenseEntity,
  ExpenseFrequency,
  ExpenseSubcategoryEntity,
  MeasurementUnitEntity,
} from '../../domain/entities/expense-entity'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'

// ---------------------------------------------------------------------------
// DTOs de Supabase (shape de las filas)
// ---------------------------------------------------------------------------

export interface ExpenseCategoryRow {
  id: string
  name: string
  description: string | null
  is_active: boolean
}

export interface ExpenseSubcategoryRow {
  id: string
  category_id: string
  name: string
  is_active: boolean
}

export interface MeasurementUnitRow {
  id: string
  name: string
  abbreviation: string | null
  is_active: boolean
}

export interface CargoTypeRow {
  id: string
  name: string
  is_active: boolean
}

/** Fila raw de expenses con JOINs */
export interface ExpenseRow {
  id: string
  trip_id: string | null
  truck_id: string | null
  trailer_id: string | null
  category_id: string | null
  subcategory_id: string | null
  description: string
  unit_price: number | null
  quantity: number | null
  unit_id: string | null
  amount: number
  frequency: string | null
  cargo_type_id: string | null
  comments: string | null
  expense_date: string
  receipt_url: string | null
  created_by: string | null
  created_at: string
  // JOINs opcionales
  expense_categories?: { name: string } | null
  expense_subcategories?: { name: string } | null
  measurement_units?: { name: string } | null
  cargo_types?: { name: string } | null
}

// ---------------------------------------------------------------------------
// Mapper principal
// ---------------------------------------------------------------------------

export class ExpenseMapper {
  static categoryToDomain(row: ExpenseCategoryRow): ExpenseCategoryEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.is_active,
    }
  }

  static subcategoryToDomain(row: ExpenseSubcategoryRow): ExpenseSubcategoryEntity {
    return {
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      isActive: row.is_active,
    }
  }

  static measurementUnitToDomain(row: MeasurementUnitRow): MeasurementUnitEntity {
    return {
      id: row.id,
      name: row.name,
      abbreviation: row.abbreviation,
      isActive: row.is_active,
    }
  }

  static cargoTypeToDomain(row: CargoTypeRow): CargoTypeEntity {
    return {
      id: row.id,
      name: row.name,
      isActive: row.is_active,
    }
  }

  static toDomain(row: ExpenseRow): ExpenseEntity {
    return {
      id: row.id,
      tripId: row.trip_id,
      truckId: row.truck_id,
      trailerId: row.trailer_id,
      categoryId: row.category_id,
      categoryName: row.expense_categories?.name ?? null,
      subcategoryId: row.subcategory_id,
      subcategoryName: row.expense_subcategories?.name ?? null,
      description: row.description,
      unitPrice: row.unit_price,
      quantity: row.quantity,
      unitId: row.unit_id,
      unitName: row.measurement_units?.name ?? null,
      amount: row.amount,
      frequency: (row.frequency as ExpenseFrequency) ?? null,
      cargoTypeId: row.cargo_type_id,
      cargoTypeName: row.cargo_types?.name ?? null,
      comments: row.comments,
      expenseDate: new Date(row.expense_date),
      receiptUrl: row.receipt_url,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
    }
  }

  /**
   * Convierte el input del Use Case al payload para insertar en Supabase.
   */
  static toInsertPayload(
    input: CreateExpenseInput,
    createdByProfileId: string | null
  ): Omit<ExpenseRow, 'id' | 'created_at' | 'expense_categories' | 'expense_subcategories' | 'measurement_units' | 'cargo_types'> {
    return {
      trip_id: input.tripId || null,
      truck_id: input.truckId || null,
      trailer_id: input.trailerId || null,
      category_id: input.categoryId || null,
      subcategory_id: input.subcategoryId || null,
      description: input.description,
      unit_price: input.unitPrice,
      quantity: input.quantity,
      unit_id: input.unitId || null,
      amount: input.amount,
      frequency: input.frequency || null,
      cargo_type_id: input.cargoTypeId || null,
      comments: input.comments || null,
      expense_date: input.expenseDate,
      receipt_url: input.receiptUrl || null,
      created_by: createdByProfileId || null,
    }
  }

  static toUpdatePayload(
    input: CreateExpenseInput
  ): Omit<
    ExpenseRow,
    | 'id'
    | 'created_at'
    | 'created_by'
    | 'expense_categories'
    | 'expense_subcategories'
    | 'measurement_units'
    | 'cargo_types'
  > {
    return {
      trip_id: input.tripId || null,
      truck_id: input.truckId || null,
      trailer_id: input.trailerId || null,
      category_id: input.categoryId || null,
      subcategory_id: input.subcategoryId || null,
      description: input.description,
      unit_price: input.unitPrice,
      quantity: input.quantity,
      unit_id: input.unitId || null,
      amount: input.amount,
      frequency: input.frequency || null,
      cargo_type_id: input.cargoTypeId || null,
      comments: input.comments || null,
      expense_date: input.expenseDate,
      receipt_url: input.receiptUrl || null,
    }
  }
}
