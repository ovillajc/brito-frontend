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
    <main className="relative flex min-h-screen">
      <LoginLeftPanel />

      {/* Right Panel — Login Form */}
      <section className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[45%] xl:w-[40%] bg-surface">
        <div className="w-full max-w-sm flex flex-col gap-10">
          {/* Mobile brand */}
          <div className="lg:hidden">
            <span className="text-primary font-headline text-3xl font-extrabold tracking-tight">Transportes Brito</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-on-surface font-headline">
              Acceso a plataforma
            </h2>
            <p className="text-sm text-on-surface-variant font-body mb-2">
              Ingresa tus credenciales corporativas para continuar
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/50" />
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-medium">
              Acceso seguro
            </span>
            <div className="h-px flex-1 bg-outline-variant/50" />
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
            <div className="flex items-center justify-center size-8 rounded-md bg-secondary-container/20">
              <span className="material-symbols-outlined text-secondary text-[16px]">security</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-on-surface">
                Conexión cifrada de extremo a extremo
              </span>
              <span className="text-[10px] text-on-surface-variant">
                Protocolo TLS 1.3 — Certificado verificado
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-on-surface-variant">
            © {new Date().getFullYear()} Transportes Brito. Todos los derechos reservados.
          </p>
        </div>
      </section>
    </main>
  )
}
