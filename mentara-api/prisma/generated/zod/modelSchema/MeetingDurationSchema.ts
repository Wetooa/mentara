import { z } from 'zod';

/////////////////////////////////////////
// MEETING DURATION SCHEMA
/////////////////////////////////////////

export const MeetingDurationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  duration: z.number().int(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MeetingDuration = z.infer<typeof MeetingDurationSchema>

export default MeetingDurationSchema;
