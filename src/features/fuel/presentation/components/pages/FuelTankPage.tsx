'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import type { FuelTankMovementEntity, FuelTankSummaryEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'
import { FuelTankMovementsCard } from '@/src/features/fuel/presentation/components/organisms/FuelTankMovementsCard'
import {
  adjustFuelTankAction,
  createDefaultFuelTankAction,
  registerFuelTankPurchaseAction,
} from '@/src/features/fuel/presentation/actions/fuel-tanks.actions'

interface FuelTankPageProps {
  initialSummary: FuelTankSummaryEntity | null
  initialMovements: FuelTankMovementEntity[]
  excessesHistory: { liters: number; totalCost: number; date: Date }[]
  excessesTotals: { totalLiters: number; totalCost: number }
}

const purchaseSchema = z.object({
  liters: z.number({ error: 'Ingresa los litros' }).min(0.01, 'Los litros deben ser > 0'),
  pricePerLiter: z.number({ error: 'Ingresa el precio por litro' }).min(0.01, 'El precio debe ser > 0'),
  purchasedAt: z.string().min(1, 'La fecha es obligatoria'),
  description: z.string().optional(),
})
type PurchaseValues = z.input<typeof purchaseSchema>

const adjustSchema = z.object({
  litersDelta: z.number({ error: 'Ingresa los litros' }).refine((v) => v !== 0, 'El ajuste no puede ser 0'),
  unitCost: z.number({ error: 'Ingresa el costo por litro' }).min(0.01, 'El costo debe ser > 0').optional(),
  adjustedAt: z.string().min(1, 'La fecha es obligatoria'),
  description: z.string().optional(),
})
type AdjustValues = z.input<typeof adjustSchema>

