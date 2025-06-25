import { z } from 'zod';

export const TherapistAvailabilityScalarFieldEnumSchema = z.enum(['id','therapistId','dayOfWeek','startTime','endTime','isAvailable','notes','createdAt','updatedAt']);

export default TherapistAvailabilityScalarFieldEnumSchema;
