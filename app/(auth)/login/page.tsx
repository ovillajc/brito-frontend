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
      {/* TopNavBar */}
      <nav className="w-full absolute top-0 z-50 bg-transparent flex justify-between items-center px-8 py-6 font-headline antialiased">
        <div className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 ml-4 mt-4">
          <span className="w-8 h-8 bg-linear-to-br from-primary to-primary-container rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>fluid_med</span>
          </span>
          Transportes Brito
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a className="text-slate-600 hover:text-primary transition-colors text-sm font-medium" href="#">Soporte</a>
        </div>
      </nav>

      <main className="flex min-h-screen w-full">
        {/* Left Side: Card Style Visual Anchor */}
        <LoginLeftPanel />

        {/* Right Side: Login Canvas */}
        <section className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:px-16 lg:py-12 xl:p-24 bg-surface overflow-y-auto overflow-x-hidden relative">
          <LoginForm />
        </section>
      </main>
    </>
  )
}
