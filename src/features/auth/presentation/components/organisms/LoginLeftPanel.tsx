'use client'

/**
 * @fileoverview LoginLeftPanel.
 * Proporciona el ancla visual de la marca estructurada como una imagen corporativa
 * de acuerdo con el rediseño.
 */

export function LoginLeftPanel() {
  return (
    <section className="hidden lg:flex lg:w-1/2 p-4 lg:p-6 bg-primary">
      <div className="relative w-full grow overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 z-10 bg-linear-to-r from-primary/20 to-transparent"></div>
        <img 
          alt="Modern semi-truck on highway" 
          className="absolute inset-0 w-full h-full object-cover grayscale-20 contrast-[1.1]" 
          src="/assets/images/hero-login.jpeg"
        />
        
        {/* Editorial Overlay */}
        <div className="absolute bottom-16 left-12 z-20 max-w-md">
          <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
            Logística 4.0
          </span>
          <h2 className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg font-headline">
            Precisión en <br/>
            <span className="text-primary-fixed">cada kilómetro.</span>
          </h2>
          <p className="mt-6 text-white/90 text-lg leading-relaxed max-w-sm">
            Impulsando las cadenas de suministro más ágiles del mundo a través de inteligencia cinética y claridad en tiempo real.
          </p>
        </div>
      </div>
    </section>
  )
}
