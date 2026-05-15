'use client'

import React, { useMemo, useState } from 'react'
import { X, Wrench, ClipboardList, PackagePlus, Lock } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import type { WorkshopStayKpiEntity, WorkshopWorkOrderEntity, WorkOrderPartEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useCloseWorkshopStay, useMaintenanceCatalogs, useStayWorkOrders, useWorkOrderParts } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import { WorkOrderWizard } from './WorkOrderWizard'
import { WorkOrderPartWizard } from './WorkOrderPartWizard'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface StayDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  stay: WorkshopStayKpiEntity | null
}

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export function StayDetailsDialog({ isOpen, onClose, stay }: StayDetailsDialogProps) {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkshopWorkOrderEntity | null>(null)
  const [isWorkOrderWizardOpen, setIsWorkOrderWizardOpen] = useState(false)
  const [isPartWizardOpen, setIsPartWizardOpen] = useState(false)

  const catalogsQuery = useMaintenanceCatalogs()
  const workOrdersQuery = useStayWorkOrders(stay?.id ?? null)
  const partsQuery = useWorkOrderParts(selectedWorkOrder?.id ?? null)
  const closeStay = useCloseWorkshopStay()

  const workOrders = workOrdersQuery.data ?? []
  const parts = partsQuery.data ?? []

  const workOrderColumns = useMemo<CrudColumn<WorkshopWorkOrderEntity>[]>(() => {
    return [
      {
        header: 'Trabajo',
        cell: (w) => (
          <div className="flex flex-col">
            <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
              {w.folio}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[240px]">
              {w.description}
            </span>
          </div>
        ),
      },
      {
        header: 'Categoría',
        cell: (w) => w.mechanicalCategoryName ?? '—',
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Estado',
        cell: (w) => (
          <Badge variant="outline" className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300">
            {w.status}
          </Badge>
        ),
        className: 'w-[120px]',
      },
      {
        header: 'Costo',
        cell: (w) => money.format(w.totalCost),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
    ]
  }, [])

  const partColumns = useMemo<CrudColumn<WorkOrderPartEntity>[]>(() => {
    return [
      {
        header: 'Pieza',
        cell: (p) => (
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 dark:text-zinc-100 truncate max-w-[260px]">
              {p.description}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[260px]">
              {p.providerName ?? '—'}
            </span>
          </div>
        ),
      },
      {
        header: 'Cant.',
        cell: (p) => String(p.quantity),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
      {
        header: 'Total',
        cell: (p) => money.format(p.total),
        className: 'text-sm text-stone-600 dark:text-zinc-400',
      },
    ]
  }, [])

  const handleClose = () => {
    onClose()
  }

  const handleCloseStay = async () => {
    if (!stay) return
    await closeStay.mutateAsync(stay.id)
  }

  if (!stay) return null

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="full" hideDefaultHeader>
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Wrench className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{stay.folio}</h2>
              <p className="text-sm text-white/70 mt-0.5">{stay.unitLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-8 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/10 text-white border border-white/15">
              Ingreso: {dateFmt.format(stay.enteredAt)}
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/15">
              Salida: {stay.exitedAt ? dateFmt.format(stay.exitedAt) : '—'}
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/15">
              Días: {stay.daysInShop ?? '—'}
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/15">
              Total: {money.format(stay.totalCost)}
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/15">
              Estado: {stay.status === 'open' ? 'Abierta' : 'Cerrada'}
            </Badge>
          </div>
        </div>

        <div className="px-8 pb-6">
          <Tabs defaultValue="orders">
            <TabsList className="bg-white/10 border border-white/15">
              <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:text-[#004020] text-white">
                Órdenes de trabajo
              </TabsTrigger>
              <TabsTrigger value="parts" className="data-[state=active]:bg-white data-[state=active]:text-[#004020] text-white">
                Refacciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-zinc-800">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-zinc-100">Órdenes</p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500">Selecciona una para ver refacciones</p>
                    </div>
                    {canManage && (
                      <Button className="h-9 rounded-xl" onClick={() => setIsWorkOrderWizardOpen(true)}>
                        <ClipboardList className="size-4" />
                        Nueva
                      </Button>
                    )}
                  </div>

                  <CrudDataTable<WorkshopWorkOrderEntity>
                    canManage={canManage}
                    data={workOrders}
                    isLoading={workOrdersQuery.isLoading}
                    columns={workOrderColumns}
                    searchPlaceholder="Buscar por folio o descripción..."
                    searchFilter={(row, term) => [row.folio, row.description].some((v) => v?.toLowerCase().includes(term))}
                    onView={(row) => setSelectedWorkOrder(row)}
                    emptyState={{
                      icon: ClipboardList,
                      title: 'Sin órdenes',
                      description: 'Crea una orden de trabajo para registrar labores.',
                    }}
                  />
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-zinc-800">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-zinc-100">Refacciones</p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500">
                        {selectedWorkOrder ? `Trabajo: ${selectedWorkOrder.folio}` : 'Selecciona una orden'}
                      </p>
                    </div>
                    {canManage && (
                      <Button
                        className="h-9 rounded-xl"
                        disabled={!selectedWorkOrder}
                        onClick={() => setIsPartWizardOpen(true)}
                      >
                        <PackagePlus className="size-4" />
                        Agregar
                      </Button>
                    )}
                  </div>

                  <CrudDataTable<WorkOrderPartEntity>
                    canManage={canManage}
                    data={parts}
                    isLoading={partsQuery.isLoading}
                    columns={partColumns}
                    searchPlaceholder="Buscar por descripción o proveedor..."
                    searchFilter={(row, term) =>
                      [row.description, row.providerName].some((v) => v?.toLowerCase().includes(term))
                    }
                    emptyState={{
                      icon: PackagePlus,
                      title: 'Sin refacciones',
                      description: selectedWorkOrder ? 'Registra piezas o materiales usados.' : 'Selecciona una orden.',
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parts" className="mt-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-zinc-100">Refacciones (por orden)</p>
                    <p className="text-xs text-stone-500 dark:text-zinc-500">Selecciona una orden en la pestaña anterior.</p>
                  </div>
                  {canManage && (
                    <Button
                      className="h-9 rounded-xl"
                      disabled={!selectedWorkOrder}
                      onClick={() => setIsPartWizardOpen(true)}
                    >
                      <PackagePlus className="size-4" />
                      Agregar
                    </Button>
                  )}
                </div>
                <CrudDataTable<WorkOrderPartEntity>
                  canManage={canManage}
                  data={parts}
                  isLoading={partsQuery.isLoading}
                  columns={partColumns}
                  searchPlaceholder="Buscar por descripción o proveedor..."
                  searchFilter={(row, term) =>
                    [row.description, row.providerName].some((v) => v?.toLowerCase().includes(term))
                  }
                  emptyState={{
                    icon: PackagePlus,
                    title: 'Sin refacciones',
                    description: selectedWorkOrder ? 'Registra piezas o materiales usados.' : 'Selecciona una orden.',
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-stone-600 dark:text-zinc-400">
            {stay.reason}
          </div>
          {canManage && (
            <Button
              variant="outline"
              className="h-9 rounded-xl"
              disabled={stay.status !== 'open' || closeStay.isPending}
              onClick={handleCloseStay}
            >
              <Lock className="size-4" />
              Cerrar estancia
            </Button>
          )}
        </div>
      </div>

      <WorkOrderWizard
        key={`${stay.id}-${isWorkOrderWizardOpen ? 'open' : 'closed'}`}
        isOpen={isWorkOrderWizardOpen}
        onClose={() => setIsWorkOrderWizardOpen(false)}
        stayId={stay.id}
        catalogs={catalogsQuery.data ?? null}
      />

      <WorkOrderPartWizard
        key={`${selectedWorkOrder?.id ?? 'none'}-${isPartWizardOpen ? 'open' : 'closed'}`}
        isOpen={isPartWizardOpen}
        onClose={() => setIsPartWizardOpen(false)}
        workOrderId={selectedWorkOrder?.id ?? null}
        catalogs={catalogsQuery.data ?? null}
      />
    </Dialog>
  )
}
