import { describe, expect, it } from 'vitest'
import { isLogisticsAllowedClientName, isWalmartClientName, normalizeClientName } from '@/src/features/trips/domain/rules/client-access'

describe('client-access', () => {
  it('normaliza nombres', () => {
    expect(normalizeClientName('  Holcim  ')).toBe('holcim')
    expect(normalizeClientName(null)).toBe('')
  })

  it('detecta Walmart', () => {
    expect(isWalmartClientName('Walmart')).toBe(true)
    expect(isWalmartClientName('WALMART México')).toBe(true)
    expect(isWalmartClientName('Holcim')).toBe(false)
  })

  it('detecta clientes permitidos de logística', () => {
    expect(isLogisticsAllowedClientName('Holcim')).toBe(true)
    expect(isLogisticsAllowedClientName('Solinmar')).toBe(true)
    expect(isLogisticsAllowedClientName('ALTOPETRUM SA DE CV')).toBe(true)
    expect(isLogisticsAllowedClientName('Barita')).toBe(false)
    expect(isLogisticsAllowedClientName('Walmart')).toBe(false)
  })
})

