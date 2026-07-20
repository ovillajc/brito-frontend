/**
 * @fileoverview Entidades de dominio para el módulo de Facturación.
 * Se derivan de TripWithRelations enriqueciéndolas con datos de billing.
 */

export type BillingStatus = 'pending' | 'invoiced' | 'cancelled'

export interface BillingRecord {
  tripId: string
  folio: string | null
  tripNumber: number | null
  tripNumberClient: number | null

  // Partes
  clientId: string | null
  clientName: string | null
  clientRfc: string | null
  clientTaxRegime: string | null
  clientTaxDomicile: string | null

  companyProfileId: string | null

  // Ruta
  origin: string | null
  destination: string | null
  departureDate: Date | null
  arrivalDateActual: Date | null

  // Unidad
  unitEconomicNumber: string | null
  operatorName: string | null

  // Tracto (Carta Porte)
  truckPlates: string | null
  truckYear: number | null
  truckBrand: string | null
  truckModel: string | null
  truckInsurancePolicy: string | null

  // Remolque (Carta Porte)
  trailerPlates: string | null
  trailerEconomicNumber: string | null

  // Operador (Carta Porte)
  operatorRfc: string | null
  operatorLicenseNumber: string | null

  // Monto
  totalIncome: number
  preinvoiceKm: number | null

  // Estado de factura (almacenado en client_specific_data)
  billingStatus: BillingStatus
  invoiceFolio: string | null
  invoiceDate: Date | null
  invoiceUUID: string | null
  invoiceNotes: string | null
}

export interface BillingKpis {
  totalInvoiced: number
  totalPending: number
  totalCancelled: number
  countInvoiced: number
  countPending: number
  countCancelled: number
}

/** Shape del billing payload guardado en client_specific_data */
export interface BillingPayload {
  billing_status: BillingStatus
  invoice_folio: string | null
  invoice_date: string | null
  invoice_uuid: string | null
  invoice_notes: string | null
}
