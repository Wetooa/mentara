import { z } from 'zod';

/////////////////////////////////////////
// REPLY FILE SCHEMA
/////////////////////////////////////////

export const ReplyFileSchema = z.object({
  id: z.string().uuid(),
  replyId: z.string(),
  url: z.string(),
  type: z.string().nullable(),
})

export type ReplyFile = z.infer<typeof ReplyFileSchema>

export default ReplyFileSchema;
