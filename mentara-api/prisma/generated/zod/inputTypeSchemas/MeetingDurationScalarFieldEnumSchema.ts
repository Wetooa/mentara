import { z } from 'zod';

export const MeetingDurationScalarFieldEnumSchema = z.enum(['id','name','duration','isActive','sortOrder','createdAt','updatedAt']);

export default MeetingDurationScalarFieldEnumSchema;
