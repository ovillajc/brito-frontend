import type { Either, Failure } from '../../../../core/domain/either'
import type { WorkOrderPartEntity } from '../../domain/entities/entities'
import type { IWorkOrderPartRepository } from '../../domain/repositories/repositories'
import { createWorkOrderPartSchema, type CreateWorkOrderPartInput } from '../../domain/schemas/schemas'

/**
 * @fileoverview Caso de uso para agregar una pieza o servicio a una orden de trabajo.
 */

export async function CreateWorkOrderPartUseCase(
  repository: IWorkOrderPartRepository,
  input: CreateWorkOrderPartInput
): Promise<Either<Failure, WorkOrderPartEntity>> {
  try {
    const validation = createWorkOrderPartSchema.safeParse(input)
    if (!validation.success) {
      return {
        ok: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: validation.error.issues[0]?.message || 'Error de validación'
        }
      }
    }

    const part = await repository.create(validation.data)
    
    return { ok: true, data: part }
  } catch (error: unknown) {
    const err = error as Error
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: err.message || 'Error inesperado al agregar la pieza' }
    }
  }
}
