'use client'

/**
 * @fileoverview LoginLeftPanel.
 * Proporciona el ancla visual de la marca y las estadísticas clave
 * mediante un diseño basado en PetroFlow pero adaptado a Transportes Brito.
 */

export function LoginLeftPanel() {
  return (
    <section 
      className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden" 
      aria-hidden="true"
    >
      {/* Background Image */}
      <img 
        alt="Modern logistics truck on a highway" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        src="/assets/images/hero-login.jpeg"
      />
      
      {/* Dark overlay adapting Brito's colors for reading contrast */}
      <div className="absolute inset-0 bg-on-surface/55 z-0" />

      {/* Accent line like Petro */}
      <div className="absolute left-0 top-0 h-full w-1 bg-primary-container z-10" />

      {/* Top content */}
      <div className="relative z-10 p-10">
        <span className="text-primary-container font-headline text-3xl font-extrabold tracking-tight">Transportes Brito</span>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col gap-6 px-10 pb-6 mt-96">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-primary-fixed">
            Control Logístico
          </p>
          <h1 className="text-4xl font-bold leading-tight text-surface-bright font-headline text-balance xl:text-5xl">
            La plataforma que impulsa tus operaciones logísticas
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-surface-variant font-body">
            Monitoreo en tiempo real, análisis predictivo y gestión centralizada para optimizar cada kilómetro de tu flota.
          </p>
        </div>
      </div>

      {/* Bottom stats layout from Petro */}
      <div className="relative z-10 p-10 pt-5">
        <div className="grid grid-cols-2 gap-3 max-w-2xl">
          {/* Stat 1 */}
          <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container/20 backdrop-blur-md p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary-container">local_shipping</span>
              <span className="text-[10px] text-surface-variant font-medium uppercase tracking-wider">Flota Activa</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-bright font-headline tabular-nums">1,284</span>
              <span className="text-[10px] text-primary-container font-medium">+12%</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container/20 backdrop-blur-md p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-secondary-container">package_2</span>
              <span className="text-[10px] text-surface-variant font-medium uppercase tracking-wider">Entregas Hoy</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-bright font-headline tabular-nums">8,492</span>
              <span className="text-[10px] text-secondary-container font-medium">unid.</span>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container/20 backdrop-blur-md p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-primary-fixed">speed</span>
              <span className="text-[10px] text-surface-variant font-medium uppercase tracking-wider">Eficiencia</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-bright font-headline tabular-nums">98.2</span>
              <span className="text-[10px] text-primary-fixed font-medium">%</span>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="flex flex-col gap-1 rounded-lg border border-outline-variant/30 bg-surface-container/20 backdrop-blur-md p-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">health_and_safety</span>
              <span className="text-[10px] text-surface-variant font-medium uppercase tracking-wider">Seguridad</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-surface-bright font-headline tabular-nums">99.9</span>
              <span className="text-[10px] text-tertiary-fixed font-medium">%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
