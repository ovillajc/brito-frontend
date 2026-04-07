/**
 * @fileoverview Footer del dashboard.
 * Muestra branding, última sincronización y derechos.
 */

import React from 'react'

/**
 * Footer minimalista del dashboard.
 */
export function DashboardFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-lowest/50 px-6 py-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-6 rounded-md bg-primary text-on-primary text-[9px] font-bold">
          SB
        </div>
        <span className="text-[10px] text-on-surface-variant tracking-wide">
          Sociedad Brito Platform v1.0.0
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <span className="text-[10px] text-on-surface-variant">
          Última sincronización: hace 2 min
        </span>
        <div className="h-3 w-px bg-outline-variant/30" />
        <span className="text-[10px] text-on-surface-variant">
          2026 Sociedad Brito. Todos los derechos reservados.
        </span>
      </div>
    </footer>
  )
}
