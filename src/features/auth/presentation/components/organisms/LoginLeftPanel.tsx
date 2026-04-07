'use client'

/**
 * @fileoverview LoginLeftPanel.
 * Proporciona el ancla visual de la marca y las estadísticas clave
 * mediante un diseño estilo Bento.
 */

export function LoginLeftPanel() {
  return (
    <section className="hidden lg:flex lg:w-3/5 relative min-h-screen items-end p-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Modern logistics truck on a highway" 
          className="w-full h-full object-cover" 
          src="/assets/images/hero-login.jpeg"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-on-surface via-on-surface/40 to-transparent"></div>
      </div>
      
      <div className="relative z-10 w-full">
        {/* Brand Anchor inside the image area */}
        <div className="mb-12">
          <span className="text-primary-container font-headline text-4xl font-extrabold tracking-tight">Transportes Brito</span>
        </div>
        
        <div className="max-w-2xl">
          <h2 className="font-headline text-5xl font-extrabold text-surface-bright leading-tight mb-6">
            La plataforma que impulsa tus operaciones logísticas
          </h2>
          <p className="text-xl text-surface-variant/80 font-body mb-12">
            Monitoreo en tiempo real para optimizar cada kilómetro.
          </p>
        </div>

        {/* Bento-style Stats Grid */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-glass p-6 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              <span className="text-xs uppercase tracking-widest text-surface-variant font-label">Flota Activa</span>
            </div>
            <div className="font-headline text-3xl font-bold text-surface">1,284</div>
            <div className="text-[10px] text-primary-container font-medium mt-1">+12% vs ayer</div>
          </div>

          <div className="bg-glass p-6 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
              <span className="text-xs uppercase tracking-widest text-surface-variant font-label">Entregas Hoy</span>
            </div>
            <div className="font-headline text-3xl font-bold text-surface">8,492</div>
            <div className="text-[10px] text-secondary-container font-medium mt-1">94% eficiencia</div>
          </div>

          <div className="bg-glass p-6 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              <span className="text-xs uppercase tracking-widest text-surface-variant font-label">Optimización</span>
            </div>
            <div className="font-headline text-3xl font-bold text-surface">98.2%</div>
            <div className="text-[10px] text-primary-fixed font-medium mt-1">Consumo bajo</div>
          </div>
        </div>
      </div>
    </section>
  )
}
