'use client'

/**
 * @fileoverview KPI Cards para el módulo de Facturación.
 * Muestra métricas clave: total facturado, pendiente, viajes por estado.
 */

import React, { useMemo } from 'react'
import { TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react'
import type { BillingRecord } from '@/src/features/billing/domain/entities/billing-entity'
import { cn } from '@/src/core/infrastructure/utils/cn'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface BillingKpiCardsProps {
  records: BillingRecord[]
}

interface KpiCardProps {
  label: string
  value: string
  subtitle: string
  icon: React.ReactNode
  gradient: string
  glowColor: string
}

function KpiCard({ label, value, subtitle, icon, gradient, glowColor }: KpiCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-6 border border-white/10',
      'backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
      gradient
    )}>
      {/* Glow effect */}
      <div className={cn('absolute -top-6 -right-6 size-28 rounded-full blur-2xl opacity-30', glowColor)} />
      
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
          <span className="text-2xl font-black text-white tracking-tight leading-none truncate">{value}</span>
          <span className="text-xs text-white/50 font-medium">{subtitle}</span>
        </div>
        <div className="shrink-0 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>
  )
}

export function BillingKpiCards({ records }: BillingKpiCardsProps) {
  const kpis = useMemo(() => {
    const pending = records.filter(r => r.billingStatus === 'pending')
    const invoiced = records.filter(r => r.billingStatus === 'invoiced')
    const cancelled = records.filter(r => r.billingStatus === 'cancelled')

    return {
      totalInvoiced: invoiced.reduce((s, r) => s + r.totalIncome, 0),
      totalPending: pending.reduce((s, r) => s + r.totalIncome, 0),
      countInvoiced: invoiced.length,
      countPending: pending.length,
      countCancelled: cancelled.length,
      totalAll: records.reduce((s, r) => s + r.totalIncome, 0),
      countAll: records.length,
    }
  }, [records])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Total Pre-Facturado"
        value={money.format(kpis.totalAll)}
        subtitle={`${kpis.countAll} viajes completados`}
        icon={<TrendingUp className="size-5 text-white" />}
        gradient="bg-gradient-to-br from-[#1a5c3a] to-[#0e3d27]"
        glowColor="bg-emerald-400"
      />
      <KpiCard
        label="Por Facturar"
        value={money.format(kpis.totalPending)}
        subtitle={`${kpis.countPending} viajes pendientes`}
        icon={<Clock className="size-5 text-white" />}
        gradient="bg-gradient-to-br from-amber-600 to-amber-800"
        glowColor="bg-amber-400"
      />
      <KpiCard
        label="Facturado"
        value={money.format(kpis.totalInvoiced)}
        subtitle={`${kpis.countInvoiced} facturas emitidas`}
        icon={<CheckCircle2 className="size-5 text-white" />}
        gradient="bg-gradient-to-br from-blue-600 to-blue-800"
        glowColor="bg-blue-400"
      />
      <KpiCard
        label="Cancelados"
        value={String(kpis.countCancelled)}
        subtitle="viajes sin cobro"
        icon={<XCircle className="size-5 text-white" />}
        gradient="bg-gradient-to-br from-stone-600 to-stone-800"
        glowColor="bg-stone-400"
      />
    </div>
  )
}
