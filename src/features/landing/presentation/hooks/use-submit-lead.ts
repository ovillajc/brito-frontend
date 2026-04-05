/**
 * @fileoverview Hook para manejar la lógica de envío de formularios en la landing.
 * Sigue las reglas de Clean Architecture: Capa de Presentación (Hooks).
 */

import { useState } from 'react'
import type { ContactFormInput } from '../../domain/schemas/contact-form.schema'
import { SubmitLeadUseCase } from '../../application/use-cases/SubmitLead'
import type { ILeadRepository } from '../../domain/repositories/i-lead-repository'
import type { Either, Failure } from '@/src/core/domain/either'
import type { Lead } from '../../domain/entities/lead'

/**
 * Repositorio mockup temporal para desarrollo local sin Supabase.
 */
const InMemoryLeadRepository: ILeadRepository = {
  create: async (lead: Lead): Promise<Either<Failure, Lead>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          data: { ...lead, id: Math.random().toString(), createdAt: new Date().toISOString() }
        })
      }, 1500)
    })
  }
}

/**
 * Hook para procesar el envío de leads.
 */
export const useSubmitLead = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const submit = async (data: ContactFormInput) => {
    setIsSubmitting(true)
    setError(null)
    setIsSuccess(false)

    try {
      const result = await SubmitLeadUseCase(InMemoryLeadRepository, data)

      if (!result.ok) {
        setError(result.error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError('Error inesperado al enviar el mensaje.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submit, isSubmitting, error, isSuccess }
}
