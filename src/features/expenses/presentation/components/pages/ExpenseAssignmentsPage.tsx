'use client'
import { useMemo, useState } from 'react'
import { AlertTriangle, HandCoins, Receipt, CheckCircle2, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useOperatorSettlementKpis } from '../../hooks/use-expense-assignments'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { OperatorSettlementsTab } from '../organisms/OperatorSettlementsTab'
import { ExpenseAdvancesTab } from '../organisms/ExpenseAdvancesTab'
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
export default function ExpenseAssignmentsPage() {
  const settlementKpisQuery = useOperatorSettlementKpis(200)
  const canManage = useAuthStore((state) => state.hasPermission('expenses:manage'))
  const [activeTab, setActiveTab] = useState<'settlements' | 'advances'>('settlements')
  const kpis = useMemo(() => settlementKpisQuery.data ?? [], [settlementKpisQuery.data])
  const totals = useMemo(() => {
    const assigned = kpis.reduce((acc, k) => acc + k.assignedAmount, 0)
    const spent = kpis.reduce((acc, k) => acc + k.spentAmount, 0)
    return { assigned, spent, diff: spent - assigned }
  }, [kpis])
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
      <div className="flex items-center gap-1 border-b border-outline-variant/30 mb-2">
        <button
          onClick={() => setActiveTab('settlements')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative rounded-t-lg',
            activeTab === 'settlements'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
          )}
        >
          <HandCoins className="size-4" />
          Cuentas pendientes
          {activeTab === 'settlements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('advances')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative rounded-t-lg',
            activeTab === 'advances'
              ? 'text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
          )}
        >
          <Link2 className="size-4" />
          Asignaciones de gastos
          {activeTab === 'advances' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
        </button>
      </div>
      <div>
        {activeTab === 'settlements' && <OperatorSettlementsTab canManage={canManage} kpis={kpis} />}
        {activeTab === 'advances' && <ExpenseAdvancesTab canManage={canManage} />}
      </div>
    </div>
  )
}
