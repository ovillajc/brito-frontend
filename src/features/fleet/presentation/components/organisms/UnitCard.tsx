import React from 'react'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Truck, Package, Users, Building2, Edit2, Trash2 } from 'lucide-react'

export function UnitCard({ assembly }: { assembly: any }) {
  return (
    <Card className="overflow-hidden border-outline-variant/30 hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <CardContent className="p-0">
        <div className="p-4 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="size-5" />
             </div>
             <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Unidad Activa</span>
                <span className="text-sm font-bold text-on-surface font-mono">{assembly.tractor.plates}</span>
             </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">En Operación</Badge>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3">
            <InfoRow icon={Package} label="Remolque" value={assembly.trailer.type} sub={assembly.trailer.economicNumber} />
            <InfoRow icon={Users} label="Operador" value={`${assembly.operator.firstName} ${assembly.operator.lastName}`} />
            <InfoRow icon={Building2} label="Cliente" value={assembly.clientName || 'Sin asignar'} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Desde</span>
                <span className="text-xs text-on-surface">{new Date(assembly.createdAt).toLocaleDateString()}</span>
             </div>
             <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-surface-container-high transition-colors">
                  <Edit2 className="size-3.5 text-on-surface-variant" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-error-container/20 text-error hover:text-error transition-colors">
                  <Trash2 className="size-3.5" />
                </Button>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-7 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
        <Icon className="size-3.5 text-on-surface-variant" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase font-bold text-on-surface-variant leading-tight">{label}</span>
        <span className="text-xs text-on-surface font-medium truncate">{value}</span>
        {sub && <span className="text-[10px] text-on-surface-variant font-mono">{sub}</span>}
      </div>
    </div>
  )
}
