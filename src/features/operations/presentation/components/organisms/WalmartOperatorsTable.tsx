'use client'

import { useEffect, useState } from 'react'
import { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { CrudDataTable, CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { deleteEmployeeAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { EmployeeWizard } from '@/src/features/hr/presentation/components/organisms/EmployeeWizard'
import { EmployeeDetailsDialog } from '@/src/features/hr/presentation/components/organisms/EmployeeDetailsDialog'
import { Users } from 'lucide-react'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

interface WalmartOperatorsTableProps {
  initialData: EmployeeEntity[]
}

const isExpired = (date: Date | null | undefined) => {
  if (!date) return false
  return new Date() > new Date(date)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(date))
}

const WALMART_OPERATOR_COLUMNS: CrudColumn<EmployeeEntity>[] = [
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
    header: 'Licencia',
    cell: (emp) => (
      <div className="flex flex-col text-[11px] font-medium min-w-[120px]">
        {emp.licenseNumber ? (
           <>
             <span className="font-mono text-stone-700 dark:text-zinc-300">{emp.licenseNumber} {emp.licenseType ? `(${emp.licenseType})` : ''}</span>
             <span className={isExpired(emp.licenseExpiration) ? "text-red-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}>
               Vence: {emp.licenseExpiration ? formatDate(emp.licenseExpiration) : 'N/A'}
             </span>
           </>
        ) : (
          <span className="text-stone-400 italic">No registrada</span>
        )}
      </div>
    ),
  },
  {
    header: 'Credenciales Cliente',
    cell: (emp) => (
      <div className="flex flex-col gap-1 text-[10px] font-medium min-w-[160px]">
        {emp.rcontrolId && (
          <div className="flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 p-1.5 rounded border border-stone-100 dark:border-zinc-800">
            <span className="text-stone-600 dark:text-zinc-300">RC: <span className="font-mono">{emp.rcontrolId}</span></span>
            <span className={isExpired(emp.rcontrolExpiration) ? "text-red-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}>
              {emp.rcontrolExpiration ? formatDate(emp.rcontrolExpiration) : 'N/A'}
            </span>
          </div>
        )}
        {emp.fasttrackId && (
          <div className="flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 p-1.5 rounded border border-stone-100 dark:border-zinc-800">
            <span className="text-stone-600 dark:text-zinc-300">FT: <span className="font-mono">{emp.fasttrackId}</span></span>
            <span className={isExpired(emp.fasttrackExpiration) ? "text-red-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}>
              {emp.fasttrackExpiration ? formatDate(emp.fasttrackExpiration) : 'N/A'}
            </span>
          </div>
        )}
        {emp.opaloId && (
          <div className="flex justify-between items-center bg-stone-50 dark:bg-zinc-800/50 p-1.5 rounded border border-stone-100 dark:border-zinc-800">
            <span className="text-stone-600 dark:text-zinc-300">OP: <span className="font-mono">{emp.opaloId}</span></span>
            <span className={isExpired(emp.opaloExpiration) ? "text-red-500 font-bold" : "text-emerald-600 dark:text-emerald-400"}>
              {emp.opaloExpiration ? formatDate(emp.opaloExpiration) : 'N/A'}
            </span>
          </div>
        )}
        {!emp.rcontrolId && !emp.fasttrackId && !emp.opaloId && (
          <span className="text-stone-400 italic">Sin credenciales de cliente</span>
        )}
      </div>
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

export function WalmartOperatorsTable({ initialData }: WalmartOperatorsTableProps) {
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
        columns={WALMART_OPERATOR_COLUMNS}
        searchPlaceholder="Buscar por nombre, RFC o credenciales..."
        searchFilter={(emp, term) =>
          [
            emp.fullName, 
            emp.rfc, 
            emp.rcontrolId, 
            emp.fasttrackId, 
            emp.opaloId, 
            emp.licenseNumber
          ].some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Operador"
        onAction={() => setIsWizardOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState={{
          icon: Users,
          title: 'No se encontraron operadores',
          description: 'Intenta con otro término de búsqueda o registra un nuevo operador.',
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
