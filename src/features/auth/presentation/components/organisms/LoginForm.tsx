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
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

/**
 * @fileoverview LoginForm.
 * Formulario basándose en el diseño de Landing Page de Brito.
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
              <label htmlFor="email" className="text-stone-500 text-xs tracking-widest uppercase font-bold">
                Correo corporativo
              </label>
              <div className="relative">
                <FormControl>
                  <input
                    id="email"
                    type="email"
                    placeholder="usuario@transportesbrito.com"
                    className="h-12 w-full px-4 border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus-visible:outline-hidden focus-visible:border-[#1a5c3a] focus-visible:ring-1 focus-visible:ring-[#1a5c3a]/20 rounded-xl text-sm font-medium transition-colors"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="text-red-600 text-xs font-bold" />
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
                <label htmlFor="password" className="text-stone-500 text-xs tracking-widest uppercase font-bold">
                  Contraseña
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-bold text-[#e07020] hover:text-[#e07020]/80 transition-colors"
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
                    className="h-12 w-full pl-4 pr-12 border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus-visible:outline-hidden focus-visible:border-[#1a5c3a] focus-visible:ring-1 focus-visible:ring-[#1a5c3a]/20 rounded-xl text-sm font-medium transition-colors"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors hover:cursor-pointer"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 hover:cursor-pointer" />
                  ) : (
                    <Eye className="w-5 h-5 hover:cursor-pointer" />
                  )}
                </button>
              </div>
              <FormMessage className="text-red-600 text-xs font-bold" />
            </FormItem>
          )}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full mt-4 rounded-xl bg-[#1a5c3a] text-white hover:bg-[#1a5c3a]/90 font-bold text-sm tracking-wide transition-all duration-300 group flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#1a5c3a]/20 hover:cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Verificando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </button>
      </form>
    </Form>
  )
}
