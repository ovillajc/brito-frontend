import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { TripsTableRowEntity } from '../components/organisms/TripsTable'

export function formatDateForExport(value: Date | string | null | undefined) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  
  return `${d}/${m}/${y} ${h}:${min}:${s}`
}

export function serializeForExport(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function humanizeExportKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase())
}

export function formatValueForExport(value: unknown, indent = ''): string {
  if (value == null) return ''
  if (typeof value !== 'object') return String(value)

  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        const itemStr = formatValueForExport(item, indent + '  ')
        return `${indent}[${index + 1}]\n${itemStr}`
      })
      .filter(Boolean)
      .join('\n\n')
  }

  return Object.entries(value as Record<string, unknown>)
    .filter(([_, v]) => v != null && v !== '')
    .map(([key, val]) => {
      const humanKey = humanizeExportKey(key)
      if (typeof val === 'object' && val !== null) {
        if (val instanceof Date) {
          return `${indent}${humanKey}: ${formatDateForExport(val)}`
        }
        const nested = formatValueForExport(val, indent + '  ')
        return `${indent}${humanKey}:\n${nested}`
      }
      return `${indent}${humanKey}: ${val}`
    })
    .join('\n')
}

export function flattenObjectForExport(
  value: unknown,
  prefix: string,
  output: Record<string, string | number | boolean> = {}
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    if (value != null && value !== '') {
      output[prefix] = formatValueForExport(value)
    } else {
      output[prefix] = ''
    }
    return output
  }

  Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
    const nextPrefix = `${prefix} ${humanizeExportKey(key)}`

    if (nestedValue == null || nestedValue === '') {
      output[nextPrefix] = ''
      return
    }

    if (nestedValue instanceof Date) {
      output[nextPrefix] = formatDateForExport(nestedValue)
      return
    }

    if (Array.isArray(nestedValue)) {
      output[nextPrefix] = formatValueForExport(nestedValue)
      return
    }

    if (typeof nestedValue === 'object') {
      flattenObjectForExport(nestedValue, nextPrefix, output)
      return
    }

    output[nextPrefix] = String(nestedValue)
  })

  return output
}

export function normalizeDettesLog(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
}

export function summarizeDettesLog(value: unknown) {
  const stops = normalizeDettesLog(value)
  if (stops.length === 0) return ''

  return stops
    .map((stop, index) => {
      const stopNumber = typeof stop.stopNumber === 'number' ? stop.stopNumber : index + 1
      const storeName =
        typeof stop.storeName === 'string' && stop.storeName.trim().length > 0
          ? stop.storeName.trim()
          : (typeof stop.storeId === 'string' ? stop.storeId : `Parada ${stopNumber}`)

      const appointment = formatDateForExport(
        typeof stop.appointmentAt === 'string' ? stop.appointmentAt : null
      )

      return appointment
        ? `${stopNumber}. ${storeName} (${appointment})`
        : `${stopNumber}. ${storeName}`
    })
    .join(' | ')
}

