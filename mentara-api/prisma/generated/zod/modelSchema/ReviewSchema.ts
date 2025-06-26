import { z } from 'zod';
import { ReviewStatusSchema } from '../inputTypeSchemas/ReviewStatusSchema'

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  status: ReviewStatusSchema,
  id: z.string().uuid(),
  rating: z.number().int(),
  title: z.string().nullable(),
  content: z.string().nullable(),
  isAnonymous: z.boolean(),
  clientId: z.string(),
  therapistId: z.string(),
  meetingId: z.string().nullable(),
  moderatedBy: z.string().nullable(),
  moderatedAt: z.coerce.date().nullable(),
  moderationNote: z.string().nullable(),
  isVerified: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Review = z.infer<typeof ReviewSchema>

export default ReviewSchema;
