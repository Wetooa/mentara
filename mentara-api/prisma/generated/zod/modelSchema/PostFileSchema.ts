import { z } from 'zod';

/////////////////////////////////////////
// POST FILE SCHEMA
/////////////////////////////////////////

export const PostFileSchema = z.object({
  id: z.string().uuid(),
  postId: z.string(),
  url: z.string(),
  type: z.string().nullable(),
})

export type PostFile = z.infer<typeof PostFileSchema>

export default PostFileSchema;
