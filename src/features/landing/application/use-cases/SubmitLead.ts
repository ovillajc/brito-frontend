/**
 * @fileoverview Caso de Uso para el envío de leads desde la Landing Page.
 * Sigue las reglas de Clean Architecture: Capa de Aplicación.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { Lead } from '../../domain/entities/lead'
import type { ILeadRepository } from '../../domain/repositories/i-lead-repository'
import { contactFormSchema, type ContactFormInput } from '../../domain/schemas/contact-form.schema'

/**
 * Registra un nuevo lead en el sistema.
 * Valida los datos antes de llamar al repositorio.
 * 
 * @param leadRepository - Implementación inyectada (DI) de ILeadRepository.
 * @param input - Datos captados en el formulario de la landing page.
 * @returns El lead creado o un fallo en la operación.
 */
export async function SubmitLeadUseCase(
  leadRepository: ILeadRepository,
  input: ContactFormInput
): Promise<Either<Failure, Lead>> {
  try {
    // 1. Validar el input (Capa de Dominio)
    const validationResult = contactFormSchema.safeParse(input)
    
    if (!validationResult.success) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Los datos del formulario son inválidos',
        },
      }
    }

    // 2. Ejecutar la persistencia (Capa de Infraestructura via DI)
    const leadToCreate: Lead = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      message: input.message,
    }

    const result = await leadRepository.create(leadToCreate)

    if (!result.ok) {
      return result // Propagar el error del repositorio
    }

    return { ok: true, data: result.data }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Ocurrió un error inesperado al procesar tu solicitud',
      },
    }
  }
}
