import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const ConversationParticipantConversationIdUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.ConversationParticipantConversationIdUserIdCompoundUniqueInput> = z.object({
  conversationId: z.string(),
  userId: z.string()
}).strict();

export default ConversationParticipantConversationIdUserIdCompoundUniqueInputSchema;
