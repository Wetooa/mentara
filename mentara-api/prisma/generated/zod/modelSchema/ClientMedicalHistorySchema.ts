import { z } from 'zod';

/////////////////////////////////////////
// CLIENT MEDICAL HISTORY SCHEMA
/////////////////////////////////////////

export const ClientMedicalHistorySchema = z.object({
  id: z.string().uuid(),
  clientId: z.string(),
  condition: z.string(),
  notes: z.string().nullable(),
})

export type ClientMedicalHistory = z.infer<typeof ClientMedicalHistorySchema>

export default ClientMedicalHistorySchema;
