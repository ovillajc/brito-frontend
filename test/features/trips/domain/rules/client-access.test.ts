import { describe, expect, it } from 'vitest'
import { canManageTripsForClient, isLogisticsAllowedClientName, isWalmartClientName, normalizeClientName } from '@/src/features/trips/domain/rules/client-access'

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

  it('resuelve permisos de gestión por cliente', () => {
    expect(canManageTripsForClient({ clientName: 'Walmart', canManageAll: false, canManageWalmart: true, canManageLogistics: false })).toBe(true)
    expect(canManageTripsForClient({ clientName: 'Walmart', canManageAll: false, canManageWalmart: false, canManageLogistics: true })).toBe(false)
    expect(canManageTripsForClient({ clientName: 'Holcim', canManageAll: false, canManageWalmart: true, canManageLogistics: false })).toBe(false)
    expect(canManageTripsForClient({ clientName: 'Holcim', canManageAll: false, canManageWalmart: false, canManageLogistics: true })).toBe(true)
    expect(canManageTripsForClient({ clientName: 'Cliente X', canManageAll: false, canManageWalmart: true, canManageLogistics: true })).toBe(false)
    expect(canManageTripsForClient({ clientName: 'Cliente X', canManageAll: true, canManageWalmart: false, canManageLogistics: false })).toBe(true)
  })
})
