'use client'

import React, { useState } from 'react'
import { EmployeeEntity } from '../../../domain/entities'
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
import { CreateEmployeeWizard } from './CreateEmployeeWizard'

interface EmployeesTableProps {
  initialData: EmployeeEntity[]
}

export function EmployeesTable({ initialData }: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const filteredEmployees = initialData.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Table Actions / Toolbar */}
      <DataTableToolbar 
        searchPlaceholder="Buscar por nombre o área..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actionLabel="Nuevo Empleado"
        onAction={() => setIsWizardOpen(true)}
      />

      {/* Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Estado</TableHead>
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
      </TableContainer>

      <CreateEmployeeWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </div>
  )
}
