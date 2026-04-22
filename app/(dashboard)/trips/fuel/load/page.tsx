/**
 * @fileoverview Página de registro de carga de diésel — Vista del Guardia/Supervisor.
 *
 * Esta ruta es simplificada: solo muestra el formulario de carga.
 * El guardia no puede ver métricas ni datos de km.
 */

import FuelLoadPageClient from '@/src/features/trips/presentation/components/pages/FuelLoadPage'

export default function FuelLoadRoute() {
  return <FuelLoadPageClient />
}
