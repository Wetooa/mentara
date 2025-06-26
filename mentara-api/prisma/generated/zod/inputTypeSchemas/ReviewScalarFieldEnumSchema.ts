import { z } from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum(['id','rating','title','content','isAnonymous','clientId','therapistId','meetingId','status','moderatedBy','moderatedAt','moderationNote','isVerified','helpfulCount','createdAt','updatedAt']);

export default ReviewScalarFieldEnumSchema;
