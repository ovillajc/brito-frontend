'use client'

import { useLogin } from '../../hooks/use-login'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/src/core/presentation/components/ui/form'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * @fileoverview LoginForm.
 * Formulario basándose en el diseño limpio de PetroFlow, utilizando colores de Brito.
 */

export function LoginForm() {
  const { form, handleLogin, isLoading } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  // TODO: Eliminar el uso de estas variables de entorno de prueba antes de lanzar a producción
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USER_EMAIL) {
      form.setValue('email', process.env.NEXT_PUBLIC_USER_EMAIL)
    }
    if (process.env.NEXT_PUBLIC_USER_PASSWORD) {
      form.setValue('password', process.env.NEXT_PUBLIC_USER_PASSWORD)
    }
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin as any)} className="flex flex-col gap-6">
        
        {/* Email */}
        <FormField
          control={form.control as any}
          name="email"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <label htmlFor="email" className="text-on-surface-variant text-xs tracking-widest uppercase font-medium">
                Correo corporativo
              </label>
              <div className="relative">
                <FormControl>
                  <input
                    id="email"
                    type="email"
                    placeholder="usuario@transportesbrito.com"
                    className="h-12 w-full px-3 border border-outline-variant/50 bg-surface-container-highest/30 text-on-surface placeholder:text-outline focus-visible:outline-hidden focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-sm transition-colors"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-error text-xs" />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control as any}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 space-y-0">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-on-surface-variant text-xs tracking-widest uppercase font-medium">
                  Contraseña
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Recuperar acceso
                </Link>
              </div>
              <div className="relative">
                <FormControl>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    className="h-12 w-full pl-3 pr-10 border border-outline-variant/50 bg-surface-container-highest/30 text-on-surface placeholder:text-outline focus-visible:outline-hidden focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg text-sm transition-colors"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <FormMessage className="text-error text-xs" />
            </FormItem>
          )}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full mt-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90 font-semibold text-sm tracking-wide transition-all duration-300 group flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
              Verificando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </span>
          )}
        </button>
      </form>
    </Form>
  )
}
