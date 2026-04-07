import { Metadata } from 'next'
import { LoginLeftPanel } from '@/src/features/auth/presentation/components/organisms/LoginLeftPanel'
import { LoginForm } from '@/src/features/auth/presentation/components/organisms/LoginForm'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Transportes Brito',
  description: 'Accede a la plataforma de gestión logística y seguridad de Transportes Brito.',
}

/**
 * @fileoverview Página de Login principal.
 * Ensambla el layout de dos columnas según el diseño de UI especificado.
 */
export default function LoginPage() {
  return (
    <>
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-8 flex gap-4 opacity-40 z-50 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
      </div>

      <main className="flex min-h-screen w-full relative">
        <LoginLeftPanel />

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-2/5 min-h-screen bg-on-surface flex flex-col items-center justify-center px-8 sm:px-16 md:px-24 relative overflow-y-auto">
          <LoginForm />
        </section>
      </main>
    </>
  )
}
