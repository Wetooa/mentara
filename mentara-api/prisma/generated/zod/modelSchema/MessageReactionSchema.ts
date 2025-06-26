import { z } from 'zod';

/////////////////////////////////////////
// MESSAGE REACTION SCHEMA
/////////////////////////////////////////

export const MessageReactionSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string(),
  userId: z.string(),
  emoji: z.string(),
  createdAt: z.coerce.date(),
})

export type MessageReaction = z.infer<typeof MessageReactionSchema>

export default MessageReactionSchema;
