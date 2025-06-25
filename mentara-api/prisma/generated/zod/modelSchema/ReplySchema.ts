import { z } from 'zod';

/////////////////////////////////////////
// REPLY SCHEMA
/////////////////////////////////////////

export const ReplySchema = z.object({
  id: z.string().uuid(),
  commentId: z.string(),
  userId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Reply = z.infer<typeof ReplySchema>

export default ReplySchema;
