import { create } from 'zustand'
import { UserAccountEntity, CreateUserAccountInput, UpdateUserAccountInput } from '../../domain/entities/user-account.entity'
import { SupabaseUserAccountRepository } from '../../infrastructure/repositories/supabase-user-account.repository'
import { GetUserAccounts } from '../../application/use-cases/GetUserAccounts'
import { createUserAdminAction, updateUserPasswordAdminAction } from '../../application/actions/create-user.action'
import { toast } from 'sonner'

type RoleListItem = {
  id: string
  name: string
  description: string | null
}

interface UsersState {
  users: UserAccountEntity[]
  roles: RoleListItem[]
  isLoading: boolean
  error: string | null
  
  // Acciones
  fetchUsers: () => Promise<void>
  fetchRoles: () => Promise<void>
  createUser: (input: CreateUserAccountInput) => Promise<boolean>
  updateUser: (input: UpdateUserAccountInput) => Promise<boolean>
  updateUserPassword: (input: { userId: string; password: string }) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
}

const repo = new SupabaseUserAccountRepository()

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  roles: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    const result = await GetUserAccounts(repo)
    
    if (result.ok) {
      set({ users: result.data, isLoading: false })
    } else {
      set({ error: result.error.message, isLoading: false })
      toast.error('Error al cargar usuarios')
    }
  },

  fetchRoles: async () => {
    const result = await repo.getRoles()
    if (result.ok) {
      set({ roles: result.data })
    }
  },

  createUser: async (input) => {
    set({ isLoading: true })
    const result = await createUserAdminAction({
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      roleIds: input.roleIds
    })
    
    if (result.ok) {
      await get().fetchUsers()
      toast.success('Usuario creado correctamente')
      return true
    } else {
      set({ isLoading: false })
      toast.error(`Error: ${result.error.message}`)
      return false
    }
  },

  updateUser: async (input) => {
    set({ isLoading: true })
    const result = await repo.update(input)
    
    if (result.ok) {
      await get().fetchUsers()
      toast.success('Usuario actualizado')
      return true
    } else {
      set({ isLoading: false })
      toast.error(`Error: ${result.error.message}`)
      return false
    }
  },

  updateUserPassword: async (input) => {
    set({ isLoading: true })
    const result = await updateUserPasswordAdminAction(input)

    if (result.ok) {
      toast.success('Contraseña actualizada')
      set({ isLoading: false })
      return true
    }

    set({ isLoading: false })
    toast.error(`Error: ${result.error.message}`)
    return false
  },

  deleteUser: async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return false
    
    set({ isLoading: true })
    const result = await repo.delete(id)
    
    if (result.ok) {
      await get().fetchUsers()
      toast.success('Usuario eliminado')
      return true
    } else {
      set({ isLoading: false })
      toast.error(`Error: ${result.error.message}`)
      return false
    }
  }
}))
