/**
 * @fileoverview Entidades de dominio para el módulo de Flotilla.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

/**
 * Estado operativo de un vehículo o componente.
 */
export type vehicleStatus = 'available' | 'in_trip' | 'maintenance' | 'out_service'

/**
 * Estado operativo de un viaje.
 */
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Representa un Tractocamión (Truck).
 */
export interface TruckEntity {
  id: string
  economicNumber: string
  brand: string
  model: string
  year: number
  plates: string
  serialNumber: string
  insurancePolicy: string
  companyProfileId: string
  status: vehicleStatus
  createdAt: Date
  updatedAt: Date
  engine?: string
  tireSize?: string
  tankCapacity?: number
  theoreticalYield?: number
}

/**
 * Representa un Modelo de Remolque.
 */
export interface TrailerModelEntity {
  id: string
  name: string
  brand?: string | null
  provider?: string | null
  capacityKg?: number | null
  size?: string | null
  cargoType?: string | null
  acquisitionYear?: number | null
  categoryId?: string | null
  description?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Representa un Remolque (Trailer).
 */
export interface TrailerEntity {
  id: string
  economicNumber: string
  plates?: string | null
  serialNumber?: string | null
  insurancePolicy?: string | null
  companyProfileId?: string | null
  trailerModelId?: string | null
  status: vehicleStatus
  createdAt: Date
  updatedAt: Date
  sizeFt?: number | null
  continuousRefrigeratedYield?: number | null
  continuousFrozenYield?: number | null
  ssRefrigeratedYield?: number | null
  ssFrozenYield?: number | null

  // Join properties (opcionales)
  trailerModelName?: string
  companyProfileLegalName?: string
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
  status: TripStatus
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
  truck: TruckEntity
  trailer: TrailerEntity
  operator: OperatorEntity
  clientId?: string
  clientName?: string
  isActive: boolean
  createdAt: Date
}
