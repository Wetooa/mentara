import { z } from 'zod';

export const MeetingScalarFieldEnumSchema = z.enum(['id','title','description','startTime','duration','status','meetingType','meetingUrl','clientId','therapistId','createdAt','updatedAt']);

export default MeetingScalarFieldEnumSchema;
