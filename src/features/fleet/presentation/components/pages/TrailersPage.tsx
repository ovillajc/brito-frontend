/**
 * @fileoverview Listado de Remolques.
 * Usa CrudDataTable<TrailerEntity> para el layout genérico CRUD.
 */

'use client'

import React, { useState } from 'react'
import { Disc3 } from 'lucide-react'
import { useTrailers } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { TrailerEntity, vehicleStatus } from '@/src/features/fleet/domain/entities'
import { deleteTrailerAction } from '@/src/features/fleet/presentation/actions/trailer.actions'
import { CrudDataTable, CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { TrailerWizard } from '@/src/features/fleet/presentation/components/organisms/TrailerWizard'
import { TrailerDetailsDialog } from '@/src/features/fleet/presentation/components/organisms/TrailerDetailsDialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useQueryClient } from '@tanstack/react-query'

const STATUS_LABELS: Record<vehicleStatus, { label: string; className: string }> = {
  available:   { label: 'Disponible',        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  in_trip:     { label: 'En Viaje',          className: 'bg-primary/10 text-primary border-primary/20' },
  maintenance: { label: 'Mantenimiento',     className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  out_service: { label: 'Fuera de Servicio', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

/** Definición de columnas de la tabla de Trailers. */
const TRAILER_COLUMNS: CrudColumn<TrailerEntity>[] = [
  {
    header: 'Económico / Modelo',
    cell: (t) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
          {t.economicNumber}
        </span>
        <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
          {t.trailerModelName || 'Desconocido'}
        </span>
      </div>
    ),
  },
  {
    header: 'Placas',
    cell: (t) => <span className="font-mono text-xs font-medium">{t.plates || '---'}</span>,
  },
  {
    header: 'N° de Serie (VIN)',
    cell: (t) => <span className="text-xs text-stone-500 dark:text-zinc-400">{t.serialNumber || '---'}</span>,
  },
  {
    header: 'Propietario',
    cell: (t) => <span className="text-xs font-medium">{t.companyProfileLegalName || 'Sin asignar'}</span>,
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

export default function TrailersPage() {
  const { data: trailers, isLoading } = useTrailers()
  const queryClient = useQueryClient()

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedTrailer, setSelectedTrailer] = useState<TrailerEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailTrailer, setDetailTrailer] = useState<TrailerEntity | null>(null)

  const handleView = (trailer: TrailerEntity) => {
    setDetailTrailer(trailer)
    setIsDetailsOpen(true)
  }

  const handleEdit = (trailer: TrailerEntity) => {
    setSelectedTrailer(trailer)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedTrailer(null)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteTrailerAction(id)
    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ['fleet', 'trailers'] })
    }
    return result
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudDataTable<TrailerEntity>
        data={trailers}
        isLoading={isLoading}
        columns={TRAILER_COLUMNS}
        searchPlaceholder="Buscar por económico, placas, VIN o modelo..."
        searchFilter={(t, term) =>
          [t.economicNumber, t.plates, t.serialNumber, t.trailerModelName]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Remolque"
        onAction={() => setIsWizardOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState={{
          icon: Disc3,
          title: 'No hay remolques',
          description: 'Aún no se han registrado remolques (equipos de arrastre). Comienza agregando uno nuevo.',
        }}
      />

      <TrailerWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        trailer={selectedTrailer ?? undefined}
      />

      <TrailerDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setDetailTrailer(null) }}
        trailer={detailTrailer}
      />
    </div>
  )
}
