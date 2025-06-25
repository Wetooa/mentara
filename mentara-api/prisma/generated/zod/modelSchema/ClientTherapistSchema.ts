import { z } from 'zod';

/////////////////////////////////////////
// CLIENT THERAPIST SCHEMA
/////////////////////////////////////////

export const ClientTherapistSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string(),
  therapistId: z.string(),
  assignedAt: z.coerce.date(),
  status: z.string(),
  notes: z.string().nullable(),
  score: z.number().int().nullable(),
})

export type ClientTherapist = z.infer<typeof ClientTherapistSchema>

export default ClientTherapistSchema;
