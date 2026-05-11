/**
 * @fileoverview Use Case: Calcular rendimiento por tramo de cargas del MOTOR.
 *
 * Toma la lista de cargas del tracto ordenadas por odómetro y calcula,
 * para cada tramo, los km recorridos y el rendimiento real (km/L).
 *
 * El rendimiento de cada tramo se calcula usando los LITROS DE LA CARGA ANTERIOR,
 * ya que esos fueron los litros consumidos para recorrer esa distancia.
 *
 * Solo las cargas con isFullTankFill = true producen rendimientos confiables.
 * Las cargas parciales (ej. 10L para llegar al Cedis) se incluyen en los
 * segmentos pero se marcan implícitamente mediante isFullTankFill = false.
 *
 * @param truckLoads - Cargas de combustible del tracto (vehicle_type = 'TRUCK'),
 *                     NO necesitan venir ordenadas (la función ordena por odómetro).
 * @returns Lista de segmentos calculados. El primer elemento no tiene kmSegment
 *          ni realYieldSegment (no hay carga previa como referencia).
 */

import type { FuelLoadEntity, FuelLoadSegmentEntity } from '../domain/entities/fuel-metrics-entity'

export function GetFuelLoadSegments(
  truckLoads: FuelLoadEntity[]
): FuelLoadSegmentEntity[] {
  // Solo podemos calcular tramos si hay odómetro registrado
  const withOdometer = truckLoads
    .filter((fl) => fl.odometerAtLoad !== null)
    .sort((a, b) => (a.odometerAtLoad ?? 0) - (b.odometerAtLoad ?? 0))

  if (withOdometer.length === 0) return []

  return withOdometer.map((load, i): FuelLoadSegmentEntity => {
    const prev = i > 0 ? withOdometer[i - 1] : null

    const kmSegment =
      prev !== null && prev.odometerAtLoad !== null && load.odometerAtLoad !== null
        ? load.odometerAtLoad - prev.odometerAtLoad
        : null

    // Rendimiento = km del tramo / litros cargados en la carga ANTERIOR
    // (esos son los litros que "consumió" para llegar hasta aquí)
    const realYieldSegment =
      kmSegment !== null && prev !== null && prev.litersLoaded > 0
        ? kmSegment / prev.litersLoaded
        : null

    return {
      loadId: load.id,
      loadDate: load.loadDate,
      odometerAtLoad: load.odometerAtLoad,
      litersLoaded: load.litersLoaded,
      isFullTankFill: load.isFullTankFill,
      kmSegment,
      realYieldSegment,
    }
  })
}
