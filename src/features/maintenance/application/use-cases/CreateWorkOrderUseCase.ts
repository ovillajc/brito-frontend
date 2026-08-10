import type { Either, Failure } from '../../../../core/domain/either'
import type { WorkshopWorkOrderEntity } from '../../domain/entities/entities'
import type { IWorkshopWorkOrderRepository } from '../../domain/repositories/repositories'
import { createWorkOrderSchema, type CreateWorkOrderInput } from '../../domain/schemas/schemas'

/**
 * @fileoverview Caso de uso para registrar una nueva orden de trabajo.
 */

export async function CreateWorkOrderUseCase(
  repository: IWorkshopWorkOrderRepository,
  input: CreateWorkOrderInput
): Promise<Either<Failure, WorkshopWorkOrderEntity>> {
  try {
    const validation = createWorkOrderSchema.safeParse(input)
    if (!validation.success) {
      return {
        ok: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: validation.error.issues[0]?.message || 'Error de validación' 
        }
      }
    }

    const order = await repository.create(validation.data)
    
    return { ok: true, data: order }
  } catch (error: unknown) {
    const err = error as Error
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: err.message || 'Error inesperado al crear la orden de trabajo' }
    }
  }
}
