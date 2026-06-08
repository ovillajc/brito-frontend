'use client'

/**
 * @fileoverview Dialog de detalles para cliente.
 *
 * @organism
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { X, Building2, MapPin, FileText, Hash, Calendar } from 'lucide-react'
import { ClientEntity } from '@/src/features/fleet/domain/entities'

interface ClientDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  clientRow: ClientEntity | null
}

function DetailItem({ icon: Icon, label, value, className = '' }: { icon: React.ElementType, label: string, value: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        {value ?? <span className="text-stone-300 dark:text-zinc-600 font-normal italic text-xs">No registrado</span>}
      </div>
    </div>
  )
}

function SectionTitle({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="size-8 rounded-lg bg-[#006d37]/8 dark:bg-[#1a5c3a]/20 flex items-center justify-center">
        <Icon className="size-4 text-[#006d37] dark:text-primary-container" />
      </div>
      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
  )
}

export function ClientDetailsDialog({ isOpen, onClose, clientRow }: ClientDetailsDialogProps) {
  if (!clientRow) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 py-7">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Building2 className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                  {clientRow.tradeName || clientRow.companyName || 'Sin Nombre'}
                </h2>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {clientRow.rfc || 'RFC No Registrado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto p-8 space-y-8">
        <section>
          <SectionTitle title="Datos Generales" icon={Building2} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Building2} label="Nombre Comercial" value={clientRow.tradeName} />
            <DetailItem icon={Building2} label="Razón Social" value={clientRow.companyName} />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Datos Fiscales" icon={FileText} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Hash} label="RFC" value={clientRow.rfc} />
            <DetailItem icon={FileText} label="Régimen Fiscal" value={clientRow.taxRegime} />
            <DetailItem icon={MapPin} label="Domicilio Fiscal" value={clientRow.taxDomicile} className="md:col-span-2" />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Fechas de Registro" icon={Calendar} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Calendar} label="Fecha de Alta" value={clientRow.createdAt ? new Date(clientRow.createdAt).toLocaleString('es-MX') : null} />
            <DetailItem icon={Calendar} label="Última Actualización" value={clientRow.updatedAt ? new Date(clientRow.updatedAt).toLocaleString('es-MX') : null} />
          </div>
        </section>
      </div>
    </Dialog>
  )
}
