/**
 * @fileoverview Listado de Operadores.
 */

'use client'

import React from 'react'
import { useOperators } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { MoreHorizontal, FileText, Info, UserCircle } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { DataTableToolbar } from '@/src/core/presentation/components/molecules/data-table-toolbar'
import { 
  TableContainer, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/src/core/presentation/components/ui/table'

export default function OperatorsPage() {
  const { data: operators, isLoading } = useOperators()

  return (
    <div className="flex flex-col gap-6">
      <DataTableToolbar 
        searchPlaceholder="Buscar por nombre o licencia..."
        actionLabel="Nuevo Operador"
      />

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operador</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 w-40 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-surface-container rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-10 bg-surface-container rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-8 bg-surface-container rounded float-right" /></TableCell>
                </TableRow>
              ))
            ) : (
              operators?.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant/20">
                        <UserCircle className="size-6 text-on-surface-variant" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{op.firstName} {op.lastName}</span>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">ID: {op.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-medium">{op.licenseNumber}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">Clase {op.licenseType}</span>
                  </TableCell>
                  <TableCell className="text-xs">{op.phone ?? '---'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        op.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                      )}
                    >
                      {op.status === 'available' ? 'Disponible' : 'En Viaje'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <FileText className="size-4" />
                        <span className="text-xs">4</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Info className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
