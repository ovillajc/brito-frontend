'use client'

/**
 * @fileoverview Página principal de Gastos Operativos refactorizada al estilo Trips.
 */

import React from 'react'
import { ExpensesTable } from '../organisms/ExpensesTable'

export default function ExpensesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos Operativos</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Gestión de gastos operativos generales y por viaje.</p>
        </div>
      </div>

      {/* ── KPIs / Stats Rápidos (Placeholder) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Placeholder cards para futuras integraciones */}
      </div>

      {/* ── Tabla principal ─────────────────────────────────────── */}
      <ExpensesTable />
    </div>
  )
}
