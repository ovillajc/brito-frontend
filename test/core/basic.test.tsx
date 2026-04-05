import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import React from 'react'

test('Vitest and Testing Library are configured correctly', () => {
  render(<h1>Vitest is working!</h1>)
  const element = screen.getByText(/vitest is working!/i)
  expect(element).toBeDefined()
  expect(element.tagName).toBe('H1')
})
