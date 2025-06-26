import { z } from 'zod';
import { MeetingStatusSchema } from '../inputTypeSchemas/MeetingStatusSchema'

/////////////////////////////////////////
// MEETING SCHEMA
/////////////////////////////////////////

export const MeetingSchema = z.object({
  status: MeetingStatusSchema,
  id: z.string().uuid(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  startTime: z.coerce.date(),
  duration: z.number().int(),
  meetingType: z.string(),
  meetingUrl: z.string().nullable(),
  clientId: z.string(),
  therapistId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Meeting = z.infer<typeof MeetingSchema>

export default MeetingSchema;
