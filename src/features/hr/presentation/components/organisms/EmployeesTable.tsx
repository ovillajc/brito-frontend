'use client'

/**
 * @fileoverview Tabla de Empleados refactorizada para usar CrudDataTable<EmployeeEntity>.
 * La lógica de búsqueda, skeltons, empty state, eliminación y acciones de fila
 * son manejadas por el componente genérico CrudDataTable.
 */

import { useEffect, useState } from 'react'
import { EmployeeEntity } from '../../../domain/entities'
import { CrudDataTable, CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { deleteEmployeeAction } from '../../actions/employee.actions'
import { EmployeeWizard } from './EmployeeWizard'
import { EmployeeDetailsDialog } from './EmployeeDetailsDialog'
import { Users } from 'lucide-react'

interface EmployeesTableProps {
  initialData: EmployeeEntity[]
}

/** Columnas de la tabla de empleados. */
const EMPLOYEE_COLUMNS: CrudColumn<EmployeeEntity>[] = [
  {
    header: 'Nombre / Identificación',
    cell: (emp) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
          {emp.fullName}
        </span>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500 mt-0.5">
          <span>{emp.rfc || 'SIN RFC'}</span>
          <span className="size-1 rounded-full bg-stone-300 dark:bg-zinc-700" />
          <span>{emp.curp || 'SIN CURP'}</span>
        </div>
      </div>
    ),
  },
  {
    header: 'Alta',
    cell: (emp) =>
      emp.hireDate
        ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(emp.hireDate)
        : 'N/A',
    className: 'text-sm text-stone-600 dark:text-zinc-400',
  },
  {
    header: 'Área',
    cell: (emp) => (
      <span className="px-2 py-1 rounded bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 text-[11px] font-bold">
        {emp.departmentName || 'SIN ÁREA'}
      </span>
    ),
    className: 'text-sm text-stone-600 dark:text-zinc-400',
  },
  {
    header: 'Rol',
    cell: (emp) =>
      emp.isOperator ? (
        <Badge variant="outline" className="text-[#e07020] border-[#e07020]/30 bg-[#e07020]/5 dark:bg-[#e07020]/10">
          Operativo
        </Badge>
      ) : (
        <Badge variant="outline" className="text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
          Administrativo
        </Badge>
      ),
  },
  {
    header: 'Estado',
    cell: (emp) =>
      emp.isActive ? (
        <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">
          Activo
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-400">
          Inactivo
        </Badge>
      ),
  },
]

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export function EmployeesTable({ initialData }: EmployeesTableProps) {
  // Avoid SSR/client hydration mismatch: useAuthStore reads client-only Zustand
  // store which returns false on the server. We initialize as false and sync
  // after mount so both renders start with the same value.
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const [canManage, setCanManage] = useState(false)
  useEffect(() => {
    setCanManage(hasPermission('all_access'))
  }, [hasPermission])

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailEmployee, setDetailEmployee] = useState<EmployeeEntity | null>(null)

  const handleView = (employee: EmployeeEntity) => {
    setDetailEmployee(employee)
    setIsDetailsOpen(true)
  }

  const handleEdit = (employee: EmployeeEntity) => {
    setSelectedEmployee(employee)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedEmployee(null)
  }

  const handleDelete = async (id: string) => {
    return deleteEmployeeAction(id)
  }

  return (
    <>
      <CrudDataTable<EmployeeEntity>
        canManage={canManage}
        data={initialData}
        isLoading={false}
        columns={EMPLOYEE_COLUMNS}
        searchPlaceholder="Buscar por nombre, RFC o área..."
        searchFilter={(emp, term) =>
          [emp.fullName, emp.departmentName, emp.rfc]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Empleado"
        onAction={() => setIsWizardOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState={{
          icon: Users,
          title: 'No se encontraron empleados',
          description: 'Intenta con otro término de búsqueda o crea un nuevo empleado.',
        }}
      />

      <EmployeeWizard
        isOpen={isWizardOpen}
        employee={selectedEmployee ?? undefined}
        onClose={handleCloseWizard}
      />

      <EmployeeDetailsDialog
        isOpen={isDetailsOpen}
        employee={detailEmployee}
        onClose={() => { setIsDetailsOpen(false); setDetailEmployee(null) }}
      />
    </>
  )
}
