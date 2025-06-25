import { z } from 'zod';

/////////////////////////////////////////
// REPLY HEART SCHEMA
/////////////////////////////////////////

export const ReplyHeartSchema = z.object({
  id: z.string().uuid(),
  replyId: z.string(),
  userId: z.string(),
  createdAt: z.coerce.date(),
})

export type ReplyHeart = z.infer<typeof ReplyHeartSchema>

export default ReplyHeartSchema;
