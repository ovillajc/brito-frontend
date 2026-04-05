import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoginLeftPanel } from '@/src/features/auth/presentation/components/organisms/LoginLeftPanel'

describe('LoginLeftPanel Component', () => {
  it('debe renderizar el contenido estático correctamente', () => {
    render(<LoginLeftPanel />)

    // Evaluar los copys del overlay editorial
    expect(screen.getByText(/Logística 4.0/i)).toBeDefined()
    expect(screen.getByText(/Precisión en/i)).toBeDefined()
    expect(screen.getByText(/cada kilómetro./i)).toBeDefined()
    
    // Evaluar el tag de imagen para accesibilidad
    const imgElement = screen.getByAltText(/Modern semi-truck on highway/i)
    expect(imgElement).toBeDefined()
  })
})
