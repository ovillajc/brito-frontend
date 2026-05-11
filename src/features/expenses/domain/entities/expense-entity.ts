/**
 * @fileoverview Entidades y constantes del dominio de Gastos Operativos.
 * Refleja la nueva estructura de la DB: categorías, sub-categorías,
 * unidades de medida, tipos de carga y frecuencia.
 */

// ---------------------------------------------------------------------------
// Catálogos de dominio
// ---------------------------------------------------------------------------

export interface ExpenseCategoryEntity {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface ExpenseSubcategoryEntity {
  id: string
  categoryId: string
  name: string
  isActive: boolean
}

export interface MeasurementUnitEntity {
  id: string
  name: string
  abbreviation: string | null
  isActive: boolean
}

export interface CargoTypeEntity {
  id: string
  name: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Frecuencia de un gasto
// ---------------------------------------------------------------------------

export const EXPENSE_FREQUENCY = {
  Recurrent: 'recurrente',
  Extraordinary: 'extraordinario',
} as const

export type ExpenseFrequency = typeof EXPENSE_FREQUENCY[keyof typeof EXPENSE_FREQUENCY]

// ---------------------------------------------------------------------------
// Entidad principal de Gasto Operativo
// ---------------------------------------------------------------------------

export interface ExpenseEntity {
  id: string
  tripId: string | null
  truckId: string | null
  trailerId: string | null
  /** FK a expense_categories */
  categoryId: string | null
  /** Nombre de la categoría (denormalizado desde JOIN) */
  categoryName: string | null
  /** FK a expense_subcategories */
  subcategoryId: string | null
  /** Nombre de la sub-categoría (denormalizado desde JOIN) */
  subcategoryName: string | null
  /** Descripción libre del gasto */
  description: string
  /** Precio unitario del artículo/servicio */
  unitPrice: number | null
  /** Cantidad de unidades */
  quantity: number | null
  /** FK a measurement_units */
  unitId: string | null
  /** Nombre de la unidad de medida (denormalizado) */
  unitName: string | null
  /** Monto total del gasto */
  amount: number
  /** Frecuencia: recurrente | extraordinario */
  frequency: ExpenseFrequency | null
  /** FK a cargo_types */
  cargoTypeId: string | null
  /** Nombre del tipo de carga (denormalizado) */
  cargoTypeName: string | null
  /** Comentarios adicionales */
  comments: string | null
  expenseDate: Date
  receiptUrl: string | null
  createdBy: string | null
  createdAt: Date
}
