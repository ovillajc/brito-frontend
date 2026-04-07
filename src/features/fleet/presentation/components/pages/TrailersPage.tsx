/**
 * @fileoverview Listado de Remolques (Trailers).
 */

'use client'

import { useTrailers } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { MoreHorizontal, FileText, Info, Package } from 'lucide-react'
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

export default function TrailersPage() {
  const { data: trailers, isLoading } = useTrailers()

  return (
    <div className="flex flex-col gap-6">
      <DataTableToolbar 
        searchPlaceholder="Buscar por placa o número económico..."
        actionLabel="Nuevo Remolque"
      />

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo / Marca</TableHead>
              <TableHead>Económico</TableHead>
              <TableHead>Placas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Documentos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell><div className="h-4 w-32 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-surface-container rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-surface-container rounded-full" /></TableCell>
                  <TableCell><div className="h-4 w-10 bg-surface-container rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 w-8 bg-surface-container rounded float-right" /></TableCell>
                </TableRow>
              ))
            ) : (
              trailers?.map((trailer) => (
                <TableRow key={trailer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded bg-surface-container flex items-center justify-center">
                        <Package className="size-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{trailer.type}</span>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">{trailer.brand} {trailer.model}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-primary">{trailer.economicNumber}</TableCell>
                  <TableCell className="font-mono text-xs">{trailer.plates}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        'capitalize',
                        trailer.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
                      )}
                    >
                      {trailer.status === 'available' ? 'Disponible' : 'En Uso'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <FileText className="size-4" />
                        <span className="text-xs">2</span>
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
