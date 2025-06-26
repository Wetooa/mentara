import { z } from 'zod';

export const ReviewStatusSchema = z.enum(['PENDING','APPROVED','REJECTED','FLAGGED']);

export type ReviewStatusType = `${z.infer<typeof ReviewStatusSchema>}`

export default ReviewStatusSchema;
