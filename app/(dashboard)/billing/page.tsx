import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import BillingPage from '@/src/features/billing/presentation/components/pages/BillingPage'

export const metadata = {
  title: 'Facturación | Brito Transportes',
  description: 'Control de pre-facturación de viajes, generación de CFDI con Complemento Carta Porte 3.0',
}

export default function BillingRoute() {
  return (
    <ModuleGuard permission="billing:view">
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        <BillingPage />
      </div>
    </ModuleGuard>
  )
}
