import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoginLeftPanel } from '@/src/features/auth/presentation/components/organisms/LoginLeftPanel'

describe('LoginLeftPanel Component', () => {
  it('debe renderizar el contenido estático correctamente', () => {
    render(<LoginLeftPanel />)

    // Evaluar los copys del overlay editorial
    expect(screen.getByText(/Transportes Brito/i)).toBeDefined()
    expect(screen.getByText(/La plataforma que impulsa tus operaciones logísticas/i)).toBeDefined()
    expect(screen.getByText(/Monitoreo en tiempo real para optimizar/i)).toBeDefined()
    
    // Evaluar el tag de imagen para accesibilidad
    const imgElement = screen.getByAltText(/Modern logistics truck on a highway/i)
    expect(imgElement).toBeDefined()
  })
})
