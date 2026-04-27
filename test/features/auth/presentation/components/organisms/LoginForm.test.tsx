import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
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
  type MockField = {
    name: string
    value: string
    onChange: (value: unknown) => void
    onBlur: () => void
    ref: (instance: unknown) => void
  }

  type FormFieldRender = (args: { field: MockField }) => React.ReactNode

  return {
    Form: ({ children }: { children: React.ReactNode }) => <div data-testid="hook-form-mock">{children}</div>,
    FormField: ({ render }: { render: FormFieldRender }) => {
      // Mock the field and pass explicitly so inputs render natively for our test assertions
      const field: MockField = {
        name: 'mock',
        value: '',
        onChange: vi.fn<(value: unknown) => void>(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      }
      return render({ field })
    },
    FormItem: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    FormLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
      <label htmlFor={htmlFor}>{children}</label>
    ),
    FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    FormMessage: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  }
})

describe('LoginForm Component', () => {
  const mockHandleLogin = vi.fn((e: React.FormEvent) => {
    e.preventDefault()
  })
  
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useLogin).mockReturnValue({
      form: {
        handleSubmit: () => mockHandleLogin,
        control: {},
        formState: {},
      } as unknown,
      handleLogin: mockHandleLogin,
      onProviderLogin: vi.fn(),
      isLoading: false,
    } as unknown as ReturnType<typeof useLogin>)
  })

  it('debe renderizar el formulario base', () => {
    render(<LoginForm />)
    expect(screen.getByText(/Correo corporativo/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeDefined()
  })

  it('debe renderizar los campos principales (Email y Contraseña)', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText(/usuario@transportesbrito.com/i)).toBeDefined()
    expect(screen.getByPlaceholderText(/ingresa tu contraseña/i)).toBeDefined()
  })

  it('debe permitir cambiar la visibilidad de la contraseña', () => {
    render(<LoginForm />)
    const passwordInput = screen.getByPlaceholderText(/ingresa tu contraseña/i) as HTMLInputElement
    expect(passwordInput.type).toBe('password')

    const buttonEye = screen.getByRole('button', { name: /mostrar contraseña/i })
    fireEvent.click(buttonEye)
    
    expect(passwordInput.type).toBe('text')
  })

  it('debe mostrar el botón deshabilitado cuando isLoading es true', () => {
    vi.mocked(useLogin).mockReturnValueOnce({
      form: {
        handleSubmit: () => mockHandleLogin,
        control: {},
        formState: {},
      } as unknown,
      handleLogin: mockHandleLogin,
      onProviderLogin: vi.fn(),
      isLoading: true,
    } as unknown as ReturnType<typeof useLogin>)

    render(<LoginForm />)
    const btn = screen.getByRole('button', { name: /verificando/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
