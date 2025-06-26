import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const ConversationCountOutputTypeSelectSchema: z.ZodType<Prisma.ConversationCountOutputTypeSelect> = z.object({
  participants: z.boolean().optional(),
  messages: z.boolean().optional(),
}).strict();

export default ConversationCountOutputTypeSelectSchema;
