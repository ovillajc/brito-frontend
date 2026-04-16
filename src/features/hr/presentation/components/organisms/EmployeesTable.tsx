'use client'

import React, { useState } from 'react'
import { EmployeeEntity } from '../../../domain/entities'
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
import { Search } from 'lucide-react'

interface EmployeesTableProps {
  initialData: EmployeeEntity[]
}

export function EmployeesTable({ initialData }: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = initialData.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Table Actions / Toolbar */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400" />
          <Input 
            placeholder="Buscar por nombre o área..." 
            className="pl-9 bg-stone-50 border-stone-200 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-stone-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-stone-600">Nombre</TableHead>
              <TableHead className="font-semibold text-stone-600">Alta</TableHead>
              <TableHead className="font-semibold text-stone-600">Área</TableHead>
              <TableHead className="font-semibold text-stone-600">Rol</TableHead>
              <TableHead className="font-semibold text-stone-600 text-right">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-stone-500">
                  No se encontraron empleados coincidentes.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-stone-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-900">{emp.fullName}</span>
                      <span className="text-[11px] text-stone-500">{emp.contactEmail || 'Sin email'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(emp.hireDate)}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">{emp.departmentName || 'N/A'}</TableCell>
                  <TableCell>
                    {emp.isOperator ? (
                      <Badge variant="outline" className="text-[#e07020] border-[#e07020] bg-[#e07020]/10">
                        Operativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-stone-600 border-stone-300">
                        Administrativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {emp.isActive ? (
                      <Badge className="bg-[#1a5c3a] hover:bg-[#1a5c3a]/90">Activo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-stone-200 text-stone-700">Inactivo</Badge>
                    )}
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
