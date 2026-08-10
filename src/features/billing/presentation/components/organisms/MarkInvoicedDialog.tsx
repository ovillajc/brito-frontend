'use client'

/**
 * @fileoverview Dialog para marcar un viaje como facturado.
 * Captura folio de factura, UUID, fecha y notas.
 */

import React, { useState } from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import type { BillingRecord } from '@/src/features/billing/domain/entities/billing-entity'
import { updateBillingStatusAction } from '@/src/features/billing/presentation/actions/billing.actions'
import { toast } from 'sonner'

interface MarkInvoicedDialogProps {
  isOpen: boolean
  record: BillingRecord | null
  onClose: () => void
  onSuccess: () => void
}

export function MarkInvoicedDialog({ isOpen, record, onClose, onSuccess }: MarkInvoicedDialogProps) {
  const [invoiceFolio, setInvoiceFolio] = useState('')
  const [invoiceUUID, setInvoiceUUID] = useState('')
  const [invoiceNotes, setInvoiceNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!record || !invoiceFolio.trim()) return

    setIsLoading(true)
    try {
      const result = await updateBillingStatusAction({
        tripId: record.tripId,
        billingStatus: 'invoiced',
        invoiceFolio: invoiceFolio.trim(),
        invoiceDate: new Date(),
        invoiceUUID: invoiceUUID.trim() || null,
        invoiceNotes: invoiceNotes.trim() || null,
      })

      if (result.ok) {
        toast.success('Viaje marcado como facturado correctamente')
        setInvoiceFolio('')
        setInvoiceUUID('')
        setInvoiceNotes('')
        onSuccess()
        onClose()
      } else {
        toast.error('Error al actualizar: ' + result.error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1a5c3a]/10">
            <CheckCircle2 className="size-5 text-[#1a5c3a]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Registrar Factura</h2>
            <p className="text-xs text-stone-500 dark:text-zinc-400">
              Viaje: <span className="font-mono font-bold">{record?.folio ?? record?.tripId?.slice(0, 8)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="invoice-folio" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Folio de Factura <span className="text-red-500">*</span>
            </label>
            <Input
              id="invoice-folio"
              value={invoiceFolio}
              onChange={(e) => setInvoiceFolio(e.target.value)}
              placeholder="Ej. A-00001"
              required
              className="rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invoice-uuid" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              UUID (CFDI) <span className="text-stone-400 font-normal">— Opcional</span>
            </label>
            <Input
              id="invoice-uuid"
              value={invoiceUUID}
              onChange={(e) => setInvoiceUUID(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="rounded-xl font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="invoice-notes" className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
              Notas <span className="text-stone-400 font-normal">— Opcional</span>
            </label>
            <textarea
              id="invoice-notes"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Observaciones de la factura..."
              rows={3}
              className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm px-3 py-2 text-stone-900 dark:text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border-stone-200 dark:border-zinc-700"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !invoiceFolio.trim()}
            className="flex-1 h-10 rounded-xl bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white font-bold"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Confirmar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
