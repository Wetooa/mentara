import { z } from 'zod';

export const MeetingScalarFieldEnumSchema = z.enum(['id','title','description','startTime','endTime','duration','status','meetingType','meetingUrl','notes','clientId','therapistId','durationId','createdAt','updatedAt']);

export default MeetingScalarFieldEnumSchema;
