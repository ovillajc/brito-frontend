/**
 * @fileoverview Página de Calculadora de Rendimiento — BI Gerencial.
 */

import React from 'react'
import { YieldCalculator } from '../organisms/YieldCalculator'

export default function BiYieldCalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Calculadora de Rendimiento
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
          Analiza la eficiencia de consumo de diésel comparando rendimiento real vs. teórico por período y kilómetros GPS.
        </p>
      </div>

      <YieldCalculator />
    </div>
  )
}
