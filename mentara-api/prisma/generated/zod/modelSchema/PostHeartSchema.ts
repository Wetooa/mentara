import { z } from 'zod';

/////////////////////////////////////////
// POST HEART SCHEMA
/////////////////////////////////////////

export const PostHeartSchema = z.object({
  id: z.string().uuid(),
  postId: z.string(),
  createdAt: z.coerce.date(),
  userId: z.string().nullable(),
})

export type PostHeart = z.infer<typeof PostHeartSchema>

export default PostHeartSchema;
