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
 * Componente que renderiza el formulario de inicio de sesión con el nuevo diseño "Stitch".
 * Incluye validaciones, gestión de errores y elementos específicos para móvil.
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
    <div className="w-full max-w-md">
      {/* Mobile Brand Header */}
      <div className="lg:hidden absolute top-12 left-8">
        <span className="text-primary-container font-headline text-3xl font-extrabold tracking-tight">Transportes Brito</span>
      </div>

      <header className="mb-10">
        <h1 className="font-headline text-4xl font-bold text-surface-bright mb-2">Acceso a plataforma</h1>
        <p className="text-surface-variant/60 font-body">Ingresa tus credenciales para gestionar la flota.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin as any)} className="space-y-6">
          {/* Field: Correo Corporativo */}
          <FormField
            control={form.control as any}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <label className="block text-sm font-medium text-surface-variant/80 ml-1" htmlFor="email">
                  Correo Corporativo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">mail</span>
                  </div>
                  <FormControl>
                    <input
                      id="email"
                      className="block w-full bg-surface-container-highest/10 border-0 rounded-xl py-4 pl-12 pr-4 text-surface placeholder-outline focus:ring-2 focus:ring-primary-container/30 focus:bg-surface-container-highest/20 transition-all outline-none"
                      placeholder="nombre@transportesbrito.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-error mt-1" />
              </FormItem>
            )}
          />

          {/* Field: Contraseña */}
          <FormField
            control={form.control as any}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-sm font-medium text-surface-variant/80" htmlFor="password">
                    Contraseña
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-xs text-primary-container hover:text-primary-fixed transition-colors font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-lg">lock</span>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <input
                        id="password"
                        className="block w-full bg-surface-container-highest/10 border-0 rounded-xl py-4 pl-12 pr-4 text-surface placeholder-outline focus:ring-2 focus:ring-primary-container/30 focus:bg-surface-container-highest/20 transition-all outline-none"
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant transition-colors"
                      >
                         <span className="material-symbols-outlined">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage className="text-error mt-1" />
              </FormItem>
            )}
          />

          {/* Remember Me Field */}
          <FormField
            control={form.control as any}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <label className="relative flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <div className="w-5 h-5 bg-surface-container-highest/10 rounded-md peer-checked:bg-secondary-container transition-colors flex items-center justify-center border border-outline/20">
                      <span className="material-symbols-outlined text-surface-variant/80 text-[16px] hidden peer-checked:block">check</span>
                    </div>
                    <span className="ml-3 text-sm font-medium text-surface-variant/80 group-hover:text-surface transition-colors">
                      Recordar este dispositivo
                    </span>
                  </label>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <button 
            className="w-full bg-linear-to-r from-secondary-container to-secondary py-4 px-6 rounded-xl text-white font-headline font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 active:scale-[0.98] transition-all group mt-8 disabled:opacity-70 disabled:hover:scale-100 disabled:shadow-none hover:cursor-pointer" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>
      </Form>

      {/* Footer Stats for Mobile only */}
      <div className="mt-12 lg:hidden grid grid-cols-2 gap-4">
        <div className="bg-surface-container-highest/10 p-4 rounded-lg">
          <div className="text-[10px] uppercase text-outline mb-1">Flota</div>
          <div className="font-bold text-surface">1.2k+</div>
        </div>
        <div className="bg-surface-container-highest/10 p-4 rounded-lg">
          <div className="text-[10px] uppercase text-outline mb-1">Uptime</div>
          <div className="font-bold text-surface">99.9%</div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-xs text-outline font-label tracking-wide">
          © {new Date().getFullYear()} Transportes Brito. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
