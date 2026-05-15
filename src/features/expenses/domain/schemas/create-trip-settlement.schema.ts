import { z } from 'zod'

export const createTripSettlementSchema = z.object({
  tripId: z.string().uuid(),
  operatorId: z.string().uuid().nullable().default(null),
  receiptUrl: z.string().url('URL inválida').nullable().default(null),
  notes: z.string().trim().nullable().default(null),
})

export type CreateTripSettlementInput = z.infer<typeof createTripSettlementSchema>

