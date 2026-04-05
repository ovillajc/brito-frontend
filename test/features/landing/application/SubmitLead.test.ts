import { describe, expect, it, vi } from 'vitest'
import { SubmitLeadUseCase } from '@/src/features/landing/application/use-cases/SubmitLead'
import type { ILeadRepository } from '@/src/features/landing/domain/repositories/i-lead-repository'

describe('SubmitLeadUseCase', () => {
  const mockRepo: ILeadRepository = {
    create: vi.fn(),
  }

  it('debería registrar un lead correctamente cuando el input es válido', async () => {
    const input = {
      name: 'Cliente Potencial',
      email: 'lead@empresa.com',
      company: 'Holcim',
      message: 'Me gustaría una cotización para transporte de barita.',
    }

    vi.mocked(mockRepo.create).mockResolvedValue({
      ok: true,
      data: { ...input, id: '123', createdAt: new Date().toISOString() },
    })

    const result = await SubmitLeadUseCase(mockRepo, input)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe(input.name)
      expect(mockRepo.create).toHaveBeenCalled()
    }
  })

  it('debería retornar un fallo si la validación falla', async () => {
    const input = {
      name: 'A', // Demasiado corto
      email: 'no-email',
      message: 'Corto',
    }

    const result = await SubmitLeadUseCase(mockRepo, input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
  })

  it('debería propagar errores del repositorio', async () => {
    const input = {
      name: 'Valid Name',
      email: 'valid@email.com',
      message: 'Mensaje lo suficientemente largo para pasar validación.',
    }

    vi.mocked(mockRepo.create).mockResolvedValue({
      ok: false,
      error: { code: 'DB_ERROR', message: 'Error de base de datos' },
    })

    const result = await SubmitLeadUseCase(mockRepo, input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('DB_ERROR')
    }
  })
})
