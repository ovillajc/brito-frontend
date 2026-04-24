import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ContactFormSection } from '@/src/features/landing/presentation/components/organisms/ContactFormSection'
import { useSubmitLead } from '@/src/features/landing/presentation/hooks/use-submit-lead'

// Mock del hook de presentación
vi.mock('@/src/features/landing/presentation/hooks/use-submit-lead', () => ({
  useSubmitLead: vi.fn(),
}))

describe('ContactFormSection Component', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSubmitLead).mockReturnValue({
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: false,
      error: null,
    })
  })

  it('debe renderizar todos los campos del formulario', () => {
    render(<ContactFormSection />)
    
    expect(screen.getByLabelText(/nombre completo/i)).toBeDefined()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeDefined()
    expect(screen.getByLabelText(/teléfono/i)).toBeDefined()
    expect(screen.getByLabelText(/empresa/i)).toBeDefined()
    expect(screen.getByLabelText(/mensaje/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeDefined()
  })

  it('debe mostrar errores de validación si los campos están vacíos', async () => {
    render(<ContactFormSection />)
    
    const submitButton = screen.getByRole('button', { name: /enviar solicitud/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeDefined()
      expect(screen.getByText(/dirección de correo electrónico no válida/i)).toBeDefined()
    })
  })

  it('debe llamar a submit con los datos correctos', async () => {
    render(<ContactFormSection />)
    
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Juan Perez' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'juan@example.com' } })
    fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '1234567890' } })
    fireEvent.change(screen.getByLabelText(/empresa/i), { target: { value: 'Brito Test' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Hola, me interesa.' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar solicitud/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '1234567890',
        company: 'Brito Test',
        message: 'Hola, me interesa.',
      })
    })
  })

  it('debe mostrar mensaje de éxito cuando isSuccess es true', () => {
    vi.mocked(useSubmitLead).mockReturnValue({
      submit: mockSubmit,
      isSubmitting: false,
      isSuccess: true,
      error: null,
    })

    render(<ContactFormSection />)
    
    expect(screen.getByText(/¡mensaje enviado!/i)).toBeDefined()
  })
})
