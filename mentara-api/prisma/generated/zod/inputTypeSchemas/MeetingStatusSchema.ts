import { z } from 'zod';

export const MeetingStatusSchema = z.enum(['SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW']);

export type MeetingStatusType = `${z.infer<typeof MeetingStatusSchema>}`

export default MeetingStatusSchema;
