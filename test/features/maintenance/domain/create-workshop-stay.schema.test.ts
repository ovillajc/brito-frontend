import { describe, expect, it } from 'vitest'
import { createWorkshopStaySchema } from '@/src/features/maintenance/domain/schemas/create-stay.schema'
import { VEHICLE_TYPE } from '@/src/features/maintenance/domain/entities/maintenance-entity'

describe('createWorkshopStaySchema', () => {
  it('requiere truckId cuando vehicleType es TRUCK', () => {
    const result = createWorkshopStaySchema.safeParse({
      folio: '2026-01-03-TALLER-0001',
      vehicleType: VEHICLE_TYPE.Truck,
      truckId: null,
      trailerId: null,
      enteredAt: '2026-01-03',
      reason: 'Falla',
      kmAtEntry: null,
      deliveredByEmployeeId: null,
      pickedUpByEmployeeId: null,
      lastTripId: null,
    })

    expect(result.success).toBe(false)
  })

  it('requiere trailerId cuando vehicleType es TRAILER', () => {
    const result = createWorkshopStaySchema.safeParse({
      folio: '2026-01-03-TALLER-0001',
      vehicleType: VEHICLE_TYPE.Trailer,
      truckId: null,
      trailerId: null,
      enteredAt: '2026-01-03',
      reason: 'Falla',
      kmAtEntry: null,
      deliveredByEmployeeId: null,
      pickedUpByEmployeeId: null,
      lastTripId: null,
    })

    expect(result.success).toBe(false)
  })
})

