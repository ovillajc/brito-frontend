/**
 * @fileoverview Use Case: Obtener todos los catálogos necesarios para el formulario de gastos.
 * Retorna en paralelo: categorías, unidades de medida y tipos de carga.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type {
  CargoTypeEntity,
  ExpenseCategoryEntity,
  MeasurementUnitEntity,
} from '../domain/entities/expense-entity'
import type { IExpenseCatalogsRepository } from '../domain/repositories/i-expenses-repository'

export interface ExpenseCatalogsData {
  categories: ExpenseCategoryEntity[]
  measurementUnits: MeasurementUnitEntity[]
  cargoTypes: CargoTypeEntity[]
}

/**
 * Obtiene en paralelo todos los catálogos necesarios para renderizar
 * el formulario de registro de gastos operativos.
 *
 * @param repo - Repositorio de catálogos inyectado.
 * @returns Either con Failure o un objeto con los 3 catálogos.
 */
export async function GetExpenseCatalogs(
  repo: IExpenseCatalogsRepository
): Promise<Either<Failure, ExpenseCatalogsData>> {
  try {
    const [categoriesResult, unitsResult, cargoResult] = await Promise.all([
      repo.listCategories(),
      repo.listMeasurementUnits(),
      repo.listCargoTypes(),
    ])

    if (!categoriesResult.ok) return categoriesResult
    if (!unitsResult.ok) return unitsResult
    if (!cargoResult.ok) return cargoResult

    return {
      ok: true,
      data: {
        categories: categoriesResult.data,
        measurementUnits: unitsResult.data,
        cargoTypes: cargoResult.data,
      },
    }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar catálogos' } }
  }
}
