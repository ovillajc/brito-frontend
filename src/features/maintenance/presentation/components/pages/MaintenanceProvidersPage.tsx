'use client'

import { useState } from 'react'
import { Building2, Wrench } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useProviders } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import { ProviderDialog } from '@/src/features/maintenance/presentation/components/organisms/ProviderDialog'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import type { MaintenanceProviderEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'

/** Página de gestión de proveedores de servicios de mantenimiento. */
export default function MaintenanceProvidersPage() {
  const { data: providers, isLoading, error } = useProviders()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<MaintenanceProviderEntity | null>(null)

  const handleNew = () => {
    setSelectedProvider(null)
    setDialogOpen(true)
  }

  const handleEdit = (provider: MaintenanceProviderEntity) => {
    setSelectedProvider(provider)
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setSelectedProvider(null)
  }

  const columns: CrudColumn<MaintenanceProviderEntity>[] = [
    {
      header: 'Nombre',
      sortable: true,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a5c3a]/10 text-[#1a5c3a]">
            {p.providerType === 'INTERNAL' ? (
              <Wrench className="size-4" />
            ) : (
              <Building2 className="size-4" />
            )}
          </div>
          <span className="font-medium text-on-surface">{p.name}</span>
        </div>
      ),
      accessor: (p) => p.name,
    },
    {
      header: 'Tipo',
      sortable: true,
      cell: (p) => (
        <Badge
          variant="outline"
          className={cn(
            'rounded-full text-xs font-medium border',
            p.providerType === 'INTERNAL'
              ? 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-700'
              : 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700'
          )}
        >
          {p.providerType === 'INTERNAL' ? 'Interno' : 'Externo'}
        </Badge>
      ),
      accessor: (p) => p.providerType,
    },
    {
      header: 'Estado',
      sortable: true,
      cell: (p) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium',
            p.isActive ? 'text-green-600 dark:text-green-400' : 'text-stone-400 dark:text-zinc-500'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              p.isActive ? 'bg-green-500' : 'bg-stone-400'
            )}
          />
          {p.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      accessor: (p) => (p.isActive ? 'Activo' : 'Inactivo'),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-on-surface">Proveedores de Servicio</h2>
        <p className="text-sm text-on-surface-variant mt-0.5">
          Registra los proveedores externos e internos para asignarlos en las refacciones.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 text-sm text-red-700 dark:text-red-400">
          Error al cargar proveedores: {error.message}
        </div>
      )}

      <CrudDataTable<MaintenanceProviderEntity>
        data={providers ?? []}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder="Buscar por nombre..."
        searchFilter={(p, term) => p.name.toLowerCase().includes(term.toLowerCase())}
        actionLabel="Nuevo proveedor"
        onAction={handleNew}
        onEdit={handleEdit}
        emptyState={{
          icon: Building2,
          title: 'Sin proveedores',
          description: 'No hay proveedores registrados aún. Agrega el primero con el botón superior.',
        }}
      />

      <ProviderDialog
        isOpen={dialogOpen}
        onClose={handleClose}
        initialData={selectedProvider}
      />
    </div>
  )
}
