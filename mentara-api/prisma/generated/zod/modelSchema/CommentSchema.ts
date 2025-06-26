import { z } from 'zod';

/////////////////////////////////////////
// COMMENT SCHEMA
/////////////////////////////////////////

export const CommentSchema = z.object({
  id: z.string().uuid(),
  postId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Comment = z.infer<typeof CommentSchema>

export default CommentSchema;
