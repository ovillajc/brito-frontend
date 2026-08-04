import type { Either, Failure } from '../../../../core/domain/either'
import type { WorkshopStayEntity } from '../../domain/entities/entities'
import type { IWorkshopStayRepository } from '../../domain/repositories/repositories'
import { createWorkshopStaySchema, type CreateWorkshopStayInput } from '../../domain/schemas/schemas'

/**
 * @fileoverview Caso de uso para registrar una nueva estancia de taller.
 */

export async function CreateWorkshopStayUseCase(
  repository: IWorkshopStayRepository,
  input: CreateWorkshopStayInput
): Promise<Either<Failure, WorkshopStayEntity>> {
  try {
    // 1. Validar input
    const validation = createWorkshopStaySchema.safeParse(input)
    if (!validation.success) {
      return {
        ok: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: validation.error.issues[0]?.message || 'Error de validación' 
        }
      }
    }

    // 2. Crear estancia
    const stay = await repository.create(validation.data)
    
    return { ok: true, data: stay }
  } catch (error: unknown) {
    const err = error as Error
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: err.message || 'Error inesperado al crear la estancia' }
    }
  }
}
