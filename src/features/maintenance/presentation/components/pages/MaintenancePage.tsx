'use client'

import React, { useMemo, useState } from 'react'
import { Wrench, ClipboardList } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
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
        cell: (s) => dateFmt.format(s.enteredAt),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Salida',
        cell: (s) => (s.exitedAt ? dateFmt.format(s.exitedAt) : '—'),
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container/10 rounded-xl">
            <Wrench className="size-5 text-primary-container" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Bitácora de Taller</h1>
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Estancias, órdenes de trabajo y refacciones por unidad.
            </p>
          </div>
        </div>
        {canManage && (
          <Button className="h-9 rounded-xl" onClick={() => setIsWizardOpen(true)}>
            Nueva Estancia
          </Button>
        )}
      </div>

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

      <StayWizard key={isWizardOpen ? 'open' : 'closed'} isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
      <StayDetailsDialog key={selectedStay?.id ?? 'none'} isOpen={isDetailsOpen} onClose={handleCloseDetails} stay={selectedStay} />
    </div>
  )
}
