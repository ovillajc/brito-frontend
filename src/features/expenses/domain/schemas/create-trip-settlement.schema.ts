import { z } from 'zod'

export const createTripSettlementSchema = z.object({
  tripId: z.string().uuid(),
  operatorId: z.string().uuid().nullable().optional(),
  receiptUrl: z.string().url().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
})

export type CreateTripSettlementInput = z.infer<typeof createTripSettlementSchema>

