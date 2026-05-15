/**
 * @fileoverview Listado de Tractocamiones.
 * Usa CrudDataTable<TruckEntity> para el layout genérico CRUD.
 */

'use client'

import React, { useState } from 'react'
import { Truck } from 'lucide-react'
import { useTractors } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { TruckEntity, vehicleStatus } from '@/src/features/fleet/domain/entities'
import { deleteTruckAction } from '@/src/features/fleet/presentation/actions/truck.actions'
import { CrudDataTable, CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { TruckWizard } from '@/src/features/fleet/presentation/components/organisms/TruckWizard'
import { TruckDetailsDialog } from '@/src/features/fleet/presentation/components/organisms/TruckDetailsDialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useQueryClient } from '@tanstack/react-query'

const STATUS_LABELS: Record<vehicleStatus, { label: string; className: string }> = {
  available:   { label: 'Disponible',        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  in_trip:     { label: 'En Viaje',          className: '' },
  maintenance: { label: 'Mantenimiento',     className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  out_service: { label: 'Fuera de Servicio', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

/** Definición de columnas de la tabla de Trucks. */
const TRUCK_COLUMNS: CrudColumn<TruckEntity>[] = [
  {
    header: 'Unidad / Marca',
    cell: (t) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
          {t.brand} {t.model}
        </span>
        <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
          {t.economicNumber} · {t.year}
        </span>
      </div>
    ),
  },
  {
    header: 'Placas',
    cell: (t) => <span className="font-mono text-xs font-medium">{t.plates}</span>,
  },
  {
    header: 'N° de Serie (VIN)',
    cell: (t) => <span className="text-xs text-stone-500 dark:text-zinc-400">{t.serialNumber || '---'}</span>,
  },
  {
    header: 'Estado',
    cell: (t) => {
      const config = STATUS_LABELS[t.status]
      return (
        <Badge variant="outline" className={cn('capitalize', config.className)}>
          {config.label}
        </Badge>
      )
    },
  },
]

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export default function TrucksPage() {
  const { data: trucks, isLoading } = useTractors()

  const canManage = useAuthStore((state) => state.hasPermission('fleet:manage'))

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<TruckEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailTruck, setDetailTruck] = useState<TruckEntity | null>(null)

  const handleView = (truck: TruckEntity) => {
    setDetailTruck(truck)
    setIsDetailsOpen(true)
  }

  const handleEdit = (truck: TruckEntity) => {
    setSelectedTruck(truck)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedTruck(null)
  }

  const queryClient = useQueryClient()

  const handleDelete = async (id: string) => {
    const result = await deleteTruckAction(id)
    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ['fleet', 'tractors'] })
    }
    return result
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudDataTable<TruckEntity>
        canManage={canManage}
        data={trucks}
        isLoading={isLoading}
        columns={TRUCK_COLUMNS}
        searchPlaceholder="Buscar por marca, placa o N/S..."
        searchFilter={(t, term) =>
          [t.brand, t.model, t.plates, t.serialNumber, t.economicNumber]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Tracto"
        onAction={() => setIsWizardOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState={{
          icon: Truck,
          title: 'No hay tractocamiones',
          description: 'Aún no se han registrado tractocamiones. Comienza agregando uno nuevo.',
        }}
      />

      <TruckWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        truck={selectedTruck ?? undefined}
      />

      <TruckDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setDetailTruck(null) }}
        truck={detailTruck}
      />
    </div>
  )
}
