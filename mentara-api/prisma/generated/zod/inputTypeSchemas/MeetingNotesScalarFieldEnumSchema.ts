import { z } from 'zod';

export const MeetingNotesScalarFieldEnumSchema = z.enum(['id','meetingId','notes','createdAt','updatedAt']);

export default MeetingNotesScalarFieldEnumSchema;
