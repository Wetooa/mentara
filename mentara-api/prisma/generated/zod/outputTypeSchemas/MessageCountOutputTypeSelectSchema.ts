import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const MessageCountOutputTypeSelectSchema: z.ZodType<Prisma.MessageCountOutputTypeSelect> = z.object({
  replies: z.boolean().optional(),
  readReceipts: z.boolean().optional(),
  reactions: z.boolean().optional(),
}).strict();

export default MessageCountOutputTypeSelectSchema;
