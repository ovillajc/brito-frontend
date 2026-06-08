'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, HandCoins, Receipt, CheckCircle2, Link2, Plus, Unlink, Trash2, FolderOpen, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  useExpenseAdvances,
  useOperatorSettlementKpis,
  useCreateOperatorSettlement,
  useDeleteExpenseAdvance,
  useUnlinkExpenseFromSettlement,
  useDeleteOperatorSettlement,
  useReopenOperatorSettlement,
} from '../../hooks/use-expense-assignments'
import { useExpenses } from '../../hooks/use-expenses'
import { GetExpenses } from '../../../application/GetExpenses'
import { SupabaseExpensesRepository } from '../../../infrastructure/repositories/SupabaseExpensesRepository'
import type { ExpenseAdvanceEntity } from '../../../domain/entities/expense-assignment-entity'
import type { OperatorSettlementKpiEntity } from '../../../domain/entities/operator-settlement-entity'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { ExpenseAdvanceWizard } from '../organisms/ExpenseAdvanceWizard'
import { ExpenseAdvanceDetailsDialog } from '../organisms/ExpenseAdvanceDetailsDialog'
import { TripSettlementDialog } from '../organisms/TripSettlementDialog'
import { OperatorSettlementDialog } from '../organisms/OperatorSettlementDialog'
import { OperatorSettlementCard } from '../organisms/OperatorSettlementCard'
import * as XLSX from 'xlsx'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { useQuery } from '@tanstack/react-query'
import type { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { toast } from 'sonner'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmtDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

export default function ExpenseAssignmentsPage() {
  const advancesQuery = useExpenseAdvances()
  const settlementKpisQuery = useOperatorSettlementKpis(200)
  const createSettlement = useCreateOperatorSettlement()

  const canManage = useAuthStore((state) => state.hasPermission('expenses:manage'))

  const [isAdvanceWizardOpen, setIsAdvanceWizardOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create')
  const [selectedAdvance, setSelectedAdvance] = useState<ExpenseAdvanceEntity | undefined>(undefined)

  const deleteAdvance = useDeleteExpenseAdvance()
  const [selectedSettlement, setSelectedSettlement] = useState<OperatorSettlementKpiEntity | null>(null)
  const [isSettlementOpen, setIsSettlementOpen] = useState(false)
  const [settlementToDelete, setSettlementToDelete] = useState<OperatorSettlementKpiEntity | null>(null)

  const deleteSettlementMutation = useDeleteOperatorSettlement()

  const advances = advancesQuery.data ?? []
  const kpis = settlementKpisQuery.data ?? []

  const unlinkExpenseMutation = useUnlinkExpenseFromSettlement()

  const activeSettlement = useMemo(() => {
    if (!selectedSettlement) return null
    return kpis.find((k) => k.settlementId === selectedSettlement.settlementId) ?? selectedSettlement
  }, [kpis, selectedSettlement])

  const linkedExpensesQuery = useExpenses(
    { settlementId: activeSettlement?.settlementId },
    { enabled: !!activeSettlement }
  )

  const unlinkedExpensesQuery = useExpenses(
    { onlyUnlinked: true, operatorId: activeSettlement?.operatorId },
    { enabled: !!activeSettlement && isSettlementOpen }
  )

  const unlinkedExpensesFormatted = useMemo(() => {
    return (unlinkedExpensesQuery.data ?? []).map((exp: ExpenseEntity) => ({
      id: exp.id,
      description: exp.description ?? 'Sin descripción',
      amount: exp.amount,
      expenseDate: exp.expenseDate ? fmtDate.format(new Date(exp.expenseDate)) : undefined,
    }))
  }, [unlinkedExpensesQuery.data])

  const linkedExpenses = linkedExpensesQuery.data ?? []

  const openSettlements = useMemo(() => kpis.filter((k) => k.status === 'open'), [kpis])
  const closedSettlements = useMemo(() => kpis.filter((k) => k.status === 'closed'), [kpis])

  const employeesQuery = useQuery({
    queryKey: ['expenses', 'assignments', 'employees'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const operators = useMemo(() => {
    return (employeesQuery.data ?? []).filter((e) => e.isOperator && e.isActive)
  }, [employeesQuery.data])

  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = useState(false)
  const [newSettlementOperatorId, setNewSettlementOperatorId] = useState('')

  const totals = useMemo(() => {
    const assigned = kpis.reduce((acc, k) => acc + k.assignedAmount, 0)
    const spent = kpis.reduce((acc, k) => acc + k.spentAmount, 0)
    return { assigned, spent, diff: spent - assigned }
  }, [kpis])

  const ADVANCE_COLUMNS: CrudColumn<ExpenseAdvanceEntity>[] = [
    {
      header: 'Asignación',
      cell: (a) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
            {a.tripFolio ?? 'Sin viaje'}
          </span>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[260px]">
            {a.operatorName ?? a.operatorId} · {a.unitLabel ?? '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Monto',
      cell: (a) => money.format(a.amount),
      className: 'text-sm text-stone-600 dark:text-zinc-400',
    },
    {
      header: 'Método',
      cell: (a) => (
        <Badge variant="outline" className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300">
          {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
        </Badge>
      ),
      className: 'w-[140px]',
    },
    {
      header: 'Fecha',
      cell: (a) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(a.assignedAt)),
      className: 'text-sm text-stone-600 dark:text-zinc-400',
    },
    {
      header: 'Estado',
      cell: (a) =>
        a.tripId ? (
          <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">
            Vinculado
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
            Pendiente
          </Badge>
        ),
      className: 'w-[120px]',
    },
  ]

  const openAdvanceWizard = (mode: 'create' | 'edit', advance?: ExpenseAdvanceEntity) => {
    setWizardMode(mode)
    setSelectedAdvance(advance)
    setIsAdvanceWizardOpen(true)
  }

  const openAdvanceDetails = (advance: ExpenseAdvanceEntity) => {
    setSelectedAdvance(advance)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteAdvance = async (id: string) => {
    try {
      await deleteAdvance.mutateAsync(id)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: { message: e instanceof Error ? e.message : 'Error desconocido' } }
    }
  }

  const openSettlementDialog = (s: OperatorSettlementKpiEntity) => {
    setSelectedSettlement(s)
    setIsSettlementOpen(true)
  }

  const handleCreateSettlement = async (operatorId: string) => {
    if (!operatorId) return
    try {
      await createSettlement.mutateAsync({ operatorId })
      toast.success('Ajuste de cuentas creado')
      setIsCreateSettlementOpen(false)
      setNewSettlementOperatorId('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear ajuste')
    }
  }

  const handleDeleteSettlement = async () => {
    if (!settlementToDelete) return
    try {
      await deleteSettlementMutation.mutateAsync(settlementToDelete.settlementId)
      toast.success('Ajuste de cuentas eliminado')
      setSettlementToDelete(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar ajuste')
    }
  }

  const reopenSettlementMutation = useReopenOperatorSettlement()

  const handleReopenSettlement = async (k: OperatorSettlementKpiEntity) => {
    try {
      await reopenSettlementMutation.mutateAsync({ settlementId: k.settlementId })
      toast.success('Ajuste de cuentas reabierto')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al reabrir ajuste')
    }
  }

  const handleExportExcel = () => {
    const dataToExport = [...openSettlements, ...closedSettlements]
    
    if (dataToExport.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    const rows = dataToExport.map(k => ({
      'Operador': k.operatorName ?? k.operatorId,
      'Estado': k.status === 'open' ? 'Abierto' : 'Cerrado',
      'Fecha Apertura': k.openedAt ? fmtDate.format(k.openedAt) : '',
      'Fecha Cierre': k.closedAt ? fmtDate.format(k.closedAt) : '',
      'Cantidad Enviada (MXN)': k.assignedAmount,
      'Cantidad Comprobada (MXN)': k.spentAmount,
      'Balance Neto (MXN)': k.balanceAmount,
      'No. Gastos': k.expenseCount
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ajustes')
    
    XLSX.writeFile(workbook, `Ajustes_Cuentas_Operadores_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleExportIndividualSettlement = async (k: OperatorSettlementKpiEntity) => {
    try {
      toast.info('Generando Excel, por favor espera...')
      const expensesRepo = new SupabaseExpensesRepository()
      const result = await GetExpenses(expensesRepo, { settlementId: k.settlementId })
      
      if (!result.ok) throw new Error(result.error.message)
      const expenses = result.data

      const aoa: any[][] = [
        ['RESUMEN DE AJUSTE DE CUENTAS'],
        [],
        ['Operador', k.operatorName ?? k.operatorId],
        ['Estado', k.status === 'open' ? 'Abierto' : 'Cerrado'],
        ['Fecha Apertura', k.openedAt ? fmtDate.format(k.openedAt) : ''],
        ['Fecha Cierre', k.closedAt ? fmtDate.format(k.closedAt) : ''],
        ['Cantidad Enviada (MXN)', k.assignedAmount],
        ['Cantidad Comprobada (MXN)', k.spentAmount],
        ['Balance Neto (MXN)', k.balanceAmount],
        ['No. Gastos vinculados', k.expenseCount],
        [],
        ['DETALLE DE GASTOS'],
        ['Detalle del gasto', 'Clasificación', 'Fecha', 'Frecuencia', 'Monto']
      ]

      if (expenses.length > 0) {
        expenses.forEach(exp => {
          aoa.push([
            exp.description ?? '',
            exp.categoryName ?? 'General',
            exp.expenseDate ? fmtDate.format(exp.expenseDate) : '',
            exp.frequency ? (exp.frequency.charAt(0).toUpperCase() + exp.frequency.slice(1)) : 'Extraordinario',
            exp.amount
          ])
        })
      } else {
        aoa.push(['(No hay gastos vinculados a este ajuste)'])
      }

      const worksheet = XLSX.utils.aoa_to_sheet(aoa)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ajuste de Cuentas')

      const fileName = `Ajuste_${k.operatorName ?? k.operatorId}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success('Excel generado exitosamente')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al generar excel del ajuste')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HandCoins className="size-4 text-primary" />
              Cantidad Enviada
            </CardTitle>
            <CardDescription>Total adelantos en ajustes activos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.assigned)}</CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Cantidad Comprobada
            </CardTitle>
            <CardDescription>Gastos vinculados a ajustes</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.spent)}</CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {totals.diff >= 0 ? (
                <AlertTriangle className="size-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-600" />
              )}
              Balance Neto
            </CardTitle>
            <CardDescription>Comprobado - Enviado</CardDescription>
          </CardHeader>
          <CardContent className={cn('text-2xl font-bold', totals.diff >= 0 ? 'text-amber-700' : 'text-emerald-700')}>
            {money.format(totals.diff)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Ajustes por operador ── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Cuentas pendientes</h2>
              <p className="text-sm text-stone-500 dark:text-zinc-500">
                Ajustes de cuentas abiertos por operador.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportExcel}
                className="gap-1 rounded-xl bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300"
              >
                <Download className="size-4" /> Exportar
              </Button>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => setIsCreateSettlementOpen(true)}
                  className="gap-1 rounded-xl bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white"
                >
                  <Plus className="size-4" /> Nuevo Ajuste
                </Button>
              )}
              <Badge variant="secondary">{openSettlements.length}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
            {openSettlements.length === 0 ? (
              <div className="col-span-full p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-stone-500 dark:text-zinc-500">
                <HandCoins className="h-8 w-8 mb-2 opacity-20" />
                <p>No hay cuentas pendientes por liquidar.</p>
              </div>
            ) : (
              openSettlements.map((k) => (
                <OperatorSettlementCard
                  key={k.settlementId}
                  settlement={k}
                  canManage={canManage}
                  onClick={() => openSettlementDialog(k)}
                  onDelete={(e) => {
                    e.stopPropagation()
                    setSettlementToDelete(k)
                  }}
                  onExport={(e) => {
                    e.stopPropagation()
                    handleExportIndividualSettlement(k)
                  }}
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Cuentas cerradas</h2>
              <p className="text-sm text-stone-500 dark:text-zinc-500">Ajustes ya liquidados (historial reciente)</p>
            </div>
            <Badge variant="secondary">{closedSettlements.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
            {closedSettlements.length === 0 ? (
              <div className="col-span-full p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 text-sm text-stone-600 dark:text-zinc-400">
                No hay cuentas cerradas recientemente.
              </div>
            ) : (
              closedSettlements.slice(0, 10).map((k) => (
                <OperatorSettlementCard
                  key={k.settlementId}
                  settlement={k}
                  canManage={canManage}
                  isClosed={true}
                  onClick={() => openSettlementDialog(k)}
                  onDelete={(e) => {
                    e.stopPropagation()
                    setSettlementToDelete(k)
                  }}
                  onReopen={(e) => {
                    e.stopPropagation()
                    handleReopenSettlement(k)
                  }}
                  onExport={(e) => {
                    e.stopPropagation()
                    handleExportIndividualSettlement(k)
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Adelantos ── */}
        <div className="flex flex-col gap-4">
          <CrudDataTable<ExpenseAdvanceEntity>
            canManage={canManage}
            data={advances}
            isLoading={advancesQuery.isLoading}
            columns={ADVANCE_COLUMNS}
            searchPlaceholder="Buscar por operador o folio..."
            searchFilter={(row, term) =>
              [row.operatorName, row.tripFolio, row.unitLabel, row.notes].some((v) => v?.toLowerCase().includes(term))
            }
            actionLabel="Nueva Asignación"
            onAction={() => openAdvanceWizard('create')}
            onView={openAdvanceDetails}
            onEdit={(a) => openAdvanceWizard('edit', a)}
            onDelete={handleDeleteAdvance}
            deleteConfirmTitle={(a) => a.tripId ? '¿Eliminar asignación vinculada?' : '¿Eliminar asignación?'}
            deleteConfirmDescription={(a) =>
              a.tripId
                ? 'Esta asignación está vinculada a un viaje. Eliminarla afectará las cuentas del viaje. ¿Estás seguro de que deseas eliminarla permanentemente?'
                : 'Esta acción es irreversible. El registro será eliminado permanentemente.'
            }
            emptyState={{
              icon: Link2,
              title: 'Sin asignaciones',
              description: 'Registra una asignación de efectivo/transferencia para un operador.',
            }}
          />
        </div>
      </div>

      {/* Diálogo de ajuste de cuentas por operador */}
      <OperatorSettlementDialog
        isOpen={isSettlementOpen}
        onClose={() => { setIsSettlementOpen(false); setSelectedSettlement(null) }}
        settlement={activeSettlement}
        unlinkedExpenses={unlinkedExpensesFormatted}
      >
        {activeSettlement && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {linkedExpenses.length === 0 ? (
              <p className="text-sm text-stone-500 dark:text-zinc-500 p-4 text-center">
                No hay gastos vinculados a este ajuste de cuentas.
              </p>
            ) : (
              linkedExpenses.map((exp: ExpenseEntity) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {exp.description}
                    </span>
                    <span className="text-[11px] text-stone-500 dark:text-zinc-500">
                      {exp.categoryName} · {exp.expenseDate ? fmtDate.format(new Date(exp.expenseDate)) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                      {money.format(exp.amount)}
                    </span>
                    {activeSettlement.status === 'open' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={async () => {
                          try {
                            await unlinkExpenseMutation.mutateAsync(exp.id)
                            toast.success('Gasto desvinculado')
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'Error al desvincular')
                          }
                        }}
                      >
                        <Unlink className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </OperatorSettlementDialog>

      <ExpenseAdvanceWizard
        isOpen={isAdvanceWizardOpen}
        onClose={() => {
          setIsAdvanceWizardOpen(false)
          setSelectedAdvance(undefined)
          setWizardMode('create')
        }}
        advanceRow={selectedAdvance}
        mode={wizardMode}
      />

      <ExpenseAdvanceDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false)
          setSelectedAdvance(undefined)
        }}
        advance={selectedAdvance || null}
      />

      {isCreateSettlementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 mb-1">Nuevo Ajuste de Cuentas</h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
                Selecciona el operador al que deseas abrirle un nuevo ajuste de cuentas.
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-900 dark:text-zinc-100">Operador</label>
                <select
                  className="w-full h-12 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006d37]/30 disabled:opacity-50"
                  value={newSettlementOperatorId}
                  onChange={(e) => setNewSettlementOperatorId(e.target.value)}
                  disabled={employeesQuery.isLoading || createSettlement.isPending}
                >
                  <option value="">{employeesQuery.isLoading ? 'Cargando operadores...' : 'Selecciona un operador...'}</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>{op.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12"
                  onClick={() => {
                    setIsCreateSettlementOpen(false)
                    setNewSettlementOperatorId('')
                  }}
                  disabled={createSettlement.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full rounded-xl h-12 bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white"
                  onClick={() => handleCreateSettlement(newSettlementOperatorId)}
                  disabled={!newSettlementOperatorId || createSettlement.isPending}
                >
                  {createSettlement.isPending ? 'Creando...' : 'Crear Ajuste'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialogo de confirmación para eliminar ajuste */}
      {!!settlementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                <Trash2 className="size-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 mb-2">Eliminar ajuste de cuentas</h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
                ¿Estás seguro de que deseas eliminar el ajuste de cuentas de <strong>{settlementToDelete.operatorName ?? settlementToDelete.operatorId}</strong>? Esta acción es irreversible.
              </p>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-11"
                  onClick={() => setSettlementToDelete(null)}
                  disabled={deleteSettlementMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  className="w-full rounded-xl h-11 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteSettlement}
                  disabled={deleteSettlementMutation.isPending}
                >
                  {deleteSettlementMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