export function exportTripsToExcel({
  filteredRows,
  rawTripsMap,
  unitsMap,
}: {
  filteredRows: TripsTableRowEntity[]
  rawTripsMap: Map<string, TripWithRelations>
  unitsMap: Map<string, UnitAssemblyEntity>
}) {
  if (!filteredRows.length) {
    toast.error('No hay viajes para exportar')
    return
  }

  try {
    toast.info('Generando Excel de viajes...')

    const exportRows: Record<string, string | number | boolean>[] = filteredRows
      .map((row) => {
        const tripItem = rawTripsMap.get(row.id)
        if (!tripItem) return null

        const unit = tripItem.trip.unitAssemblyId
          ? unitsMap.get(tripItem.trip.unitAssemblyId)
          : undefined

        const baseRow: Record<string, string | number | boolean> = {
          'Folio': row.folio,
          'Numero Viaje': tripItem.trip.tripNumber ?? '',
          'Numero Viaje Cliente': tripItem.trip.tripNumberClient ?? '',
          'Cliente': tripItem.clientName ?? '',
          'Estado': tripItem.trip.status,
          'Origen': tripItem.trip.origin ?? '',
          'Destino': tripItem.trip.destination ?? '',
          'Fecha Salida': formatDateForExport(tripItem.trip.departureDate),
          'Fecha Llegada Real': formatDateForExport(tripItem.trip.arrivalDateActual),
          'Fecha Carga Diesel': formatDateForExport(tripItem.trip.fuelLoadDate),
          'Ultimo Escaneo': formatDateForExport(tripItem.trip.lastScan),
          'Observaciones': tripItem.trip.observations ?? '',
          'Unidad Economico': unit?.economicNumber ?? tripItem.unitEconomicNumber ?? '',
          'Unidad Nombre': unit?.name ?? '',
          'Unidad Activa': unit?.isActive == null ? '' : (unit.isActive ? 'Si' : 'No'),
          'Unidad Estado': unit?.status ?? '',
          'Rendimiento Teorico': unit?.theoreticalYield ?? '',
          'Rol Pool': unit?.poolRole ?? '',
          'Operador': unit?.employeeName ?? tripItem.operatorName ?? '',
          'Truck Economico': unit?.truckEconomicNumber ?? '',
          'Truck Placas': unit?.truckPlates ?? '',
          'Trailer 1 Economico': unit?.trailerEconomicNumber ?? '',
          'Trailer 1 Placas': unit?.trailerPlates ?? '',
          'Trailer 2 Economico': unit?.trailer2EconomicNumber ?? '',
          'Trailer 2 Placas': unit?.trailer2Plates ?? '',
          ...flattenObjectForExport(tripItem.trip.clientSpecificData, 'Trip Data'),
        }

        if (tripItem.walmartData) {
          baseRow['Walmart Coordinador'] = tripItem.walmartData.coordinatorName ?? ''
          baseRow['Walmart Ruta'] = tripItem.walmartData.route ?? ''
          baseRow['Walmart Tipo Carga'] = tripItem.walmartData.cargoType ?? ''
          baseRow['Walmart Carta Porte'] = tripItem.walmartData.cartaPorteWalmart ?? ''
          baseRow['Walmart Num Tiendas'] = tripItem.walmartData.numStores ?? ''
          baseRow['Walmart Estado'] = tripItem.walmartData.statusWalmart ?? ''
          baseRow['Walmart STR Num Load'] = tripItem.walmartData.strNumLoad ?? ''
          baseRow['Walmart STR Complemento CP'] = tripItem.walmartData.strComplementCartaPorte ?? ''
          baseRow['Walmart STR Preinvoice KM'] = tripItem.walmartData.strPreinvoiceKm ?? ''
          baseRow['Walmart STR KM Recorridos'] = tripItem.walmartData.strKmTraveled ?? ''
          baseRow['Walmart STR Diesel'] = tripItem.walmartData.strDiesel ?? ''
          baseRow['Walmart STR Casetas'] = tripItem.walmartData.strCasetas ?? ''
          baseRow['Walmart STR Total Invoice'] = tripItem.walmartData.strTotalInvoice ?? ''
          baseRow['Walmart DHD Num Load'] = tripItem.walmartData.dhdNumLoad ?? ''
          baseRow['Walmart DHD Complemento CP'] = tripItem.walmartData.dhdComplementCartaPorte ?? ''
          baseRow['Walmart DHD Preinvoice KM'] = tripItem.walmartData.dhdPreinvoiceKm ?? ''
          baseRow['Walmart DHD KM Recorridos'] = tripItem.walmartData.dhdKmTraveled ?? ''
          baseRow['Walmart DHD Diesel'] = tripItem.walmartData.dhdDiesel ?? ''
          baseRow['Walmart DHD Casetas'] = tripItem.walmartData.dhdCasetas ?? ''
          baseRow['Walmart DHD Total Invoice'] = tripItem.walmartData.dhdTotalInvoice ?? ''
          baseRow['Walmart Temperatura Salida'] = tripItem.walmartData.departureTemperature ?? ''
          baseRow['Walmart Hora Salida'] = formatDateForExport(tripItem.walmartData.departureTime)
          baseRow['Walmart Incidencias'] = tripItem.walmartData.incidencias ?? ''
          baseRow['Walmart Total Paradas'] = normalizeDettesLog(tripItem.walmartData.dettesLog).length
          baseRow['Walmart Dettes Resumen'] = summarizeDettesLog(tripItem.walmartData.dettesLog)
          Object.assign(baseRow, flattenObjectForExport(tripItem.walmartData.dettesLog, 'Walmart Dettes'))
        }

        return baseRow
      })
      .filter((row): row is Record<string, string | number | boolean> => row !== null)

    // Eliminar columnas que estén completamente vacías en TODOS los renglones
    const validKeys = new Set<string>()
    exportRows.forEach(row => {
      Object.entries(row).forEach(([k, v]) => {
        if (v !== '' && v != null) {
          validKeys.add(k)
        }
      })
    })

    const baseKeys = new Set([
      'Folio', 'Numero Viaje', 'Cliente', 'Estado', 'Origen', 'Destino', 'Fecha Salida'
    ])

    const uniqueClients = new Set(filteredRows.map(r => r.clientId).filter(Boolean))
    const isSingleClient = uniqueClients.size === 1

    const cleanedRows = exportRows.map(row => {
      const newRow: Record<string, string | number | boolean> = {}
      Object.keys(row).forEach(k => {
        if (isSingleClient && k === 'Cliente') return

        if (validKeys.has(k) || baseKeys.has(k)) {
          newRow[k] = row[k]
        }
      })
      return newRow
    })

    cleanedRows.sort((a, b) => {
      const valA = String(a['Numero Viaje Cliente'] || '')
      const valB = String(b['Numero Viaje Cliente'] || '')
      return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
    })

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(cleanedRows)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Viajes')

    XLSX.writeFile(workbook, `Viajes_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Excel exportado correctamente')
  } catch {
    toast.error('Error al exportar los viajes')
  }
}
