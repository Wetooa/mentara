import { z } from 'zod';

/////////////////////////////////////////
// MEETING NOTES SCHEMA
/////////////////////////////////////////

export const MeetingNotesSchema = z.object({
  id: z.string(),
  meetingId: z.string(),
  notes: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type MeetingNotes = z.infer<typeof MeetingNotesSchema>

export default MeetingNotesSchema;
