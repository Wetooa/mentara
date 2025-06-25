import { z } from 'zod';

/////////////////////////////////////////
// COMMENT FILE SCHEMA
/////////////////////////////////////////

export const CommentFileSchema = z.object({
  id: z.string().uuid(),
  commentId: z.string(),
  url: z.string(),
  type: z.string().nullable(),
})

export type CommentFile = z.infer<typeof CommentFileSchema>

export default CommentFileSchema;
