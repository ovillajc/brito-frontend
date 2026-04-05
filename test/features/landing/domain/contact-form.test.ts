import { describe, expect, it } from 'vitest'
import { contactFormSchema } from '@/src/features/landing/domain/schemas/contact-form.schema'

describe('contactFormSchema', () => {
  it('debería validar correctamente un input válido', () => {
    const input = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      company: 'Logística Brito',
      message: 'Este es un mensaje de prueba con más de diez caracteres.',
    }

    const result = contactFormSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('debería ser válido sin el campo empresa (opcional)', () => {
    const input = {
      name: 'Maria G.',
      email: 'maria@test.com',
      message: 'Me interesa saber más sobre la barita.',
    }

    const result = contactFormSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('debería fallar si el email es inválido', () => {
    const input = {
      name: 'Test',
      email: 'email-invalido',
      message: 'Mensaje de prueba largo.',
    }

    const result = contactFormSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('debería fallar si el mensaje es demasiado corto', () => {
    const input = {
      name: 'Test',
      email: 'test@test.com',
      message: 'Corto',
    }

    const result = contactFormSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
