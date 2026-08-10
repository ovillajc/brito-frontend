'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Textarea } from '@/src/core/presentation/components/ui/textarea'
import { useUpdateWorkOrder } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import { WORK_ORDER_STATUS, type WorkshopWorkOrderReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { EmployeeEntity } from '@/src/features/hr/domain/entities'

const closeWorkOrderSchema = z.object({
  finishedAt: z.string().min(1, 'La fecha y hora de finalización es requerida'),
  supervisorName: z.string().trim().nullable().default(null),
  supervisorEmployeeId: z.string().uuid().nullable().default(null),
  details: z.string().min(5, 'Por favor ingresa detalles sobre el diagnóstico y reparaciones aplicadas'),
})

type CloseFormValues = z.infer<typeof closeWorkOrderSchema>

interface CloseWorkOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  workOrder: WorkshopWorkOrderReplicaEntity | null
}

export function CloseWorkOrderDialog({ isOpen, onClose, workOrder }: CloseWorkOrderDialogProps) {
  const updateWorkOrder = useUpdateWorkOrder()
  const [isInternalSupervisor, setIsInternalSupervisor] = useState(false)

  const employeesQuery = useQuery({
    queryKey: ['maintenance', 'employees'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const supervisors = useMemo(() => {
    return (employeesQuery.data ?? []).filter((e) => e.isActive)
  }, [employeesQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CloseFormValues>({
    resolver: zodResolver(closeWorkOrderSchema) as any,
    defaultValues: {
      finishedAt: new Date().toISOString().slice(0, 16),
      supervisorName: null,
      supervisorEmployeeId: null,
      details: '',
    },
  })

  useEffect(() => {
    if (isOpen && workOrder) {
      reset({
        finishedAt: workOrder.finishedAt
          ? new Date(workOrder.finishedAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        supervisorName: null,
        supervisorEmployeeId: null,
        details: workOrder.details || '',
      })
      setIsInternalSupervisor(false)
    }
  }, [isOpen, workOrder, reset])

  const onSubmit = handleSubmit(
    async (data) => {
      if (!workOrder) return
      try {
        await updateWorkOrder.mutateAsync({
          id: workOrder.id,
          data: {
            status: WORK_ORDER_STATUS.Completed,
            finishedAt: new Date(data.finishedAt).toISOString(),
            details: data.details,
            supervisorName: data.supervisorName || null,
            supervisorEmployeeId: data.supervisorEmployeeId || null,
          },
        })
        toast.success('Orden de trabajo cerrada exitosamente')
        onClose()
      } catch (error: any) {
        toast.error(error.message || 'Error al cerrar orden de trabajo')
      }
    },
    (formErrors) => {
      console.error('[CloseWorkOrder] Validation errors:', formErrors)
      toast.error('Corrige los errores antes de continuar')
    }
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      hideDefaultHeader
    >
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 text-white"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                Cerrar Orden
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                {workOrder ? `Folio: ${workOrder.workOrderFolio}` : 'Finalizar trabajo'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 max-h-[70vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label htmlFor="finishedAt" className="text-stone-700 dark:text-zinc-300 font-semibold">Fecha y Hora de Finalización</Label>
            <Input
              id="finishedAt"
              type="datetime-local"
              {...register('finishedAt')}
              className="bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 focus-visible:ring-[#1a5c3a]"
            />
            {errors.finishedAt && <p className="text-xs text-red-500">{errors.finishedAt.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="details" className="text-stone-700 dark:text-zinc-300 font-semibold">Diagnóstico y Reparaciones</Label>
            <Textarea
              id="details"
              placeholder="Describe detalladamente el diagnóstico y las refacciones/soluciones aplicadas..."
              {...register('details')}
              className="min-h-[120px] resize-y bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 focus-visible:ring-[#1a5c3a]"
            />
            {errors.details && <p className="text-xs text-red-500">{errors.details.message}</p>}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-stone-700 dark:text-zinc-300 font-semibold">Supervisor (Opcional)</Label>
              <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternalSupervisor}
                  className="rounded border-stone-300 text-[#1a5c3a] focus:ring-[#1a5c3a]"
                  onChange={(e) => {
                    setIsInternalSupervisor(e.target.checked)
                    if (e.target.checked) {
                      setValue('supervisorName', null)
                    } else {
                      setValue('supervisorEmployeeId', null)
                    }
                  }}
                />
                Es interno
              </label>
            </div>
            {isInternalSupervisor ? (
              <select
                id="supervisorEmployeeId"
                className="flex h-10 w-full rounded-md border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 px-3 py-2 text-sm text-stone-700 dark:text-zinc-300 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c3a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={employeesQuery.isLoading}
                {...register('supervisorEmployeeId', { setValueAs: (v) => v || null })}
              >
                <option value="">{employeesQuery.isLoading ? 'Cargando supervisores...' : 'Selecciona un supervisor...'}</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
            ) : (
              <Input
                id="supervisorName"
                placeholder="Nombre del supervisor externo"
                className="bg-stone-50 dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 focus-visible:ring-[#1a5c3a]"
                {...register('supervisorName', { setValueAs: (v) => v || null })}
              />
            )}
          </div>

          <div className="mt-2 flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="border-stone-200 text-stone-600 hover:bg-stone-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1a5c3a] text-white hover:bg-[#1a5c3a]/90 shadow-sm">
              {isSubmitting ? 'Guardando...' : 'Cerrar Orden'}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}
