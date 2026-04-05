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
 * Componente que renderiza el formulario de inicio de sesión orientado al rediseño Material.
 * Incluye validaciones y gestión de errores sin botones de login social.
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
    <div className="w-full max-w-md grow flex flex-col justify-center pt-24 lg:pt-12 xl:pt-0">
      {/* Branding for Mobile */}
      <div className="lg:hidden mb-12">
        <div className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
          <span className="w-10 h-10 bg-linear-to-br from-primary to-primary-container rounded-xl flex items-center justify-center text-white">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fluid_med</span>
          </span>
          Transportes Brito
        </div>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Bienvenido de nuevo</h1>
        <p className="text-on-surface-variant">Accede a tu centro de control logístico</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin as any)} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control as any}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                    Correo electrónico o usuario
                  </label>
                  <FormControl>
                    <input
                      id="email"
                      placeholder="conductor@transportesbrito.com"
                      className="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-error" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control as any}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      Contraseña
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-secondary hover:text-on-secondary-fixed-variant transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 outline-none"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface-variant"
                      >
                         <span className="material-symbols-outlined">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-error" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            {/* Remember Me Checkbox */}
            <FormField
              control={form.control as any}
              name="rememberMe"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="relative flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <div className="w-5 h-5 bg-surface-container-high rounded-md peer-checked:bg-secondary-container transition-colors flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[16px] hidden peer-checked:block">check</span>
                      </div>
                      <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                        Recordar este dispositivo
                      </span>
                    </label>
                  </FormControl>
                  <FormMessage className="text-error" />
                </FormItem>
              )}
            />
          </div>
          
          {/* Primary Action */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 bg-linear-to-r from-primary to-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      </Form>

      {/* Footer / Helper Links */}
      <div className="mt-8 pt-8 border-t border-outline-variant/10">
        <p className="text-sm text-on-surface-variant text-center">
          ¿Eres nuevo?{' '}
          <Link href="/auth/signup" className="font-bold text-primary hover:underline underline-offset-4">
            Contacta al administrador
          </Link>
        </p>
      </div>

      {/* Container Footer */}
      <div className="mt-8 w-full max-w-md">
        <p className="text-[10px] tracking-wider text-outline text-center uppercase font-medium">
          © {new Date().getFullYear()} TRANSPORTES BRITO. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
    </div>
  )
}
