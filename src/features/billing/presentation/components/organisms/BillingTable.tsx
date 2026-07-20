'use client'

/**
 * @fileoverview Tabla principal del módulo de Facturación.
 * Muestra viajes completados con su estado de facturación y filtros avanzados.
 */

import React, { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, FileText, Clock, CheckCircle2, XCircle, Eye, Download } from 'lucide-react'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { BillingRecord, BillingStatus } from '@/src/features/billing/domain/entities/billing-entity'
import type { ClientEntity } from '@/src/features/clients/domain/entities'
import * as XLSX from 'xlsx'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' })

const PAGE_SIZE = 12

const STATUS_CONFIG: Record<BillingStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  pending: {
    label: 'Pendiente',
    icon: <Clock className="size-3" />,
    classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  invoiced: {
    label: 'Facturado',
    icon: <CheckCircle2 className="size-3" />,
    classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  cancelled: {
    label: 'Cancelado',
    icon: <XCircle className="size-3" />,
    classes: 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400 border-stone-200 dark:border-zinc-700',
  },
}

interface BillingTableProps {
  records: BillingRecord[]
  clients: ClientEntity[]
  selectedId: string | null
  onSelect: (record: BillingRecord) => void
}

export function BillingTable({ records, clients, selectedId, onSelect }: BillingTableProps) {
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<BillingStatus | 'all'>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return records.filter((r) => {
      if (clientFilter !== 'all' && r.clientId !== clientFilter) return false
      if (statusFilter !== 'all' && r.billingStatus !== statusFilter) return false
      if (term) {
        return [r.folio, r.clientName, r.origin, r.destination, r.unitEconomicNumber, r.invoiceFolio]
          .some((v) => v?.toLowerCase().includes(term))
      }
      return true
    })
  }, [records, search, clientFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const page_records = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleExcelExport = () => {
    const rows = filtered.map((r) => ({
      'Folio': r.folio ?? '',
      'Cliente': r.clientName ?? '',
      'Origen': r.origin ?? '',
      'Destino': r.destination ?? '',
      'Unidad': r.unitEconomicNumber ?? '',
      'Operador': r.operatorName ?? '',
      'Fecha Salida': r.departureDate ? dateFmt.format(r.departureDate) : '',
      'Km Pre-Fac': r.preinvoiceKm ?? '',
      'Importe': r.totalIncome,
      'Estado Factura': STATUS_CONFIG[r.billingStatus]?.label ?? '',
      'Folio Factura': r.invoiceFolio ?? '',
      'UUID': r.invoiceUUID ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Facturación')
    XLSX.writeFile(wb, `Facturacion_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
          <Input
            id="billing-search"
            placeholder="Buscar folio, cliente, ruta..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-9 h-9 text-sm rounded-xl"
          />
        </div>

        {/* Client filter */}
        <select
          id="billing-client-filter"
          value={clientFilter}
          onChange={(e) => { setClientFilter(e.target.value); setPage(0) }}
          className="h-9 px-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-stone-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30"
        >
          <option value="all">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.tradeName ?? c.companyName ?? c.id}</option>
          ))}
        </select>

        {/* Status tabs */}
        <div className="flex items-center bg-stone-100 dark:bg-zinc-800 rounded-xl p-0.5 gap-0.5">
          {(['all', 'pending', 'invoiced', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                statusFilter === s
                  ? 'bg-white dark:bg-zinc-900 shadow-sm text-stone-900 dark:text-zinc-100'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200'
              )}
            >
              {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-stone-400">{filtered.length} registros</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExcelExport}
            className="h-9 text-xs rounded-xl border-stone-200 dark:border-zinc-700 gap-1.5"
          >
            <Download className="size-3.5" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-stone-50/80 dark:bg-zinc-800/50 border-b border-stone-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Folio / Viaje</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cliente</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden md:table-cell">Ruta</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest hidden lg:table-cell">Unidad</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-stone-400 uppercase tracking-widest">Importe</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/50">
              {page_records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <FileText className="size-10 opacity-20" />
                      <p className="text-sm font-medium">No hay viajes con los filtros seleccionados.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                page_records.map((record) => {
                  const isSelected = record.tripId === selectedId
                  const statusCfg = STATUS_CONFIG[record.billingStatus]
                  return (
                    <tr
                      key={record.tripId}
                      onClick={() => onSelect(record)}
                      className={cn(
                        'cursor-pointer transition-colors duration-150 group',
                        isSelected
                          ? 'bg-[#1a5c3a]/5 dark:bg-[#1a5c3a]/10'
                          : 'hover:bg-stone-50/80 dark:hover:bg-zinc-800/30'
                      )}
                    >
                      {/* Folio */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className={cn(
                            'font-bold text-sm transition-colors font-mono',
                            isSelected ? 'text-[#1a5c3a]' : 'text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a]'
                          )}>
                            {record.folio ?? `#${record.tripId.slice(0, 8)}`}
                          </span>
                          <span className="text-[10px] text-stone-400 mt-0.5">
                            {record.departureDate ? dateFmt.format(record.departureDate) : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300 line-clamp-1">
                          {record.clientName ?? '—'}
                        </span>
                      </td>

                      {/* Ruta */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex flex-col text-xs text-stone-500 dark:text-zinc-400">
                          <span className="font-medium text-stone-700 dark:text-zinc-300 truncate max-w-[160px]">{record.origin ?? '—'}</span>
                          <span className="truncate max-w-[160px]">→ {record.destination ?? '—'}</span>
                        </div>
                      </td>

                      {/* Unidad */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="font-mono text-xs text-stone-600 dark:text-zinc-400">
                          {record.unitEconomicNumber ?? '—'}
                        </span>
                      </td>

                      {/* Importe */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-sm text-stone-900 dark:text-zinc-100">
                          {money.format(record.totalIncome)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border',
                          statusCfg?.classes ?? ''
                        )}>
                          {statusCfg?.icon}
                          {statusCfg?.label}
                        </span>
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); onSelect(record) }}
                          className="p-1.5 rounded-lg hover:bg-[#1a5c3a]/10 text-stone-400 hover:text-[#1a5c3a] transition-colors"
                          aria-label="Ver detalle"
                        >
                          <Eye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/30">
            <span className="text-[11px] text-stone-400">
              Página {page + 1} de {totalPages} · {filtered.length} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
