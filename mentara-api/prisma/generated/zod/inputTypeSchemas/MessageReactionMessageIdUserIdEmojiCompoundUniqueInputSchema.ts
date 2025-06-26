import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema: z.ZodType<Prisma.MessageReactionMessageIdUserIdEmojiCompoundUniqueInput> = z.object({
  messageId: z.string(),
  userId: z.string(),
  emoji: z.string()
}).strict();

export default MessageReactionMessageIdUserIdEmojiCompoundUniqueInputSchema;
