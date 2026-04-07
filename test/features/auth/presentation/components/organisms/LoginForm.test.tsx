import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/src/features/auth/presentation/components/organisms/LoginForm'
import { useLogin } from '@/src/features/auth/presentation/hooks/use-login'

// Simular next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Simular el componente Next.js Link
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/src/features/auth/presentation/hooks/use-login', () => ({
  useLogin: vi.fn(),
}))

// Simular Form fields elements de la UI para evitar problemas complejos con el Provider
vi.mock('@/src/core/presentation/components/ui/form', () => {
  return {
    Form: ({ children }: any) => <div data-testid="hook-form-mock">{children}</div>,
    FormField: ({ render }: any) => {
      // Mock the field and pass explicitly so inputs render natively for our test assertions
      const field = {
        name: 'mock',
        value: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      }
      return render({ field })
    },
    FormItem: ({ children, className }: any) => <div className={className}>{children}</div>,
    FormLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    FormMessage: ({ children }: any) => <span>{children}</span>,
  }
})

describe('LoginForm Component', () => {
  const mockHandleLogin = vi.fn((e) => {
    e.preventDefault();
  })
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLogin).mockReturnValue({
      form: {
        handleSubmit: () => mockHandleLogin,
        control: {},
        formState: {},
      } as any,
      handleLogin: mockHandleLogin as any,
      onProviderLogin: vi.fn(),
      isLoading: false,
    })
  })

  it('debe renderizar el título de bienvenida', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Acceso a plataforma/i)).toBeDefined()
  })

  it('debe renderizar los campos principales (Email y Contraseña)', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText(/nombre@transportesbrito.com/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeDefined()
  })

  it('debe permitir cambiar la visibilidad de la contraseña', () => {
    render(<LoginForm />)
    const passwordInput = screen.getByPlaceholderText(/••••••••/i) as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    const buttonEye = screen.getByRole('button', { name: /visibility/i })
    fireEvent.click(buttonEye)
    
    expect(passwordInput.type).toBe('text')
  })

  it('debe mostrar el botón deshabilitado cuando isLoading es true', () => {
    vi.mocked(useLogin).mockReturnValueOnce({
      form: {
        handleSubmit: () => mockHandleLogin,
        control: {},
        formState: {},
      } as any,
      handleLogin: mockHandleLogin as any,
      onProviderLogin: vi.fn(),
      isLoading: true,
    })

    render(<LoginForm />)
    const btn = screen.getByRole('button', { name: /Iniciando Sesión/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
