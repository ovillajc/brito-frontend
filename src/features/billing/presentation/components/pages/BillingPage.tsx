'use client'

/**
 * @fileoverview Página principal del módulo de Facturación.
 * Integra KPIs, tabla de viajes, panel de detalle y generación de documentos.
 */

import React, { useState, useCallback } from 'react'
import { FileText, RefreshCw } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getBillingRecordsAction } from '@/src/features/billing/presentation/actions/billing.actions'
import { getClientsAction } from '@/src/features/clients/presentation/actions/client.actions'
import { getCompanyProfilesAction } from '@/src/features/company-profile/presentation/actions/company-profile.actions'
import { BillingKpiCards } from '../organisms/BillingKpiCards'
import { BillingTable } from '../organisms/BillingTable'
import { InvoicePreviewPanel } from '../organisms/InvoicePreviewPanel'
import { MarkInvoicedDialog } from '../organisms/MarkInvoicedDialog'
import type { BillingRecord } from '@/src/features/billing/domain/entities/billing-entity'
import { cn } from '@/src/core/infrastructure/utils/cn'

export default function BillingPage() {
  const queryClient = useQueryClient()
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null)
  const [markInvoicedRecord, setMarkInvoicedRecord] = useState<BillingRecord | null>(null)

  // Queries
  const { data: records = [], isLoading: isLoadingRecords, refetch } = useQuery({
    queryKey: ['billing', 'records'],
    queryFn: async () => {
      const result = await getBillingRecordsAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 2, // 2 min
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const result = await getClientsAction()
      if (!result.ok) return []
      return result.data
    },
  })

  const { data: companyProfiles = [] } = useQuery({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const result = await getCompanyProfilesAction()
      if (!result.ok) return []
      return result.data
    },
  })

  const activeCompany = companyProfiles.find((p) => p.isActive) ?? companyProfiles[0] ?? null

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['billing'] })
  }, [queryClient])

  const handleMarkAsInvoiced = (record: BillingRecord) => {
    setMarkInvoicedRecord(record)
  }

  const handleMarkSuccess = () => {
    handleRefresh()
    // Update the selected record too
    if (selectedRecord) {
      setSelectedRecord(null)
    }
  }

  const isPanelOpen = Boolean(selectedRecord)

  return (
    <div className="flex flex-col gap-6 min-h-0">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#1a5c3a] mb-1">
            <FileText className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Administración / Facturación</span>
          </div>
          <h1 className="text-3xl font-black text-stone-900 dark:text-zinc-100 tracking-tight">
            Facturación de Viajes
          </h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-2xl">
            Control de pre-facturación de servicios de transporte. Genera, descarga y registra tus CFDI con Complemento Carta Porte 3.0.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoadingRecords}
          className="p-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 shrink-0"
          aria-label="Actualizar"
        >
          <RefreshCw className={cn('size-4', isLoadingRecords && 'animate-spin')} />
        </button>
      </div>

      {/* KPI Cards */}
      <BillingKpiCards records={records} />

      {/* Main area: table + panel */}
      <div className="grid grid-cols-1 gap-6 transition-all duration-300">
        {/* Table */}
        <div className="min-w-0">
          {isLoadingRecords ? (
            <div className="flex flex-col gap-4">
              <div className="h-12 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-zinc-800/50" />
              <div className="h-64 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-zinc-800/50" />
            </div>
          ) : (
            <BillingTable
              records={records}
              clients={clients}
              selectedId={selectedRecord?.tripId ?? null}
              onSelect={setSelectedRecord}
            />
          )}
        </div>

        {/* Invoice wizard modal */}
        {isPanelOpen && (
          <InvoicePreviewPanel
            isOpen={isPanelOpen}
            record={selectedRecord}
            companyProfile={activeCompany}
            onClose={() => setSelectedRecord(null)}
            onMarkAsInvoiced={handleMarkAsInvoiced}
          />
        )}
      </div>

      {/* Mark as invoiced dialog */}
      <MarkInvoicedDialog
        isOpen={Boolean(markInvoicedRecord)}
        record={markInvoicedRecord}
        onClose={() => setMarkInvoicedRecord(null)}
        onSuccess={handleMarkSuccess}
      />
    </div>
  )
}
