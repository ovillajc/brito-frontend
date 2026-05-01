export const EXPENSE_SCOPE = {
  General: 'general',
  Trip: 'trip',
} as const

export type ExpenseScope = typeof EXPENSE_SCOPE[keyof typeof EXPENSE_SCOPE]

export const EXPENSE_CATEGORY = {
  Permits: 'permits',
  Certifications: 'certifications',
  InventoryPurchase: 'inventory_purchase',
  SpareParts: 'spare_parts',
  Tools: 'tools',
  PPE: 'ppe',
  Tolls: 'tolls',
  FuelLoad: 'fuel_load',
  BaseTankLoad: 'base_tank_load',
  TripIncidents: 'trip_incidents',
  Maintenance: 'maintenance',
  Other: 'other',
} as const

export type ExpenseCategory =
  typeof EXPENSE_CATEGORY[keyof typeof EXPENSE_CATEGORY]

export interface ExpenseEntity {
  id: string
  companyId: string
  scope: ExpenseScope
  category: ExpenseCategory
  description: string
  amount: number
  currency: 'MXN'
  occurredAt: Date
  vendorName: string | null
  reference: string | null
  tripId: string | null
  createdAt: Date
}

