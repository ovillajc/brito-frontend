'use client'

import  { useState } from 'react'
import {  Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { Button } from '@/src/core/presentation/components/ui/button'
import { deleteEmployeeAction } from '../../actions/employee.actions'
import { EmployeeWizard } from './EmployeeWizard'
import { EmployeeDetailsDialog } from './EmployeeDetailsDialog'
import { ConfirmDialog } from '@/src/core/presentation/components/molecules/confirm-dialog'

interface EmployeesTableProps {
  initialData: EmployeeEntity[]
}

export function EmployeesTable({ initialData }: EmployeesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeEntity | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Confirm-delete dialog state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  
  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<EmployeeEntity | null>(null)

  const handleEdit = (employee: EmployeeEntity) => {
    setSelectedEmployee(employee)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedEmployee(null)
  }

  const handleViewDetails = (employee: EmployeeEntity) => {
    setSelectedDetailEmployee(employee)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedDetailEmployee(null)
  }

  const filteredEmployees = initialData.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.rfc?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteRequest = (id: string) => {
    setPendingDeleteId(id)
  }

  const handleCancelDelete = () => {
    setPendingDeleteId(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setIsDeleting(id)
    try {
      const result = await deleteEmployeeAction(id)
      if (result.ok) {
        toast.success('Empleado eliminado correctamente')
      } else {
        toast.error(result.error.message || 'Error al eliminar')
      }
    } catch {
      toast.error('Error inesperado al eliminar')
    } finally {
      setIsDeleting(null)
      setPendingDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table Actions / Toolbar */}
      <DataTableToolbar 
        searchPlaceholder="Buscar por nombre, RFC o área..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        actionLabel="Nuevo Empleado"
        onAction={() => setIsWizardOpen(true)}
      />

      {/* Data Table */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50/50 dark:bg-zinc-900/50">
              <TableHead className="font-bold text-stone-900 dark:text-zinc-100">Nombre / Identificación</TableHead>
              <TableHead className="font-bold text-stone-900 dark:text-zinc-100">Alta</TableHead>
              <TableHead className="font-bold text-stone-900 dark:text-zinc-100">Área</TableHead>
              <TableHead className="font-bold text-stone-900 dark:text-zinc-100">Rol</TableHead>
              <TableHead className="font-bold text-stone-900 dark:text-zinc-100">Estado</TableHead>
              <TableHead className="text-right font-bold text-stone-900 dark:text-zinc-100">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-stone-500 dark:text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-medium">No se encontraron empleados coincidentes</span>
                    <span className="text-xs">Intenta con otro término de búsqueda</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow 
                  key={emp.id} 
                  className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                  onClick={() => handleViewDetails(emp)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-[#2ecc71] transition-colors">
                        {emp.fullName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500 mt-0.5">
                        <span>{emp.rfc || 'SIN RFC'}</span>
                        <span className="size-1 rounded-full bg-stone-300 dark:bg-zinc-700" />
                        <span>{emp.curp || 'SIN CURP'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-stone-600 dark:text-zinc-400">
                    {emp.hireDate 
                      ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(emp.hireDate)
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600 dark:text-zinc-400">
                    <span className="px-2 py-1 rounded bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[11px] font-bold">
                      {emp.departmentName || 'SIN ÁREA'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {emp.isOperator ? (
                      <Badge variant="outline" className="text-[#e07020] border-[#e07020]/30 bg-[#e07020]/5 dark:bg-[#e07020]/10">
                        Operativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
                        Administrativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {emp.isActive ? (
                      <Badge className="bg-[#1a5c3a] dark:bg-[#2ecc71]/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">Activo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-400">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(emp)
                        }}
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRequest(emp.id)
                        }}
                        disabled={isDeleting === emp.id}
                      >
                        <Trash2 className={`size-3.5 ${isDeleting === emp.id ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EmployeeWizard 
        isOpen={isWizardOpen} 
        employee={selectedEmployee || undefined}
        onClose={handleCloseWizard} 
      />

      <EmployeeDetailsDialog
        isOpen={isDetailsOpen}
        employee={selectedDetailEmployee}
        onClose={handleCloseDetails}
      />

      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={!!isDeleting}
        title="¿Eliminar empleado?"
        description="Esta acción es irreversible. El registro del empleado y toda su información serán eliminados permanentemente del sistema."
        confirmLabel="Sí, eliminar"
        cancelLabel="No, cancelar"
      />
    </div>
  )
}
