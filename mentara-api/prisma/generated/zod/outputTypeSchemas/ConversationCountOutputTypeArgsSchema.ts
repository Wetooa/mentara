import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { ConversationCountOutputTypeSelectSchema } from './ConversationCountOutputTypeSelectSchema';

export const ConversationCountOutputTypeArgsSchema: z.ZodType<Prisma.ConversationCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => ConversationCountOutputTypeSelectSchema).nullish(),
}).strict();

export default ConversationCountOutputTypeSelectSchema;
