'use client'

/**
 * @fileoverview Calculadora de Rendimiento de Combustible para la directiva.
 * Permite analizar eficiencia de uso de diésel comparando rendimiento
 * teórico vs. real con filtros de fecha y kilómetros GPS.
 *
 * @organism
 */

import React, { useState, useMemo } from 'react'
import { Calculator, Fuel, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Button } from '@/src/core/presentation/components/ui/button'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { YieldCalculatorResult } from '../../../domain/entities/bi-entity'
import { YieldCalculatorService } from '../../../application/CalculateYield'

const DIESEL_PRICE_MXN = 24.5 // Precio referencia diésel MXN/L

export function YieldCalculator() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [fuelLiters, setFuelLiters] = useState('')
  const [theoreticalYield, setTheoreticalYield] = useState('2.8')
  const [dieselPrice, setDieselPrice] = useState(String(DIESEL_PRICE_MXN))
  const [calculated, setCalculated] = useState(false)

  const result = useMemo<YieldCalculatorResult | null>(() => {
    if (!calculated) return null

    const liters = Number(fuelLiters)
    const km = distanceKm ? Number(distanceKm) : null
    const theoretical = Number(theoreticalYield)
    const price = Number(dieselPrice)

    const service = new YieldCalculatorService()
    const calc = service.calculate({
      startDate,
      endDate,
      distanceKm: km && km > 0 ? km : null,
      fuelLiters: liters,
      dieselPriceMXN: price,
      theoreticalYieldKmL: theoretical,
    })

    return calc.ok ? calc.data : null
  }, [calculated, startDate, endDate, fuelLiters, distanceKm, theoreticalYield, dieselPrice])

  const handleCalculate = () => setCalculated(true)
  const handleReset = () => {
    setCalculated(false)
    setDistanceKm('')
    setFuelLiters('')
    setStartDate('')
    setEndDate('')
  }

  const efficiencyPct = result?.efficiencyPct ?? null
  const isGood = efficiencyPct !== null && efficiencyPct >= 95

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

      {/* ── Formulario de Parámetros ──────────────────────────────── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calculator className="size-5 text-[#1a5c3a]" />
            Parámetros de Análisis
          </CardTitle>
          <CardDescription>Ingresa los datos del período a analizar.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">

          {/* Rango de fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setCalculated(false) }} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input id="endDate" type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setCalculated(false) }} />
            </div>
          </div>

          {/* KM del GPS */}
          <div className="grid gap-2">
            <Label htmlFor="distanceKm">
              Kilómetros (GPS) <span className="text-stone-400 font-normal text-xs ml-1">— Opcional</span>
            </Label>
            <Input
              id="distanceKm"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej. 1850.5"
              value={distanceKm}
              onChange={e => { setDistanceKm(e.target.value); setCalculated(false) }}
            />
          </div>

          {/* Litros cargados */}
          <div className="grid gap-2">
            <Label htmlFor="fuelLiters">Litros de Diésel Cargados</Label>
            <Input
              id="fuelLiters"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej. 700"
              value={fuelLiters}
              onChange={e => { setFuelLiters(e.target.value); setCalculated(false) }}
            />
          </div>

          {/* Rendimiento teórico */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="theoreticalYield">Rendimiento Teórico (km/L)</Label>
              <Input
                id="theoreticalYield"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Ej. 2.8"
                value={theoreticalYield}
                onChange={e => { setTheoreticalYield(e.target.value); setCalculated(false) }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dieselPrice">Precio Diésel (MXN/L)</Label>
              <Input
                id="dieselPrice"
                type="number"
                min="0"
                step="0.01"
                value={dieselPrice}
                onChange={e => { setDieselPrice(e.target.value); setCalculated(false) }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCalculate}
              disabled={!fuelLiters || !theoreticalYield}
              className="flex-1 bg-[#1a5c3a] hover:bg-[#124029] text-white"
            >
              <Calculator className="size-4 mr-2" />
              Calcular Rendimiento
            </Button>
            <Button variant="outline" onClick={handleReset}>Limpiar</Button>
          </div>

        </CardContent>
      </Card>

      {/* ── Resultados ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-xl text-stone-400 gap-3">
            <Fuel className="size-10" />
            <p className="text-sm text-center px-4">Ingresa los parámetros y presiona <strong>Calcular</strong> para obtener el análisis.</p>
          </div>
        ) : (
          <>
            {/* Indicador general */}
            <div className={cn(
              'flex items-center gap-4 p-4 rounded-xl border',
              isGood
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
            )}>
              {isGood
                ? <CheckCircle className="size-6 text-emerald-600 shrink-0" />
                : <AlertCircle className="size-6 text-red-600 shrink-0" />
              }
              <div>
                <p className={cn('text-sm font-bold', isGood ? 'text-emerald-900' : 'text-red-900')}>
                  {isGood ? 'Eficiencia Aceptable' : 'Consumo por encima del parámetro'}
                </p>
                {result.efficiencyPct !== null && (
                  <p className={cn('text-xs', isGood ? 'text-emerald-700' : 'text-red-700')}>
                    {result.efficiencyPct.toFixed(1)}% del rendimiento teórico
                  </p>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">

              {result.realYieldKmL !== null && (
                <Card className="border shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-stone-500 uppercase font-medium tracking-wide">Rendimiento Real</p>
                    <p className="text-xl font-bold text-stone-900 dark:text-zinc-100 mt-1">
                      {result.realYieldKmL.toFixed(2)} <span className="text-sm font-normal text-stone-500">km/L</span>
                    </p>
                    {result.yieldDelta !== null && (
                      <div className={cn('flex items-center gap-1 text-xs mt-1 font-medium', result.yieldDelta >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                        {result.yieldDelta >= 0
                          ? <TrendingUp className="size-3" />
                          : <TrendingDown className="size-3" />
                        }
                        {result.yieldDelta >= 0 ? '+' : ''}{result.yieldDelta.toFixed(2)} vs teórico
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs text-stone-500 uppercase font-medium tracking-wide">Costo de Combustible</p>
                  <p className="text-xl font-bold text-stone-900 dark:text-zinc-100 mt-1">
                    {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(result.fuelCostMXN ?? 0)}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">{Number(fuelLiters).toLocaleString()} L × ${Number(dieselPrice).toFixed(2)}/L</p>
                </CardContent>
              </Card>

              {result.savingsOrExcessMXN !== null && (
                <Card className={cn('border shadow-sm col-span-2', result.savingsOrExcessMXN >= 0 ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500')}>
                  <CardContent className="p-4">
                    <p className="text-xs text-stone-500 uppercase font-medium tracking-wide">
                      {result.savingsOrExcessMXN >= 0 ? '✅ Ahorro vs Teórico' : '⚠️ Exceso vs Teórico'}
                    </p>
                    <p className={cn('text-2xl font-bold mt-1', result.savingsOrExcessMXN >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {result.savingsOrExcessMXN >= 0 ? '+' : ''}
                      {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(result.savingsOrExcessMXN)}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Diferencia monetaria respecto al consumo teórico esperado.
                    </p>
                  </CardContent>
                </Card>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  )
}
