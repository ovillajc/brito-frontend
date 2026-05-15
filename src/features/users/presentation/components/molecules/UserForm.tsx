'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserAccountEntity } from '../../../domain/entities/user-account.entity'
import { useUsersStore } from '../../store/users-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/core/presentation/components/ui/form'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Checkbox } from '@/src/core/presentation/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  roleIds: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  initialData?: UserAccountEntity
  onSubmit: (data: UserFormValues) => Promise<void>
  onCancel: () => void
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const roles = useUsersStore((state) => state.roles)
  const isLoading = useUsersStore((state) => state.isLoading)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email || '',
      fullName: initialData?.fullName || '',
      password: '',
      roleIds: initialData?.roles.map((r) => r.id) || [],
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="correo@brito.com" 
                    {...field} 
                    disabled={!!initialData} // Email no se cambia normalmente
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!initialData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="space-y-3">
            <FormLabel>Roles Asignados</FormLabel>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-4 bg-stone-50 dark:bg-zinc-900/50">
              {roles.map((role) => (
                <FormField
                  key={role.id}
                  control={form.control}
                  name="roleIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(role.id)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            return checked
                              ? field.onChange([...field.value, role.id])
                              : field.onChange(field.value?.filter((value) => value !== role.id))
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs font-medium cursor-pointer">
                          {role.name.replace(/_/g, ' ')}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormMessage />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
