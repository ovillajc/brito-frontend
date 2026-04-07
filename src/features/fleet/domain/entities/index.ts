/**
 * @fileoverview Entidades de dominio para el módulo de Flotilla.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

/**
 * Estado operativo de un vehículo o componente.
 */
export type FleetStatus = 'available' | 'maintenance' | 'active' | 'inactive' | 'on_trip' | 'on_leave'

/**
 * Representa un Tractocamión.
 */
export interface TractorEntity {
  id: string
  brand: string
  model: string
  year?: number
  plates: string
  vin: string // Número de serie
  insurancePolicy?: string
  insuranceExpiration?: Date
  status: FleetStatus
  lastMaintenance?: Date
  odometer?: number
}

/**
 * Representa un Remolque (Trailer).
 */
export interface TrailerEntity {
  id: string
  type: string // e.g. 'Dry Van', 'Reefer'
  brand: string
  model: string
  plates: string
  economicNumber: string
  insurancePolicy?: string
  status: FleetStatus
}

/**
 * Representa un Operador.
 */
export interface OperatorEntity {
  id: string
  firstName: string
  lastName: string
  licenseNumber: string
  licenseType: string
  licenseExpiration: Date
  rfc?: string
  nss?: string // Opcional pero guardable
  curp?: string
  address?: string
  phone?: string
  bloodType?: string
  fastrackId?: string
  status: FleetStatus
}

/**
 * Representa un Cliente.
 */
export interface ClientEntity {
  id: string
  name: string
  type: 'internal' | 'external'
}

/**
 * Representa un documento digital asociado a una entidad.
 */
export interface FleetDocument {
  id: string
  title: string
  type: string // 'invoice', 'license', 'insurance', etc.
  filePath: string
  expirationDate?: Date
  createdAt: Date
}

/**
 * Representa la combinación (armado) de una unidad operativa.
 */
export interface UnitAssemblyEntity {
  id: string
  tractor: TractorEntity
  trailer: TrailerEntity
  operator: OperatorEntity
  clientId?: string
  clientName?: string
  isActive: boolean
  createdAt: Date
}
