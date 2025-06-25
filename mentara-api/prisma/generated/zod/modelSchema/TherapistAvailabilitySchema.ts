import { z } from 'zod';

/////////////////////////////////////////
// THERAPIST AVAILABILITY SCHEMA
/////////////////////////////////////////

export const TherapistAvailabilitySchema = z.object({
  id: z.string().uuid(),
  therapistId: z.string(),
  dayOfWeek: z.number().int(),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TherapistAvailability = z.infer<typeof TherapistAvailabilitySchema>;

export default TherapistAvailabilitySchema;
