import { z } from 'zod';

/////////////////////////////////////////
// COMMENT HEART SCHEMA
/////////////////////////////////////////

export const CommentHeartSchema = z.object({
  id: z.string().uuid(),
  commentId: z.string(),
  createdAt: z.coerce.date(),
  userId: z.string().nullable(),
})

export type CommentHeart = z.infer<typeof CommentHeartSchema>

export default CommentHeartSchema;
