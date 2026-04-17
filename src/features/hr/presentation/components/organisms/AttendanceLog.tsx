'use client'

import React, { useState } from 'react'
import { AttendanceEntity, IncidentType } from '../../../domain/entities'
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell,
  TableContainer
} from '@/src/core/presentation/components/ui/table'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { DataTableToolbar } from '@/src/core/presentation/components/molecules/data-table-toolbar'

const incidentColors: Record<IncidentType, string> = {
  asistencia: 'bg-[#1a5c3a] text-white',
  falta: 'bg-red-500 text-white',
  retardo: 'bg-[#e07020] text-white',
  vacaciones: 'bg-blue-500 text-white',
  incapacidad: 'bg-purple-500 text-white',
  permiso_sin_sueldo: 'bg-stone-500 text-white',
}

interface AttendanceLogProps {
  initialData: AttendanceEntity[]
}

export function AttendanceLog({ initialData }: AttendanceLogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = initialData.filter(log => 
    log.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <DataTableToolbar 
        searchPlaceholder="Buscar empleado..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actionLabel="Nuevo Registro"
      />

      {/* Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Incidencia</TableHead>
              <TableHead>Notas Adicionales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-stone-500 dark:text-zinc-500">
                  No se encontraron registros de asistencia.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((log) => (
                <TableRow key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <TableCell>
                    <span className="font-medium text-stone-900 dark:text-zinc-100">{log.employeeName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600 dark:text-zinc-400">
                    {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(log.incidentDate)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${incidentColors[log.incidentType]} hover:opacity-90 capitalize border-none`}>
                      {log.incidentType.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-stone-500 dark:text-zinc-500 italic">
                    {log.notes || '—'}
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
