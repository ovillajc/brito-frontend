import { useCallback, useMemo } from 'react'
import { ArrowUpRight, CheckCircle2, Clock3, Eye, ReceiptText, RotateCcw, Truck } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { CrudDataTable, type CrudColumn, type CrudRowAction } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { TripSettlementCard } from './TripSettlementCard'
import type { ExpenseAdvanceEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import type { TripExpenseAssignmentKpiEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import type { OperatorSettlementKpiEntity } from '@/src/features/expenses/domain/entities/operator-settlement-entity'
import { toast } from 'sonner'

interface AssignedTripsGridProps {
  linkedAdvances: ExpenseAdvanceEntity[]
  canManage: boolean
  tripKpisData: TripExpenseAssignmentKpiEntity[] | undefined
  onSelectTripKpi: (kpi: TripExpenseAssignmentKpiEntity) => void
  operatorSettlements: OperatorSettlementKpiEntity[]
  operatorNames?: Record<string, string>
  searchQuery?: string
  onSelectOperatorSettlement?: (settlement: OperatorSettlementKpiEntity) => void
}

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

function getTripLabel(kpi: TripExpenseAssignmentKpiEntity) {
  if (kpi.tripNumber != null) return `VJE-${String(kpi.tripNumber).padStart(6, '0')}`
  return kpi.folio ?? `VJE-${kpi.tripId.slice(0, 8)}`
}

type HistoricalTripRow = TripExpenseAssignmentKpiEntity & {
  id: string
  operatorLabel: string
  followUpLabel: string
}

export function AssignedTripsGrid({
  linkedAdvances,
  canManage,
  tripKpisData,
  onSelectTripKpi,
  operatorSettlements,
  operatorNames = {},
  searchQuery = '',
  onSelectOperatorSettlement,
}: AssignedTripsGridProps) {
  const normalizedSearch = searchQuery.trim().toLowerCase()

  const getFollowUp = useCallback((trip: TripExpenseAssignmentKpiEntity) => {
    if (trip.balanceAmount === 0) {
      return { kind: 'settled' as const, label: 'Saldado', settlement: null }
    }

    const openSettlement = operatorSettlements
      .filter((settlement) => settlement.status === 'open' && settlement.operatorId === trip.operatorId)
      .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime())[0]

    if (openSettlement) {
      return { kind: 'forwarded' as const, label: 'Pasado a ajuste', settlement: openSettlement }
    }

    return { kind: 'pending' as const, label: 'Pendiente por saldar', settlement: null }
  }, [operatorSettlements])

  const getOperatorLabel = useCallback((trip: TripExpenseAssignmentKpiEntity) => {
    if (trip.operatorName) return trip.operatorName
    if (trip.operatorId && operatorNames[trip.operatorId]) return operatorNames[trip.operatorId]
    return trip.operatorId ?? 'Sin operador'
  }, [operatorNames])

  const historicalSettledTrips = useMemo<HistoricalTripRow[]>(() => {
    const rows = (tripKpisData ?? []).filter((trip) => trip.isSettled)
    const filteredRows = !normalizedSearch
      ? rows
      : rows.filter((trip) => {
          const tripLabel = getTripLabel(trip).toLowerCase()
          return (
            tripLabel.includes(normalizedSearch) ||
            getOperatorLabel(trip).toLowerCase().includes(normalizedSearch) ||
            trip.operatorId?.toLowerCase().includes(normalizedSearch)
          )
        })

    return filteredRows.map((trip) => ({
      ...trip,
      id: trip.tripId,
      operatorLabel: getOperatorLabel(trip),
      followUpLabel: getFollowUp(trip).label,
    }))
  }, [tripKpisData, normalizedSearch, getOperatorLabel, getFollowUp])

  const historicalTripOperatorOptions = useMemo(() => {
    return Array.from(new Set(historicalSettledTrips.map((trip) => trip.operatorLabel)))
      .filter((label) => label.trim().length > 0)
      .sort((a, b) => a.localeCompare(b, 'es-MX'))
      .map((label) => ({ label, value: label }))
  }, [historicalSettledTrips])

  const historicalTripFollowUpOptions = useMemo(() => {
    return Array.from(new Set(historicalSettledTrips.map((trip) => trip.followUpLabel)))
      .filter((label) => label.trim().length > 0)
      .sort((a, b) => a.localeCompare(b, 'es-MX'))
      .map((label) => ({ label, value: label }))
  }, [historicalSettledTrips])

  const historicalTripColumns = useMemo<CrudColumn<HistoricalTripRow>[]>(() => {
    return [
      {
        header: 'Viaje',
        accessor: (row) => getTripLabel(row),
        cell: (row) => (
          <button
            type="button"
            onClick={() => onSelectTripKpi(row)}
            className="font-semibold text-stone-900 hover:text-[#1a5c3a] dark:text-zinc-100 dark:hover:text-emerald-400 transition-colors"
          >
            {getTripLabel(row)}
          </button>
        ),
      },
      {
        header: 'Operador',
        accessor: (row) => row.operatorLabel,
        filter: {
          type: 'select',
          options: historicalTripOperatorOptions,
          placeholder: 'Todos',
          getValue: (row) => row.operatorLabel,
        },
        cell: (row) => <span className="text-stone-600 dark:text-zinc-300">{row.operatorLabel}</span>,
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
        header: 'Seguimiento',
        accessor: (row) => row.followUpLabel,
        filter: {
          type: 'select',
          options: historicalTripFollowUpOptions,
          placeholder: 'Todos',
          getValue: (row) => row.followUpLabel,
        },
        cell: (row) => {
          const followUp = getFollowUp(row)

          if (followUp.kind === 'settled') {
            return (
              <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                <CheckCircle2 className="mr-1 size-3" />
                {followUp.label}
              </Badge>
            )
          }

          if (followUp.kind === 'pending') {
            return (
              <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <Clock3 className="mr-1 size-3" />
                {followUp.label}
              </Badge>
            )
          }

          return (
            <Badge className="bg-blue-500/10 text-blue-700 border border-blue-500/20">
              <ArrowUpRight className="mr-1 size-3" />
              {followUp.label}
            </Badge>
          )
        },
      },
    ]
  }, [getFollowUp, historicalTripFollowUpOptions, historicalTripOperatorOptions, onSelectTripKpi])

  const historicalTripRowActions = useMemo<CrudRowAction<HistoricalTripRow>[]>(() => {
    return [
      {
        label: (row) => {
          const followUp = getFollowUp(row)
          return followUp.kind === 'forwarded' && followUp.settlement && onSelectOperatorSettlement
            ? 'Ver ajuste'
            : 'Ver detalle'
        },
        icon: (row) => {
          const followUp = getFollowUp(row)
          return followUp.kind === 'forwarded' && followUp.settlement && onSelectOperatorSettlement
            ? <RotateCcw className="size-4" />
            : <Eye className="size-4" />
        },
        variant: 'outline',
        onClick: (row) => {
          const followUp = getFollowUp(row)
          if (followUp.kind === 'forwarded' && followUp.settlement && onSelectOperatorSettlement) {
            onSelectOperatorSettlement(followUp.settlement)
            return
          }
          onSelectTripKpi(row)
        },
      },
    ]
  }, [getFollowUp, onSelectOperatorSettlement, onSelectTripKpi])

  return (
    <>
      <div className="flex items-center justify-between mt-2">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Viajes con asignación</h3>
        </div>
        <Badge variant="secondary">{linkedAdvances.length}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
        {linkedAdvances.length === 0 ? (
          <div className="col-span-full p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 flex flex-col items-center justify-center text-stone-500 dark:text-zinc-500">
            <Truck className="h-8 w-8 mb-2 opacity-20" />
            <p>No hay cuentas por viaje pendientes de ajustar.</p>
          </div>
        ) : (
          linkedAdvances.map((k) => (
            <TripSettlementCard
              key={k.id}
              advance={k}
              canManage={canManage}
              onClick={() => {
                if (!k.tripId) return
                const foundKpi = tripKpisData?.find((t) => t.tripId === k.tripId)
                if (foundKpi) {
                  onSelectTripKpi(foundKpi)
                } else {
                  toast.error('No se encontró el viaje asociado')
                }
              }}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Histórico de cuentas hechas</h3>
          <p className="text-sm text-stone-500 dark:text-zinc-500">
            Viajes liquidados con seguimiento de balance y saldos pendientes.
          </p>
        </div>
        <Badge variant="secondary">{historicalSettledTrips.length}</Badge>
      </div>

      <CrudDataTable<HistoricalTripRow>
        data={historicalSettledTrips}
        isLoading={false}
        columns={historicalTripColumns}
        rowActions={historicalTripRowActions}
        pageSize={6}
        searchPlaceholder="Buscar viaje u operador..."
        searchFilter={(row, term) =>
          [getTripLabel(row), row.operatorLabel, row.followUpLabel].some((value) => value.toLowerCase().includes(term))
        }
        emptyState={{
          icon: ReceiptText,
          title: normalizedSearch ? 'Sin resultados' : 'Sin viajes liquidados',
          description: normalizedSearch
            ? 'No hay cuentas hechas que coincidan con la búsqueda.'
            : 'Aún no hay viajes liquidados para mostrar en el histórico.',
        }}
      />
    </>
  )
}
