import { z } from 'zod';

/////////////////////////////////////////
// REVIEW HELPFUL SCHEMA
/////////////////////////////////////////

export const ReviewHelpfulSchema = z.object({
  id: z.string().uuid(),
  reviewId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
})

export type ReviewHelpful = z.infer<typeof ReviewHelpfulSchema>

export default ReviewHelpfulSchema;
