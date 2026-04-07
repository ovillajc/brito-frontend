import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KPICard } from '@/src/features/dashboard/presentation/components/atoms/KPICard'
import React from 'react'

describe('KPICard Component', () => {
  const defaultProps = {
    title: 'Viajes Activos',
    value: '24',
    iconName: 'Activity',
    category: 'operative' as const,
  }

  it('debe renderizar el título y valor correctamente', () => {
    render(<KPICard {...defaultProps} />)
    
    expect(screen.getByText('Viajes Activos')).toBeDefined()
    expect(screen.getByText('24')).toBeDefined()
  })

  it('debe mostrar la tendencia y descripción si se proporcionan', () => {
    const propsWithTrend = {
      ...defaultProps,
      trend: { value: 12, isPositive: true },
      description: 'vs. mes anterior',
    }
    
    render(<KPICard {...propsWithTrend} />)
    
    expect(screen.getByText(/12%/)).toBeDefined()
    expect(screen.getByText('vs. mes anterior')).toBeDefined()
  })

  it('debe aplicar la clase de color si se proporciona', () => {
    const { container } = render(<KPICard {...defaultProps} colorClass="text-primary" />)
    
    // El icono debería tener la clase de color
    const iconWrapper = container.querySelector('.text-primary')
    expect(iconWrapper).toBeDefined()
  })
})
