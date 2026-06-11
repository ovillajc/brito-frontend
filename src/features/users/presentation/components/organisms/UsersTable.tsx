'use client'

import React, { useEffect, useState } from 'react'
import { useUsersStore } from '../../store/users-store'
import { CrudDataTable } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { UserAccountEntity } from '../../../domain/entities/user-account.entity'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Shield, Calendar, Mail, ShieldAlert } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { UserForm } from '../molecules/UserForm'

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

type UserFormValues = {
  email: string
  fullName: string
  password?: string
  roleIds: string[]
}

export function UsersTable() {
  const users = useUsersStore((state) => state.users)
  const isLoading = useUsersStore((state) => state.isLoading)
  const fetchUsers = useUsersStore((state) => state.fetchUsers)
  const fetchRoles = useUsersStore((state) => state.fetchRoles)
  const createUser = useUsersStore((state) => state.createUser)
  const updateUser = useUsersStore((state) => state.updateUser)
  const updateUserPassword = useUsersStore((state) => state.updateUserPassword)
  const deleteUser = useUsersStore((state) => state.deleteUser)
  
  const canManage = useAuthStore((state) => state.hasPermission('all_access'))

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserAccountEntity | undefined>()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  const handleAdd = () => {
    setSelectedUser(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (user: UserAccountEntity) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values: UserFormValues) => {
    let success = false
    if (selectedUser) {
      const newPassword = typeof values.password === 'string' ? values.password.trim() : ''
      if (newPassword.length > 0) {
        const passwordOk = await updateUserPassword({ userId: selectedUser.id, password: newPassword })
        if (!passwordOk) return
      }

      success = await updateUser({
        id: selectedUser.id,
        fullName: values.fullName,
        roleIds: values.roleIds
      })
    } else {
      success = await createUser({
        email: values.email,
        fullName: values.fullName,
        password: typeof values.password === 'string' ? values.password : undefined,
        roleIds: values.roleIds
      })
    }

    if (success) {
      setIsModalOpen(false)
    }
  }

  const columns = [
    {
      header: 'Usuario',
      cell: (user: UserAccountEntity) => {
        return (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {user.fullName?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-stone-900 dark:text-zinc-100">
                {user.fullName || 'Sin nombre'}
              </span>
              <span className="text-xs text-stone-500 dark:text-zinc-500 flex items-center gap-1">
                <Mail className="size-3" />
                {user.email}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Roles',
      cell: (user: UserAccountEntity) => {
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {user.roles.length > 0 ? (
              user.roles.map(role => (
                <Badge key={role.id} variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase py-0 px-2 h-5">
                  <Shield className="size-2.5 mr-1" />
                  {role.name.replace(/_/g, ' ')}
                </Badge>
              ))
            ) : (
              <span className="text-[10px] text-stone-400 italic">Sin roles</span>
            )}
          </div>
        )
      }
    },
    {
      header: 'Último Acceso',
      cell: (user: UserAccountEntity) => {
        const date = user.lastSignInAt
        return date ? (
          <span className="text-xs text-stone-600 dark:text-zinc-400">
            {new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date))}
          </span>
        ) : (
          <span className="text-xs text-stone-400 italic">Nunca registrado</span>
        )
      }
    },
    {
      header: 'Registro',
      cell: (user: UserAccountEntity) => {
        const date = user.createdAt
        return (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Calendar className="size-3" />
            {new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))}
          </div>
        )
      }
    }
  ]

  return (
    <>
      <CrudDataTable<UserAccountEntity>
        canManage={canManage}
        data={users}
        columns={columns}
        searchPlaceholder="Buscar por nombre o correo..."
        searchFilter={(user, term) => 
          user.fullName?.toLowerCase().includes(term.toLowerCase()) || 
          user.email.toLowerCase().includes(term.toLowerCase())
        }
        isLoading={isLoading}
        actionLabel="Nuevo Usuario"
        onAction={handleAdd}
        onEdit={handleEdit}
        onDelete={async (id) => {
          const ok = await deleteUser(id)
          return { ok }
        }}
        emptyState={{
          icon: ShieldAlert,
          title: 'Sin usuarios',
          description: 'No hay cuentas de usuario registradas o no coinciden con la búsqueda.'
        }}
      />

      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={selectedUser 
          ? 'Modifica los datos del perfil y roles de acceso.' 
          : 'Crea una nueva cuenta de acceso y asigna sus responsabilidades.'}
        size="sm"
      >
        <div className="py-4 px-6">
          <UserForm 
            initialData={selectedUser} 
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
          />
        </div>
      </Dialog>
    </>
  )
}
