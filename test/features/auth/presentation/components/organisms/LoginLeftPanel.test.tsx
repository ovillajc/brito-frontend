import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoginLeftPanel } from '@/src/features/auth/presentation/components/organisms/LoginLeftPanel'

describe('LoginLeftPanel Component', () => {
  it('debe renderizar el contenido estático correctamente', () => {
    render(<LoginLeftPanel />)

    // Evaluar los copys del overlay editorial
    expect(screen.getByRole('link', { name: /Transportes\s*Brito/i, hidden: true })).toBeDefined()
    expect(screen.getByRole('heading', { name: /La plataforma que impulsa/i, hidden: true })).toBeDefined()
    expect(screen.getByText(/Monitoreo en tiempo real/i)).toBeDefined()
    
    // Evaluar el tag de imagen para accesibilidad
    const imgElement = screen.getByAltText(/Modern logistics truck on a highway/i)
    expect(imgElement).toBeDefined()
  })
})
