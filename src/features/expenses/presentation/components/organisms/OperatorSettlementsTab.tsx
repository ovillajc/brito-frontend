'use client'

import { useCallback, useMemo, useState } from 'react'
import { HandCoins, Trash2, Download, Search, ChevronLeft, ChevronRight, Unlink, User, Truck, Eye, RotateCcw } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { CrudDataTable, type CrudColumn, type CrudRowAction } from '@/src/core/presentation/components/organisms/CrudDataTable'
import {
  useCreateOperatorSettlement,
  useDeleteOperatorSettlement,
  useReopenOperatorSettlement,
  useUnlinkExpenseFromSettlement,
  useUnlinkExpenseFromTrip,
  useExpenseAdvances,
  useTripExpenseAssignmentKpis,
} from '../../hooks/use-expense-assignments'
import { useExpenses } from '../../hooks/use-expenses'
import { GetExpenses } from '../../../application/GetExpenses'
import { SupabaseExpensesRepository } from '../../../infrastructure/repositories/SupabaseExpensesRepository'
import type { OperatorSettlementKpiEntity } from '../../../domain/entities/operator-settlement-entity'
import type { TripExpenseAssignmentKpiEntity } from '../../../domain/entities/expense-assignment-entity'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { OperatorSettlementDialog } from './OperatorSettlementDialog'
import { TripSettlementDialog } from './TripSettlementDialog'
import { OperatorSettlementCard } from './OperatorSettlementCard'
import { AssignedTripsGrid } from './AssignedTripsGrid'
import { SegmentedControl } from '@/src/core/presentation/components/ui/segmented-control'
import * as XLSX from 'xlsx'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { useQuery } from '@tanstack/react-query'
import type { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { toast } from 'sonner'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmtDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const SETTLEMENTS_PER_PAGE = 6

function normalizeText(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

interface OperatorSettlementsTabProps {
  canManage: boolean
  kpis: OperatorSettlementKpiEntity[]
}

export function OperatorSettlementsTab({ canManage, kpis }: OperatorSettlementsTabProps) {
  const createSettlement = useCreateOperatorSettlement()
  const deleteSettlementMutation = useDeleteOperatorSettlement()
  const reopenSettlementMutation = useReopenOperatorSettlement()
  const unlinkExpenseMutation = useUnlinkExpenseFromSettlement()
  const unlinkFromTripMutation = useUnlinkExpenseFromTrip()
  const advancesQuery = useExpenseAdvances()
  const tripKpisQuery = useTripExpenseAssignmentKpis()

  const [activeSubTab, setActiveSubTab] = useState<'operator' | 'trip'>('operator')

  const [selectedSettlement, setSelectedSettlement] = useState<OperatorSettlementKpiEntity | null>(null)
  const [selectedTripKpi, setSelectedTripKpi] = useState<TripExpenseAssignmentKpiEntity | null>(null)
  const [isSettlementOpen, setIsSettlementOpen] = useState(false)
  const [settlementToDelete, setSettlementToDelete] = useState<OperatorSettlementKpiEntity | null>(null)
  const [isCreateSettlementOpen, setIsCreateSettlementOpen] = useState(false)
  const [newSettlementOperatorId, setNewSettlementOperatorId] = useState('')
  const [newSettlementPreviousBalance, setNewSettlementPreviousBalance] = useState<string>('')

  const activeSettlement = useMemo(() => {
    if (!selectedSettlement) return null
    return kpis.find((k) => k.settlementId === selectedSettlement.settlementId) ?? selectedSettlement
  }, [kpis, selectedSettlement])

  const linkedExpensesQuery = useExpenses(
    activeSettlement ? { settlementId: activeSettlement.settlementId, limit: 100 } : undefined
  )
  const tripExpensesQuery = useExpenses(
    selectedTripKpi ? { tripId: selectedTripKpi.tripId, limit: 100 } : undefined
  )
  const tripExpenses = tripExpensesQuery.data ?? []

  const unlinkedExpensesQuery = useExpenses(
    { onlyUnlinked: true, operatorId: activeSettlement?.operatorId },
    { enabled: !!activeSettlement && isSettlementOpen }
  )

  const unlinkedExpensesFormatted = useMemo(() => {
    return (unlinkedExpensesQuery.data ?? []).map((exp: ExpenseEntity) => ({
      id: exp.id,
      tripId: exp.tripId,
      isFuelTankPurchase:
        normalizeText(exp.categoryName) === 'combustible' &&
        normalizeText(exp.description).includes('diesel') &&
        normalizeText(exp.description).includes('tanque'),
      description: exp.description ?? 'Sin descripción',
      amount: exp.amount,
      expenseDate: exp.expenseDate ? fmtDate.format(new Date(exp.expenseDate)) : undefined,
      rawExpenseDate: exp.expenseDate,
    }))
  }, [unlinkedExpensesQuery.data])

  const linkedExpenses = linkedExpensesQuery.data ?? []

  const openSettlements = useMemo(() => kpis.filter((k) => k.status === 'open'), [kpis])
  const closedSettlements = useMemo(() => kpis.filter((k) => k.status === 'closed'), [kpis])
  const [settlementSearch, setSettlementSearch] = useState('')
  const [openSettlementsPage, setOpenSettlementsPage] = useState(1)

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

  const operatorNames = useMemo(() => {
    return Object.fromEntries(
      (employeesQuery.data ?? []).map((employee) => [employee.id, employee.fullName])
    )
  }, [employeesQuery.data])

  const getOperatorLabel = useCallback((settlement: OperatorSettlementKpiEntity) => {
    if (settlement.operatorName) return settlement.operatorName
    if (settlement.operatorId && operatorNames[settlement.operatorId]) return operatorNames[settlement.operatorId]
    return settlement.operatorId
  }, [operatorNames])

  const normalizedSettlementSearch = settlementSearch.trim().toLowerCase()

  const filteredOpenSettlements = useMemo(() => {
    if (!normalizedSettlementSearch) return openSettlements
    return openSettlements.filter((k) =>
      (k.operatorName ?? k.operatorId).toLowerCase().includes(normalizedSettlementSearch)
    )
  }, [normalizedSettlementSearch, openSettlements])

  const filteredClosedSettlements = useMemo(() => {
    if (!normalizedSettlementSearch) return closedSettlements
    return closedSettlements.filter((k) => getOperatorLabel(k).toLowerCase().includes(normalizedSettlementSearch))
  }, [normalizedSettlementSearch, closedSettlements, getOperatorLabel])

  const openSettlementsPageCount = Math.max(1, Math.ceil(filteredOpenSettlements.length / SETTLEMENTS_PER_PAGE))

  const safeOpenSettlementsPage = Math.min(openSettlementsPage, openSettlementsPageCount)

  const paginatedOpenSettlements = useMemo(() => {
    const start = (safeOpenSettlementsPage - 1) * SETTLEMENTS_PER_PAGE
    return filteredOpenSettlements.slice(start, start + SETTLEMENTS_PER_PAGE)
  }, [filteredOpenSettlements, safeOpenSettlementsPage])

  const openSettlementDialog = useCallback((s: OperatorSettlementKpiEntity) => {
    setSelectedSettlement(s)
    setIsSettlementOpen(true)
  }, [])

  const handleCreateSettlement = async (operatorId: string) => {
    if (!operatorId) return
    try {
      const previousBalance = parseFloat(newSettlementPreviousBalance) || 0
      await createSettlement.mutateAsync({ operatorId, previousBalance })
      toast.success('Ajuste de cuentas creado')
      setIsCreateSettlementOpen(false)
      setNewSettlementOperatorId('')
      setNewSettlementPreviousBalance('')
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

  const handleReopenSettlement = useCallback(async (k: OperatorSettlementKpiEntity) => {
    try {
      await reopenSettlementMutation.mutateAsync({ settlementId: k.settlementId })
      toast.success('Ajuste de cuentas reabierto')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al reabrir ajuste')
    }
  }, [reopenSettlementMutation])

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

  const handleExportIndividualSettlement = useCallback(async (k: OperatorSettlementKpiEntity) => {
    try {
      toast.info('Generando Excel, por favor espera...')
      const expensesRepo = new SupabaseExpensesRepository()
      const result = await GetExpenses(expensesRepo, { settlementId: k.settlementId })
      
      if (!result.ok) throw new Error(result.error.message)
      const expenses = result.data

      const aoa: (string | number)[][] = [
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
  }, [])

  const linkedAdvances = useMemo(() => {
    let advances = (advancesQuery.data ?? []).filter((a) => !!a.tripId)
    if (normalizedSettlementSearch) {
      advances = advances.filter((a) => {
        const search = normalizedSettlementSearch
        return (
          a.operatorName?.toLowerCase().includes(search) ||
          a.tripFolio?.toLowerCase().includes(search) ||
          a.operatorId?.toLowerCase().includes(search)
        )
      })
    }
    return advances
  }, [advancesQuery.data, normalizedSettlementSearch])

  type ClosedSettlementRow = OperatorSettlementKpiEntity & { id: string }

  const closedSettlementRows = useMemo<ClosedSettlementRow[]>(() => {
    return filteredClosedSettlements.map((settlement) => ({
      ...settlement,
      id: settlement.settlementId,
    }))
  }, [filteredClosedSettlements])

  const closedSettlementOperatorOptions = useMemo(() => {
    const labels = Array.from(new Set(closedSettlementRows.map((row) => getOperatorLabel(row))))
    return labels
      .filter((label) => label.trim().length > 0)
      .sort((a, b) => a.localeCompare(b, 'es-MX'))
      .map((label) => ({ label, value: label }))
  }, [closedSettlementRows, getOperatorLabel])

  const closedSettlementColumns = useMemo<CrudColumn<ClosedSettlementRow>[]>(() => {
    return [
      {
        header: 'Operador',
        filter: {
          type: 'select',
          options: closedSettlementOperatorOptions,
          placeholder: 'Todos',
          getValue: (row) => getOperatorLabel(row),
        },
        accessor: (row) => getOperatorLabel(row),
        cell: (row) => (
          <button
            type="button"
            onClick={() => openSettlementDialog(row)}
            className="font-semibold text-stone-900 hover:text-[#1a5c3a] dark:text-zinc-100 dark:hover:text-emerald-400 transition-colors"
          >
            {getOperatorLabel(row)}
          </button>
        ),
      },
      {
        header: 'Apertura',
        accessor: (row) => row.openedAt.getTime(),
        sortable: true,
        filter: false,
        cell: (row) => <span className="text-stone-600 dark:text-zinc-300">{fmtDate.format(row.openedAt)}</span>,
      },
      {
        header: 'Cierre',
        accessor: (row) => row.closedAt?.getTime() ?? 0,
        sortable: true,
        filter: false,
        cell: (row) => <span className="text-stone-600 dark:text-zinc-300">{row.closedAt ? fmtDate.format(row.closedAt) : '—'}</span>,
      },
      {
        header: 'Asignado',
        accessor: (row) => row.assignedAmount,
        sortable: true,
        filter: false,
        headerClassName: 'text-right',
        className: 'text-right font-medium',
        cell: (row) => money.format(row.assignedAmount),
      },
      {
        header: 'Comprobado',
        accessor: (row) => row.spentAmount,
        sortable: true,
        filter: false,
        headerClassName: 'text-right',
        className: 'text-right font-medium',
        cell: (row) => money.format(row.spentAmount),
      },
      {
        header: 'Balance',
        accessor: (row) => row.balanceAmount,
        sortable: true,
        filter: false,
        headerClassName: 'text-right',
        className: 'text-right font-bold',
        cell: (row) => {
          const balanceTone =
            row.balanceAmount > 0
              ? 'text-emerald-700 dark:text-emerald-400'
              : row.balanceAmount < 0
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-stone-600 dark:text-zinc-300'

          return <span className={balanceTone}>{money.format(row.balanceAmount)}</span>
        },
      },
      {
        header: 'Gastos',
        accessor: (row) => row.expenseCount,
        sortable: true,
        filter: false,
        headerClassName: 'text-right',
        className: 'text-right font-medium',
        cell: (row) => row.expenseCount,
      },
    ]
  }, [closedSettlementOperatorOptions, getOperatorLabel, openSettlementDialog])

  const closedSettlementRowActions = useMemo<CrudRowAction<ClosedSettlementRow>[]>(() => {
    return [
      {
        label: 'Ver ajuste',
        icon: <Eye className="size-4" />,
        variant: 'outline',
        onClick: (row) => openSettlementDialog(row),
      },
      {
        label: 'Exportar ajuste',
        icon: <Download className="size-4" />,
        onClick: (row) => handleExportIndividualSettlement(row),
      },
      {
        label: 'Reabrir ajuste',
        icon: <RotateCcw className="size-4" />,
        className: 'text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300',
        isVisible: () => canManage,
        onClick: (row) => handleReopenSettlement(row),
      },
    ]
  }, [canManage, handleExportIndividualSettlement, handleReopenSettlement, openSettlementDialog])

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Cabecera unificada */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
            {activeSubTab === 'operator' ? 'Ajustes por Operador' : 'Ajustes por Viaje'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-500">
            {activeSubTab === 'operator' 
              ? 'Ajustes de cuentas abiertos y cerrados por operador.' 
              : 'Ajustes de cuentas específicos para un viaje.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl
            value={activeSubTab}
            onChange={(v) => setActiveSubTab(v)}
            options={[
              { value: 'operator', label: 'Operador', icon: User },
              { value: 'trip', label: 'Viaje', icon: Truck },
            ]}
          />
          
          <div className="relative w-full sm:w-56 ml-0 sm:ml-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              value={settlementSearch}
              onChange={(e) => {
                setSettlementSearch(e.target.value)
                setOpenSettlementsPage(1)
              }}
              placeholder={activeSubTab === 'operator' ? "Buscar operador..." : "Buscar operador o viaje..."}
              className="h-9 rounded-xl border-stone-200 pl-9 dark:border-zinc-800"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="gap-1 rounded-xl bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 text-stone-700 dark:text-zinc-300"
          >
            <Download className="size-4" /> Exportar
          </Button>
        </div>
      </div>

      {activeSubTab === 'operator' && (
        <>
          {/* Cuentas abiertas */}
          <div className="flex items-center justify-between mt-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Cuentas pendientes</h3>
            </div>
            <Badge variant="secondary">{filteredOpenSettlements.length}/{openSettlements.length}</Badge>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
          {filteredOpenSettlements.length === 0 ? (
            <div className="col-span-full p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-stone-500 dark:text-zinc-500">
              <HandCoins className="h-8 w-8 mb-2 opacity-20" />
              <p>{normalizedSettlementSearch ? 'No hay operadores que coincidan con la búsqueda.' : 'No hay cuentas pendientes por liquidar.'}</p>
            </div>
          ) : (
            paginatedOpenSettlements.map((k) => (
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

        {filteredOpenSettlements.length > SETTLEMENTS_PER_PAGE && (
          <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Mostrando {(safeOpenSettlementsPage - 1) * SETTLEMENTS_PER_PAGE + 1}-
              {Math.min(safeOpenSettlementsPage * SETTLEMENTS_PER_PAGE, filteredOpenSettlements.length)} de {filteredOpenSettlements.length} ajustes abiertos
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled={safeOpenSettlementsPage <= 1}
                onClick={() => setOpenSettlementsPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <span className="min-w-20 text-center text-xs font-medium text-stone-600 dark:text-zinc-300">
                {safeOpenSettlementsPage} / {openSettlementsPageCount}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg"
                disabled={safeOpenSettlementsPage >= openSettlementsPageCount}
                onClick={() => setOpenSettlementsPage((page) => Math.min(openSettlementsPageCount, page + 1))}
              >
                Siguiente
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Cuentas cerradas</h2>
            <p className="text-sm text-stone-500 dark:text-zinc-500">Ajustes ya liquidados (historial reciente)</p>
          </div>
          <Badge variant="secondary">{filteredClosedSettlements.length}/{closedSettlements.length}</Badge>
        </div>

        <CrudDataTable<ClosedSettlementRow>
          data={closedSettlementRows}
          isLoading={false}
          columns={closedSettlementColumns}
          rowActions={closedSettlementRowActions}
          pageSize={SETTLEMENTS_PER_PAGE}
          searchPlaceholder="Buscar operador..."
          searchFilter={(row, term) =>
            [
              getOperatorLabel(row),
              fmtDate.format(row.openedAt),
              row.closedAt ? fmtDate.format(row.closedAt) : '',
            ].some((value) => value.toLowerCase().includes(term))
          }
          emptyState={{
            icon: HandCoins,
            title: normalizedSettlementSearch ? 'Sin resultados' : 'Sin cuentas cerradas',
            description: normalizedSettlementSearch
              ? 'No hay cuentas cerradas para el operador buscado.'
              : 'No hay cuentas cerradas recientemente.',
          }}
        />
      </>
    )}

    {activeSubTab === 'trip' && (
        <AssignedTripsGrid
          linkedAdvances={linkedAdvances}
          canManage={canManage}
          tripKpisData={tripKpisQuery.data}
          operatorSettlements={kpis}
          operatorNames={operatorNames}
          searchQuery={settlementSearch}
          onSelectTripKpi={setSelectedTripKpi}
          onSelectOperatorSettlement={(settlement) => {
            setSelectedSettlement(settlement)
            setIsSettlementOpen(true)
          }}
        />
      )}

      <TripSettlementDialog
        isOpen={!!selectedTripKpi}
        onClose={() => setSelectedTripKpi(null)}
        trip={selectedTripKpi}
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tripExpensesQuery.isLoading ? (
            <p className="text-sm text-stone-500 dark:text-zinc-500 p-4 text-center">Cargando gastos...</p>
          ) : tripExpenses.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-zinc-500 p-4 text-center">
              No hay gastos vinculados a este viaje.
            </p>
          ) : (
            tripExpenses.map((exp: ExpenseEntity) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate max-w-[200px]">
                    {exp.description}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-zinc-500">
                    {exp.categoryName} · {exp.expenseDate ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(exp.expenseDate)) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-900 dark:text-zinc-100">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(exp.amount)}
                  </span>
                  {!selectedTripKpi?.isSettled && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={async () => {
                        try {
                          await unlinkFromTripMutation.mutateAsync(exp.id)
                          toast.success('Gasto desvinculado del viaje')
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
      </TripSettlementDialog>

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

      {isCreateSettlementOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100 mb-1">Nuevo Ajuste de Cuentas</h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mb-6">
                Selecciona el operador y captura el saldo previo si existe un adeudo anterior al sistema.
              </p>
              
              <div className="space-y-4">
                {/* Operador */}
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

                {/* Saldo previo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-900 dark:text-zinc-100">
                    Saldo previo ($MXN) <span className="text-stone-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newSettlementPreviousBalance}
                    onChange={(e) => setNewSettlementPreviousBalance(e.target.value)}
                    disabled={createSettlement.isPending}
                    className="w-full h-12 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 disabled:opacity-50"
                  />
                  {/* Indicador visual del signo */}
                  {newSettlementPreviousBalance && !isNaN(parseFloat(newSettlementPreviousBalance)) && parseFloat(newSettlementPreviousBalance) !== 0 && (
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border',
                      parseFloat(newSettlementPreviousBalance) > 0
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                    )}>
                      <span className="text-base">{parseFloat(newSettlementPreviousBalance) > 0 ? '📥' : '📤'}</span>
                      <span>
                        {parseFloat(newSettlementPreviousBalance) > 0
                          ? `El operador le debe ${money.format(Math.abs(parseFloat(newSettlementPreviousBalance)))} a la empresa`
                          : `La empresa le debe ${money.format(Math.abs(parseFloat(newSettlementPreviousBalance)))} al operador`}
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-stone-400 dark:text-zinc-500">
                    Positivo (+) = operador debe a la empresa · Negativo (−) = empresa debe al operador
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8">
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-12"
                  onClick={() => {
                    setIsCreateSettlementOpen(false)
                    setNewSettlementOperatorId('')
                    setNewSettlementPreviousBalance('')
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
