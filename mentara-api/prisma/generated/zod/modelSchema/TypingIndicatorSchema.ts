import { z } from 'zod';

/////////////////////////////////////////
// TYPING INDICATOR SCHEMA
/////////////////////////////////////////

export const TypingIndicatorSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
  lastTypingAt: z.coerce.date(),
})

export type TypingIndicator = z.infer<typeof TypingIndicatorSchema>

export default TypingIndicatorSchema;