type SubmissionStatus = 'idle' | 'success' | 'error'

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function formatNumber(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FuelTankPage({ initialSummary, initialMovements, excessesHistory, excessesTotals }: FuelTankPageProps) {
  const [summary, setSummary] = useState<FuelTankSummaryEntity | null>(initialSummary)
  const [movements, setMovements] = useState<FuelTankMovementEntity[]>(initialMovements)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  // ── Feedback states ──
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionMessage, setSubmissionMessage] = useState('')

  const purchaseForm = useForm<PurchaseValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      liters: undefined,
      pricePerLiter: undefined,
      purchasedAt: new Date().toISOString().slice(0, 16),
      description: '',
    },
  })

  const adjustForm = useForm<AdjustValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      litersDelta: undefined,
      unitCost: undefined,
      adjustedAt: new Date().toISOString().slice(0, 16),
      description: '',
    },
  })

  const capacity = summary?.tank.capacityLiters ?? null
  const litersInTank = summary?.litersInTank ?? null
  const pct = useMemo(() => {
    if (capacity == null || litersInTank == null || capacity <= 0) return null
    return Math.max(0, Math.min(100, (litersInTank / capacity) * 100))
  }, [capacity, litersInTank])

  const inputClass = [
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100',
    'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors',
  ].join(' ')

  const err = (msg?: string) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null

  const bootstrapTank = async () => {
    setIsBootstrapping(true)
    try {
      const result = await createDefaultFuelTankAction()
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      setSummary(result.data)
      toast.success('Tanque configurado')
    } finally {
      setIsBootstrapping(false)
    }
  }

  const onPurchase = purchaseForm.handleSubmit(async (values) => {
    if (!summary) {
      toast.error('Configura un tanque primero')
      return
    }

    const purchasedAt = new Date(values.purchasedAt)
    if (Number.isNaN(purchasedAt.getTime())) {
      toast.error('Fecha inválida')
      return
    }

    setIsPurchasing(true)
    try {
      const result = await registerFuelTankPurchaseAction({
        liters: values.liters,
        pricePerLiter: values.pricePerLiter,
        purchasedAt,
        description: values.description?.trim() ? values.description.trim() : null,
      })

      if (!result.ok) {
        setSubmissionStatus('error')
        setSubmissionMessage(result.error.message || 'No pudimos registrar la compra.')
        setIsFeedbackOpen(true)
        return
      }

      setSummary(result.data.summary)
      setMovements((prev) => [result.data.movement, ...prev].slice(0, 20))
      purchaseForm.reset({
        liters: undefined,
        pricePerLiter: undefined,
        purchasedAt: new Date().toISOString().slice(0, 16),
        description: '',
      })
      
      setSubmissionStatus('success')
      setSubmissionMessage('La compra ha sido registrada correctamente en el inventario y el costo promedio ha sido actualizado.')
      setIsFeedbackOpen(true)
    } finally {
      setIsPurchasing(false)
    }
  })

  const onAdjust = adjustForm.handleSubmit(async (values) => {
    if (!summary) {
      toast.error('Configura un tanque primero')
      return
    }

    const adjustedAt = new Date(values.adjustedAt)
    if (Number.isNaN(adjustedAt.getTime())) {
      toast.error('Fecha inválida')
      return
    }

    setIsAdjusting(true)
    try {
      const result = await adjustFuelTankAction({
        litersDelta: values.litersDelta,
        unitCost: values.unitCost ?? null,
        adjustedAt,
        description: values.description?.trim() ? values.description.trim() : null,
      })

      if (!result.ok) {
        toast.error(result.error.message)
        return
      }

      setSummary(result.data.summary)
      setMovements((prev) => [result.data.movement, ...prev].slice(0, 20))
      adjustForm.reset({
        litersDelta: undefined,
        unitCost: undefined,
        adjustedAt: new Date().toISOString().slice(0, 16),
        description: '',
      })
      toast.success('Ajuste registrado')
    } finally {
      setIsAdjusting(false)
    }
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Combustible</h1>
            <p className="text-sm text-on-surface-variant">Control de tanque y costos promedio</p>
          </div>
        </div>
      </header>

      {!summary ? (
        <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-stone-600 dark:text-zinc-400">
            No hay un tanque activo configurado.
          </p>
          <div className="mt-4">
            <Button type="button" onClick={bootstrapTank} disabled={isBootstrapping}>
              {isBootstrapping ? 'Configurando...' : 'Crear tanque base (20,000 L)'}
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="dashboard" className="w-full flex flex-col gap-6">
          <TabsList className="flex items-center gap-1 border-b border-outline-variant/30 w-full rounded-none bg-transparent p-0 h-auto justify-start">
            <TabsTrigger 
              value="dashboard"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 rounded-t-lg data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary outline-none"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="excesses"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 rounded-t-lg data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary outline-none"
            >
              Historial de Excedentes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="flex flex-col gap-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">
                Tanque
              </p>
              <p className="text-lg font-bold text-stone-900 dark:text-zinc-100">{summary.tank.name}</p>
              <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                Capacidad: {formatNumber(summary.tank.capacityLiters)} L
              </p>
            </div>

            <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">
                Inventario
              </p>
              <p className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                {formatNumber(summary.litersInTank)} L
              </p>
              {pct != null && (
                <div className="mt-3 h-2 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-2 bg-[#1a5c3a]" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">
                Costo promedio
              </p>
              <p className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                {summary.averageCostPerLiter != null ? `${formatMoney(summary.averageCostPerLiter)} / L` : '—'}
              </p>
              <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                Valor inventario: {formatMoney(summary.inventoryValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Compra (Entrada al tanque)</h2>
              <form onSubmit={onPurchase} className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Litros</Label>
                    <input className={inputClass} type="number" step="0.01" {...purchaseForm.register('liters', { valueAsNumber: true })} />
                    {err(purchaseForm.formState.errors.liters?.message)}
                  </div>
                  <div className="grid gap-2">
                    <Label>Precio / L (MXN)</Label>
                    <input className={inputClass} type="number" step="0.01" {...purchaseForm.register('pricePerLiter', { valueAsNumber: true })} />
                    {err(purchaseForm.formState.errors.pricePerLiter?.message)}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Fecha</Label>
                  <input className={inputClass} type="datetime-local" {...purchaseForm.register('purchasedAt')} />
                  {err(purchaseForm.formState.errors.purchasedAt?.message)}
                </div>
                <div className="grid gap-2">
                  <Label>Descripción (opcional)</Label>
                  <Input placeholder="Ej. Compra diésel proveedor X" {...purchaseForm.register('description')} />
                </div>
                <Button type="submit" disabled={isPurchasing}>
                  {isPurchasing ? 'Registrando...' : 'Registrar compra'}
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Ajuste (Kardex)</h2>
              <form onSubmit={onAdjust} className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Litros (+ / -)</Label>
                    <input className={inputClass} type="number" step="0.01" {...adjustForm.register('litersDelta', { valueAsNumber: true })} />
                    {err(adjustForm.formState.errors.litersDelta?.message)}
                  </div>
                  <div className="grid gap-2">
                    <Label>Costo / L (opcional)</Label>
                    <input className={inputClass} type="number" step="0.01" {...adjustForm.register('unitCost', { valueAsNumber: true })} />
                    {err(adjustForm.formState.errors.unitCost?.message)}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Fecha</Label>
                  <input className={inputClass} type="datetime-local" {...adjustForm.register('adjustedAt')} />
                  {err(adjustForm.formState.errors.adjustedAt?.message)}
                </div>
                <div className="grid gap-2">
                  <Label>Motivo (opcional)</Label>
                  <Input placeholder="Ej. Ajuste por medición física" {...adjustForm.register('description')} />
                </div>
                <Button type="submit" variant="outline" disabled={isAdjusting}>
                  {isAdjusting ? 'Registrando...' : 'Registrar ajuste'}
                </Button>
              </form>
            </div>
          </div>

          <FuelTankMovementsCard movements={movements} title="Últimos movimientos" />
          </TabsContent>

          <TabsContent value="excesses" className="flex flex-col gap-6 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
                  Total Litros Recuperados
                </p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">
                  +{formatNumber(excessesTotals.totalLiters)} L
                </p>
              </div>
              <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">
                  Valor Total Ahorrado
                </p>
                <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100 mt-1">
                  {formatMoney(excessesTotals.totalCost)} MXN
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <div className="p-5 border-b border-stone-100 dark:border-zinc-800">
                <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Eventos de Excedente Registrados</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-stone-500 dark:text-zinc-400 uppercase bg-stone-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                      <th className="px-5 py-3 font-medium text-right">Lts Extra</th>
                      <th className="px-5 py-3 font-medium text-right">Valor Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excessesHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-stone-500">
                          No hay registros de excedentes.
                        </td>
                      </tr>
                    ) : (
                      excessesHistory.map((excess, idx) => (
                        <tr key={idx} className="border-b border-stone-50 dark:border-zinc-800/50 last:border-0 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-stone-900 dark:text-zinc-100">
                            {excess.date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right font-medium text-amber-600 dark:text-amber-400">
                            +{formatNumber(excess.liters)} L
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-stone-600 dark:text-zinc-400">
                            {formatMoney(excess.totalCost)} MXN
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Action Feedback Dialog ── */}
      <AnimatePresence mode="wait">
        {isFeedbackOpen && (
          <Dialog key="feedback" isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} size="md">
            <ActionFeedback
              status={submissionStatus === 'idle' ? 'success' : submissionStatus}
              title={submissionStatus === 'success' ? '¡Compra Registrada!' : 'Error en la operación'}
              message={submissionMessage}
              primaryActionLabel="Finalizar"
              onPrimaryAction={() => setIsFeedbackOpen(false)}
            />
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
