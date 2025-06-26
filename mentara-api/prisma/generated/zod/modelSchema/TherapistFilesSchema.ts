import { z } from 'zod';

/////////////////////////////////////////
// THERAPIST FILES SCHEMA
/////////////////////////////////////////

export const TherapistFilesSchema = z.object({
  id: z.string(),
  therapistId: z.string(),
  fileUrl: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TherapistFiles = z.infer<typeof TherapistFilesSchema>

export default TherapistFilesSchema;
