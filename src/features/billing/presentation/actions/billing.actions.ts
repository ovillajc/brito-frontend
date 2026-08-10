'use server'

/**
 * @fileoverview Server Actions para el módulo de Facturación.
 * Reutiliza trips y los enriquece con datos de billing (client_specific_data).
 */

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { getTripsAction } from '@/src/features/trips/presentation/actions/trips.actions'
import type { BillingRecord, BillingPayload, BillingStatus } from '@/src/features/billing/domain/entities/billing-entity'
import { getClientsAction } from '@/src/features/clients/presentation/actions/client.actions'

function extractBillingPayload(clientSpecificData: Record<string, unknown> | null): {
  billingStatus: BillingStatus
  invoiceFolio: string | null
  invoiceDate: Date | null
  invoiceUUID: string | null
  invoiceNotes: string | null
} {
  const raw = clientSpecificData?.billing as BillingPayload | undefined
  return {
    billingStatus: (raw?.billing_status as BillingStatus) ?? 'pending',
    invoiceFolio: raw?.invoice_folio ?? null,
    invoiceDate: raw?.invoice_date ? new Date(raw.invoice_date) : null,
    invoiceUUID: raw?.invoice_uuid ?? null,
    invoiceNotes: raw?.invoice_notes ?? null,
  }
}

/** Obtiene todos los viajes completados mapeados como BillingRecords. */
export async function getBillingRecordsAction(filters?: {
  clientId?: string
  from?: Date
  to?: Date
  status?: BillingStatus
}): Promise<Either<Failure, BillingRecord[]>> {
  try {
    // Obtener viajes completados
    const tripsResult = await getTripsAction({
      status: 'completed',
      clientId: filters?.clientId,
      from: filters?.from,
      to: filters?.to,
    })

    if (!tripsResult.ok) return tripsResult

    // Obtener clientes para enriquecer con RFC y régimen fiscal
    const clientsResult = await getClientsAction()
    const clientsMap: Record<string, { rfc: string | null; taxRegime: string | null; taxDomicile: string | null }> = {}
    if (clientsResult.ok) {
      for (const c of clientsResult.data) {
        clientsMap[c.id] = { rfc: c.rfc ?? null, taxRegime: c.taxRegime ?? null, taxDomicile: c.taxDomicile ?? null }
      }
    }

    const records: BillingRecord[] = tripsResult.data.map((t) => {
      const billing = extractBillingPayload(t.trip.clientSpecificData)
      const clientData = t.trip.clientId ? (clientsMap[t.trip.clientId] ?? null) : null

      return {
        tripId: t.trip.id,
        folio: t.trip.folio,
        tripNumber: t.trip.tripNumber,
        tripNumberClient: t.trip.tripNumberClient,
        clientId: t.trip.clientId,
        clientName: t.clientName,
        clientRfc: clientData?.rfc ?? null,
        clientTaxRegime: clientData?.taxRegime ?? null,
        clientTaxDomicile: clientData?.taxDomicile ?? null,
        companyProfileId: t.trip.companyProfileId,
        origin: t.trip.origin,
        destination: t.trip.destination,
        departureDate: t.trip.departureDate,
        arrivalDateActual: t.trip.arrivalDateActual,
        unitEconomicNumber: t.unitEconomicNumber,
        operatorName: t.operatorName,
        truckPlates: t.truckPlates,
        truckYear: t.truckYear,
        truckBrand: t.truckBrand,
        truckModel: t.truckModel,
        truckInsurancePolicy: t.truckInsurancePolicy,
        trailerPlates: t.trailerPlates,
        trailerEconomicNumber: t.trailerEconomicNumber,
        operatorRfc: t.operatorRfc,
        operatorLicenseNumber: t.operatorLicenseNumber,
        totalIncome: t.trip.totalIncome,
        preinvoiceKm: t.trip.preinvoiceKm,
        ...billing,
      }
    })

    // Filtrar por billing status si se especificó
    const filtered = filters?.status
      ? records.filter((r) => r.billingStatus === filters.status)
      : records

    return { ok: true, data: filtered }
  } catch (e) {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener registros de facturación' } }
  }
}

export interface UpdateBillingStatusInput {
  tripId: string
  billingStatus: BillingStatus
  invoiceFolio?: string | null
  invoiceDate?: Date | null
  invoiceUUID?: string | null
  invoiceNotes?: string | null
}

/** Actualiza el estado de facturación de un viaje (via client_specific_data). */
export async function updateBillingStatusAction(
  input: UpdateBillingStatusInput
): Promise<Either<Failure, void>> {
  try {
    const supabase = await createClient()

    // Obtener datos actuales para no pisar los existentes
    const { data: existing, error: fetchError } = await supabase
      .from('trips')
      .select('client_specific_data')
      .eq('id', input.tripId)
      .single()

    if (fetchError) {
      return { ok: false, error: { code: 'DB_ERROR', message: fetchError.message } }
    }

    const current = (existing?.client_specific_data ?? {}) as Record<string, unknown>
    const billingPayload: BillingPayload = {
      billing_status: input.billingStatus,
      invoice_folio: input.invoiceFolio ?? null,
      invoice_date: input.invoiceDate?.toISOString() ?? null,
      invoice_uuid: input.invoiceUUID ?? null,
      invoice_notes: input.invoiceNotes ?? null,
    }

    const { error: updateError } = await supabase
      .from('trips')
      .update({ client_specific_data: { ...current, billing: billingPayload } })
      .eq('id', input.tripId)

    if (updateError) {
      return { ok: false, error: { code: 'DB_ERROR', message: updateError.message } }
    }

    revalidatePath('/billing')
    return { ok: true, data: undefined }
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar estado de factura' } }
  }
}
