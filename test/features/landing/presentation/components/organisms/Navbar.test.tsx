import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Navbar } from '@/src/features/landing/presentation/components/organisms/Navbar'

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset scroll position before each test
    window.scrollY = 0
    vi.clearAllMocks()
  })

  it('debe renderizar el logo y los enlaces de navegación', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: /Transportes\s*Brito/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /servicios/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /contacto/i })).toBeDefined()
  })

  it('debe cambiar el estilo al hacer scroll', () => {
    const { container } = render(<Navbar />)
    const nav = container.querySelector('nav')
    
    // Al inicio no debe tener sombra ni fondo sólido
    expect(nav?.className).toContain('bg-transparent')
    expect(nav?.className).not.toContain('shadow-md')

    // Simulamos scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } })
    
    // Nota: El componente usa un event listener de scroll que actualiza el estado.
    // React Testing Library debería capturar el re-renderizado si disparamos el evento correctamente.
    
    // Forzamos el valor de scrollY y disparamos el evento
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
    fireEvent.scroll(window)

    // El componente Navbar usa window.scrollY dentro del useEffect
    // Tras el scroll, debería tener bg-white/90 y shadow-md
    expect(nav?.className).toContain('bg-white/95')
    expect(nav?.className).toContain('shadow-sm')
  })

  it('debe navegar a las secciones correctas (IDs)', () => {
    render(<Navbar />)
    
    const serviciosLink = screen.getByText(/servicios/i).closest('a')
    const contactoLink = screen.getByText(/contacto/i).closest('a')

    expect(serviciosLink?.getAttribute('href')).toBe('#servicios')
    expect(contactoLink?.getAttribute('href')).toBe('#contacto')
  })
})
