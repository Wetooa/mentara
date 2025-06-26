import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.TypingIndicatorConversationIdUserIdCompoundUniqueInput> = z.object({
  conversationId: z.string(),
  userId: z.string()
}).strict();

export default TypingIndicatorConversationIdUserIdCompoundUniqueInputSchema;
