/**
 * @fileoverview Entidades de dominio para el módulo de Flotilla.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

/**
 * Estado operativo de un vehículo o componente.
 */
export type vehicleStatus = 'available' | 'maintenance' | 'assigned' | 'out_service' | 'in_trip'


/**
 * Estado operativo de un viaje.
 */
export type TripStatus = 'scheduled' | 'in_progress' | 'in_delivery' | 'completed' | 'cancelled'

/**
 * Estado operativo de una Unidad Armada (Unit Assembly).
 */
export type UnitStatus = 'returning' | 'at_base' | 'at_client' | 'in_trip' | 'in_workshop'


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
  vehicleType: 'TRUCK' | 'TORTON'
  sizeFt?: number
  capacityKg?: number
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
  status: vehicleStatus
}

/**
 * Representa un Cliente.
 */
export interface ClientEntity {
  id: string
  tradeName?: string | null
  companyName?: string | null
  taxRegime?: string | null
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
 * Refleja la tabla `unit_assemblies` de la base de datos.
 */
export interface UnitAssemblyEntity {
  id: string
  name: string
  economicNumber: string
  description?: string | null

  // Foreign keys
  employeeId: string
  truckId: string
  trailerId?: string | null
  trailer2Id?: string | null
  clientId?: string | null
  clientPoolId?: string | null
  companyProfileId?: string | null

  isActive: boolean
  status: UnitStatus
  theoreticalYield?: number
  poolRole?: 'titular' | 'sustituta'
  substitutesUnitId?: string | null
  createdAt: Date
  updatedAt: Date


  // Join properties for display (optional)
  employeeName?: string
  truckEconomicNumber?: string
  truckPlates?: string
  trailerEconomicNumber?: string
  trailerPlates?: string
  trailer2EconomicNumber?: string
  trailer2Plates?: string
  clientName?: string
  companyProfileLegalName?: string
  substituteEconomicNumber?: string
  substitutePlates?: string
}

export type UnitAssemblyLogAction = 'CREATED' | 'UPDATED' | 'TRAILER_DETACHED'

export interface UnitAssemblyLogEntity {
  id: string
  unitAssemblyId: string
  employeeId?: string | null
  truckId?: string | null
  trailerId?: string | null
  trailer2Id?: string | null
  profileId?: string | null
  action: UnitAssemblyLogAction
  createdAt: Date

  // Display fields for UI
  employeeName?: string
  truckEconomicNumber?: string
  trailerEconomicNumber?: string
  trailer2EconomicNumber?: string
  profileName?: string
}

/**
 * Representa un Pool de Clientes para agrupar unidades armadas.
 */
export interface ClientPoolEntity {
  id: string
  name: string
  clientId: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  
  // Datos opcionales del join
  clientTradeName?: string
  clientCompanyName?: string
  unitsCount?: number
}
