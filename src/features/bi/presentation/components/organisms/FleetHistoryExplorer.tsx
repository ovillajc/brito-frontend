'use client'

/**
 * @fileoverview Explorador de historial operativo de elementos de flota.
 * Permite buscar un tracto, remolque, operador o unidad armada
 * y ver todos los viajes en los que participó.
 *
 * @organism
 */

import React, { useState, useEffect } from 'react'
import { Truck, Container, User, Settings, Search, X, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { useFleetHistory } from '../../hooks/use-fleet-history'
import type { FleetElementType } from '../../../domain/entities/bi-entity'
import { cn } from '@/src/core/infrastructure/utils/cn'

// ── Tipos de catálogo recibidos desde el servidor ─────────────────────────────

interface CatalogItem {
  id: string
  name?: string
  economic_number?: string
}

interface BiCatalogs {
  trucks: CatalogItem[]
  trailers: CatalogItem[]
  operators: { id: string; name: string }[]
  assemblies: CatalogItem[]
}

interface FleetHistoryExplorerProps {
  catalogs: BiCatalogs
}

// ── Config de pestaña ─────────────────────────────────────────────────────────

const TABS: { type: FleetElementType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'truck', label: 'Tracto', icon: Truck },
  { type: 'trailer', label: 'Remolque', icon: Container },
  { type: 'operator', label: 'Operador', icon: User },
  { type: 'assembly', label: 'Unidad Armada', icon: Settings },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  completed:    { label: 'Completado',  className: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
  in_progress:  { label: 'En Ruta',    className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
  scheduled:    { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
  cancelled:    { label: 'Cancelado',  className: 'bg-stone-200 text-stone-600' },
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmtDate = (d: string | null) => d ? new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(d)) : '—'

// ── Componente ────────────────────────────────────────────────────────────────

export function FleetHistoryExplorer({ catalogs }: FleetHistoryExplorerProps) {
  const [activeTab, setActiveTab] = useState<FleetElementType>('truck')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { history, isLoading, fetch, clear } = useFleetHistory()

  // Obtener la lista de ítems según la pestaña activa
  const items = React.useMemo(() => {
    const raw = activeTab === 'truck' ? catalogs.trucks
      : activeTab === 'trailer' ? catalogs.trailers
      : activeTab === 'operator' ? catalogs.operators.map(o => ({ id: o.id, name: o.name }))
      : catalogs.assemblies

    const term = search.toLowerCase()
    return raw.filter(i =>
      ((i as CatalogItem).name ?? (i as CatalogItem).economic_number ?? '').toLowerCase().includes(term)
    )
  }, [activeTab, catalogs, search])

  // Limpiar selección al cambiar pestaña
  useEffect(() => {
    setSelectedId(null)
    setSearch('')
    clear()
  }, [activeTab, clear])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    fetch(activeTab, id)
  }

  const totalExpenses = history.reduce((acc, h) => acc + h.totalExpenses, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Pestañas de tipo de elemento ─────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                activeTab === tab.type
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200'
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* ── Panel izquierdo: selector ─────────────────────── */}
        <Card className="border shadow-sm h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Seleccionar {TABS.find(t => t.type === activeTab)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col gap-3">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 h-9 text-sm rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="size-4 text-stone-400" />
                </button>
              )}
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-4">Sin resultados</p>
              ) : items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors',
                    selectedId === item.id
                      ? 'bg-[#1a5c3a] text-white font-semibold'
                      : 'hover:bg-stone-100 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300'
                  )}
                >
                  {(item as CatalogItem).name ?? (item as CatalogItem).economic_number ?? item.id}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Panel derecho: historial ──────────────────────── */}
        <div className="flex flex-col gap-4">
          {!selectedId ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-xl text-stone-400 gap-2">
              <Search className="size-8" />
              <p className="text-sm">Selecciona un elemento del panel izquierdo</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-stone-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-stone-200 dark:border-zinc-700 rounded-xl text-stone-400 gap-2">
              <AlertCircle className="size-8" />
              <p className="text-sm">Sin viajes registrados para este elemento</p>
            </div>
          ) : (
            <>
              {/* Resumen rápido */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Viajes</p>
                    <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mt-1">{history.length}</p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Clientes</p>
                    <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mt-1">
                      {new Set(history.map(h => h.clientName).filter(Boolean)).size}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Gastos Totales</p>
                    <p className="text-lg font-bold text-red-600 mt-1">{money.format(totalExpenses)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de historial */}
              <Card className="border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Folio</th>
                        <th className="px-4 py-3 font-semibold">Ruta</th>
                        <th className="px-4 py-3 font-semibold">Cliente</th>
                        <th className="px-4 py-3 font-semibold">Fecha</th>
                        <th className="px-4 py-3 font-semibold">Estado</th>
                        <th className="px-4 py-3 font-semibold text-right">Gastos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                      {history.map(row => {
                        const statusCfg = STATUS_MAP[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }
                        return (
                          <tr key={row.tripId} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-3 font-mono font-semibold text-stone-900 dark:text-zinc-100">{row.folio}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 text-xs text-stone-500">
                                  <MapPin className="size-3" />{row.origin ?? '—'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[#1a5c3a]">
                                  <MapPin className="size-3" />{row.destination ?? '—'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-stone-700 dark:text-zinc-300">{row.clientName ?? '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                <Calendar className="size-3" />
                                {fmtDate(row.departureDate)}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-stone-900 dark:text-zinc-100 tabular-nums">
                              {row.totalExpenses > 0 ? (
                                <span className="flex items-center justify-end gap-1 text-red-600">
                                  <DollarSign className="size-3" />
                                  {money.format(row.totalExpenses).replace('$', '')}
                                </span>
                              ) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
