import { z } from 'zod'

export const createTripSettlementSchema = z.object({
  tripId: z.string().uuid(),
  operatorId: z.string().uuid().nullable().optional(),
  receiptUrl: z.union([z.string().url('URL inválida'), z.literal(''), z.null()]).transform(v => v === '' ? null : v).default(null),
  notes: z.string().trim().nullable().optional(),
})

export type CreateTripSettlementInput = z.infer<typeof createTripSettlementSchema>

