import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSubmitLead } from '@/src/features/landing/presentation/hooks/use-submit-lead'
import { SubmitLeadUseCase } from '@/src/features/landing/application/use-cases/SubmitLead'

// Mock del Caso de Uso
vi.mock('@/src/features/landing/application/use-cases/SubmitLead', () => ({
  SubmitLeadUseCase: vi.fn(),
}))

describe('useSubmitLead Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe iniciar con estado idle', () => {
    const { result } = renderHook(() => useSubmitLead())
    
    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('debe manejar el envío exitoso', async () => {
    // Simulamos éxito
    vi.mocked(SubmitLeadUseCase).mockResolvedValue({
      ok: true,
      data: { id: '1', name: 'Test', email: 'test@test.com', message: 'hola', createdAt: '2024-01-01' }
    })

    const { result } = renderHook(() => useSubmitLead())

    await act(async () => {
      await result.current.submit({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Co',
        message: 'Hello'
      })
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('debe manejar errores del caso de uso', async () => {
    // Simulamos error de dominio
    vi.mocked(SubmitLeadUseCase).mockResolvedValue({
      ok: false,
      error: { code: 'ERROR', message: 'Error de validación' }
    })

    const { result } = renderHook(() => useSubmitLead())

    await act(async () => {
      await result.current.submit({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Co',
        message: 'Hello'
      })
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.error).toBe('Error de validación')
  })

  it('debe manejar excepciones inesperadas', async () => {
    // Simulamos una excepción (throw)
    vi.mocked(SubmitLeadUseCase).mockRejectedValue(new Error('Fatal'))

    const { result } = renderHook(() => useSubmitLead())

    await act(async () => {
      await result.current.submit({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        company: 'Test Co',
        message: 'Hello'
      })
    })

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.error).toBe('Error inesperado al enviar el mensaje.')
  })
})
