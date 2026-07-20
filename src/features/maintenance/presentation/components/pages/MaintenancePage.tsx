'use client'

import React, { useMemo, useState } from 'react'
import { Wrench, ClipboardList, Truck, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { useWorkshopStays } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopStayKpiEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { StayWizard } from '../organisms/StayWizard'
import { StayDetailsDialog } from '../organisms/StayDetailsDialog'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export default function MaintenancePage() {
  const staysQuery = useWorkshopStays({ limit: 200 })
  const stays = staysQuery.data ?? []

  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedStay, setSelectedStay] = useState<WorkshopStayKpiEntity | null>(null)

  const activeStays = useMemo(() => stays.filter(s => s.status === 'open'), [stays])
  const totalCostThisMonth = useMemo(() => {
    const now = new Date()
    return stays
      .filter(s => {
        const exit = s.exitedAt ? new Date(s.exitedAt) : new Date(s.enteredAt)
        return exit.getMonth() === now.getMonth() && exit.getFullYear() === now.getFullYear()
      })
      .reduce((acc, s) => acc + (s.totalCost || 0), 0)
  }, [stays])
  
  const averageDaysInShop = useMemo(() => {
    const completed = stays.filter(s => s.status === 'closed' && s.daysInShop !== null)
    if (completed.length === 0) return 0
    const totalDays = completed.reduce((acc, s) => acc + (s.daysInShop || 0), 0)
    return (totalDays / completed.length).toFixed(1)
  }, [stays])

  const columns = useMemo<CrudColumn<WorkshopStayKpiEntity>[]>(() => {
    return [
      {
        header: 'Estancia',
        cell: (s) => (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
              {s.folio}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[260px]">
              {s.unitLabel}
            </span>
          </div>
        ),
      },
      {
        header: 'Ingreso',
        cell: (s) => dateFmt.format(new Date(s.enteredAt)),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Salida',
        cell: (s) => (s.exitedAt ? dateFmt.format(new Date(s.exitedAt)) : '—'),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Días',
        cell: (s) => (s.daysInShop === null ? '—' : String(s.daysInShop)),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Costo',
        cell: (s) => money.format(s.totalCost),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Estado',
        cell: (s) =>
          s.status === 'open' ? (
            <Badge className="bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300">
              Abierta
            </Badge>
          ) : (
            <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">
              Cerrada
            </Badge>
          ),
        className: 'w-[120px]',
      },
    ]
  }, [])

  const handleView = (stay: WorkshopStayKpiEntity) => {
    setSelectedStay(stay)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedStay(null)
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Visión General de Taller</h2>
          <p className="text-sm text-stone-500">
            Monitoreo en tiempo real de estancias, órdenes de trabajo y costos de refacciones.
          </p>
        </div>
        {canManage && (
          <Button className="h-9 rounded-xl" onClick={() => setIsWizardOpen(true)}>
            Nueva Estancia
          </Button>
        )}
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unidades en Taller */}
        <Card className="border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-stone-500">Unidades en Taller</p>
              <Truck className="size-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{activeStays.length} <span className="text-sm font-normal text-stone-500">activas</span></p>
              <p className="text-xs text-stone-500 mt-1">Órdenes abiertas y en proceso</p>
            </div>
          </CardContent>
        </Card>

        {/* Gasto del Mes */}
        <Card className="border-stone-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-stone-500">Gasto Mensual</p>
              <DollarSign className="size-4 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{money.format(totalCostThisMonth)}</p>
              <p className="text-xs text-stone-500 mt-1">Costo acumulado este mes</p>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Promedio */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-stone-500">Tiempo Promedio</p>
              <Clock className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{averageDaysInShop} <span className="text-sm font-normal text-stone-500">días</span></p>
              <p className="text-xs text-stone-500 mt-1">Basado en estancias cerradas</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabla de Estancias */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <ClipboardList className="size-5 text-[#006d37]" />
          Registro de Estancias
        </h3>
        
        <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
          <CrudDataTable<WorkshopStayKpiEntity>
            canManage={canManage}
            data={stays}
            isLoading={staysQuery.isLoading}
            columns={columns}
            searchPlaceholder="Buscar por folio, unidad o motivo..."
            searchFilter={(row, term) => [row.folio, row.unitLabel, row.reason].some((v) => v?.toLowerCase().includes(term))}
            onView={handleView}
            emptyState={{
              icon: ClipboardList,
              title: 'Sin estancias registradas',
              description: 'Crea una nueva estancia cuando una unidad ingrese al taller.',
            }}
          />
        </div>
      </div>

      <StayWizard key={isWizardOpen ? 'open' : 'closed'} isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <StayDetailsDialog key={selectedStay?.id ?? 'none'} isOpen={isDetailsOpen} onClose={handleCloseDetails} stay={selectedStay} />
    </div>
  )
}
