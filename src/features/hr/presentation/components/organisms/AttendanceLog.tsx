'use client'

import React, { useState } from 'react'
import { AttendanceEntity, IncidentType, incidentTypeSchema } from '../../../domain/entities'
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/src/core/presentation/components/ui/table'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Calendar, Filter, Search } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input 
            placeholder="Buscar empleado..." 
            className="pl-9 bg-stone-50 border-stone-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="text-stone-600 bg-stone-50 border-stone-200 w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" /> Fecha
          </Button>
          <Button variant="outline" className="text-stone-600 bg-stone-50 border-stone-200 w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" /> Filtrar Tipos
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-stone-600">Empleado</TableHead>
              <TableHead className="font-semibold text-stone-600">Fecha</TableHead>
              <TableHead className="font-semibold text-stone-600">Incidencia</TableHead>
              <TableHead className="font-semibold text-stone-600">Notas Adicionales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-stone-500">
                  No se encontraron registros de asistencia.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((log) => (
                <TableRow key={log.id} className="hover:bg-stone-50/50">
                  <TableCell>
                    <span className="font-medium text-stone-900">{log.employeeName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(log.incidentDate)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${incidentColors[log.incidentType]} hover:opacity-90 capitalize`}>
                      {log.incidentType.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-stone-500 italic">
                    {log.notes || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
