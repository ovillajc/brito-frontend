import { Metadata } from 'next'
import { LoginLeftPanel } from '@/src/features/auth/presentation/components/organisms/LoginLeftPanel'
import { LoginForm } from '@/src/features/auth/presentation/components/organisms/LoginForm'
import { ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/src/core/presentation/components/ui/brand-logo'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Transportes Brito',
  description: 'Accede a la plataforma de gestión logística y seguridad de Transportes Brito.',
}

/**
 * @fileoverview Página de Login principal.
 * Ensambla el layout de dos columnas según el diseño de UI especificado.
 * Rediseñado con los estilos y colores de Transportes Brito.
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen lg:h-screen lg:overflow-hidden">
      <LoginLeftPanel />

      {/* Right Panel — Login Form */}
      <section className="flex w-full flex-col items-center px-6 py-12 lg:w-[45%] xl:w-[40%] bg-white lg:overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col gap-10 my-auto">
          {/* Mobile brand */}
          <div className="lg:hidden flex justify-center">
            <BrandLogo theme="dark" size="lg" />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-stone-900">
              Acceso a plataforma
            </h2>
            <p className="text-sm text-stone-500 font-medium mb-2">
              Ingresa tus credenciales corporativas para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200" />
            <span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold">
              Acceso seguro
            </span>
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-center size-10 rounded-lg bg-[#e07020]/10 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#e07020]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-stone-900">
                Conexión cifrada de extremo a extremo
              </span>
              <span className="text-[10px] text-stone-500 font-medium whitespace-nowrap">
                Protocolo TLS 1.3 — Certificado verificado
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-stone-400 font-medium">
            © {new Date().getFullYear()} Transportes Brito. Todos los derechos reservados.
          </p>
        </div>
      </section>
    </main>
  )
}
