'use client'

/**
 * @fileoverview Tabla de Clientes con soporte CRUD.
 *
 * @organism
 */

import React, { useState } from 'react'
import { Building2 } from 'lucide-react'
import { ClientEntity } from '@/src/features/clients/domain/entities'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { ClientWizard } from './ClientWizard'
import { ClientDetailsDialog } from './ClientDetailsDialog'
import { deleteClientAction } from '@/src/features/clients/presentation/actions/client.actions'

interface ClientsTableProps {
  initialData: ClientEntity[]
}

export function ClientsTable({ initialData }: ClientsTableProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<ClientEntity | null>(null)
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedClientForView, setSelectedClientForView] = useState<ClientEntity | null>(null)

  const handleOpenWizard = (client?: ClientEntity) => {
    setSelectedClientForEdit(client || null)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedClientForEdit(null)
  }

  const handleViewDetails = (client: ClientEntity) => {
    setSelectedClientForView(client)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedClientForView(null)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteClientAction(id)
    return result
  }

  const columns: CrudColumn<ClientEntity>[] = [
    {
      header: 'Nombre Comercial',
      accessor: (c) => c.tradeName,
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-semibold text-stone-900 dark:text-zinc-100">
            {c.tradeName || 'Sin Nombre Comercial'}
          </span>
          <span className="text-xs text-stone-500 dark:text-zinc-400">
            {c.companyName}
          </span>
          {c.companyProfileLegalName && (
            <span className="text-[10px] mt-1 inline-flex w-fit items-center rounded-md bg-[#1a5c3a]/10 px-1.5 py-0.5 font-medium text-[#1a5c3a] dark:bg-primary-container/20 dark:text-primary-container">
              Empresa: {c.companyProfileLegalName}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'RFC',
      accessor: (c) => c.rfc,
      cell: (c) => (
        <span className="text-sm font-medium text-stone-600 dark:text-zinc-300">
          {c.rfc || '—'}
        </span>
      ),
    },
    {
      header: 'Régimen Fiscal',
      accessor: (c) => c.taxRegime,
      cell: (c) => (
        <span className="text-sm text-stone-500 dark:text-zinc-400 truncate max-w-[200px] block">
          {c.taxRegime || '—'}
        </span>
      ),
    },
  ]

  return (
    <>
      <CrudDataTable<ClientEntity>
        data={initialData}
        isLoading={false}
        columns={columns}
        searchPlaceholder="Buscar por nombre comercial, razón social o RFC..."
        searchFilter={(client, term) => {
          const t = term.toLowerCase()
          return (
            (client.tradeName?.toLowerCase().includes(t) ?? false) ||
            (client.companyName?.toLowerCase().includes(t) ?? false) ||
            (client.rfc?.toLowerCase().includes(t) ?? false)
          )
        }}
        actionLabel="Nuevo Cliente"
        onAction={() => handleOpenWizard()}
        onView={handleViewDetails}
        onEdit={handleOpenWizard}
        onDelete={handleDelete}
        deleteConfirmTitle={(c) => `¿Eliminar a ${c.tradeName || c.companyName}?`}
        deleteConfirmDescription="Esta acción eliminará el cliente y no se puede deshacer. Las unidades y viajes asociados podrían verse afectados."
        emptyState={{
          icon: Building2,
          title: 'Sin clientes',
          description: 'Aún no has registrado clientes. Haz clic en "Nuevo Cliente" para comenzar.',
        }}
      />

      <ClientWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        clientData={selectedClientForEdit}
        onSaved={handleCloseWizard}
      />

      <ClientDetailsDialog
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        clientRow={selectedClientForView}
      />
    </>
  )
}
