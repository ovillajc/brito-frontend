/**
 * @fileoverview Entidades de dominio del módulo Trips.
 * Reflejan la tabla public.trips y los datos mínimos requeridos por la UI.
 */

export type TripStatus =
  | 'scheduled'
  | 'in_progress'
  | 'in_delivery'
  | 'completed'
  | 'cancelled'



export interface TripEntity {
  id: string
  folio: string | null
  tripNumber: number | null
  clientId: string | null
  companyProfileId: string | null
  unitAssemblyId: string | null

  origin: string | null
  destination: string | null
  departureDate: Date | null
  actualDepartureDate: Date | null
  arrivalDateActual: Date | null
  status: TripStatus

  monitoredBy: string | null
  fuelLoadDate: Date | null
  tripNumberClient: number | null
  lastScan: Date | null
  observations: string | null

  clientSpecificData: Record<string, unknown> | null

  createdAt: Date
  updatedAt: Date
}

export interface TripWithRelations {
  trip: TripEntity
  clientName: string | null
  unitEconomicNumber: string | null
  operatorName: string | null
  isFullAssembly: boolean
  walmartData?: {
    coordinatorName: string | null
    route: string | null
    cargoType: string | null
    cartaPorteWalmart: string | null
    numStores: number | null
    statusWalmart: string | null
    strNumLoad: string | null
    strComplementCartaPorte: string | null
    strPreinvoiceKm: number | null
    strKmTraveled: number | null
    strDiesel: number | null
    strCasetas: number | null
    strTotalInvoice: number | null
    dhdNumLoad: string | null
    dhdComplementCartaPorte: string | null
    dhdPreinvoiceKm: number | null
    dhdKmTraveled: number | null
    dhdDiesel: number | null
    dhdCasetas: number | null
    dhdTotalInvoice: number | null
    dettesLog: unknown
    departureTemperature: string | null
    departureTime: string | null
    incidencias: string | null
  } | null
}
